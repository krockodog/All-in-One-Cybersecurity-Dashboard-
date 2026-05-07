"""Contract tests for OMNIUS /api/v1 auth, pentest flow, risk matrix, and websocket path."""

import os
import pytest
import requests


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")


@pytest.fixture(scope="session")
def api_base_url() -> str:
    if not BASE_URL:
        pytest.skip("REACT_APP_BACKEND_URL is not set")
    return BASE_URL.rstrip("/")


@pytest.fixture(scope="session")
def api_client() -> requests.Session:
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def auth_payload() -> dict[str, str]:
    return {
        "email": "admin@omnius.local",
        "password": "change_me_admin_password",
    }


def test_auth_login_and_token_contract(
    api_client: requests.Session, api_base_url: str, auth_payload: dict[str, str]
) -> None:
    response = api_client.post(f"{api_base_url}/api/v1/auth/login", json=auth_payload, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("accessToken"), str) and data["accessToken"]
    assert isinstance(data.get("refreshToken"), str) and data["refreshToken"]
    assert data.get("user", {}).get("email") == auth_payload["email"]


def test_protected_targets_requires_bearer(api_client: requests.Session, api_base_url: str) -> None:
    api_client.cookies.clear()
    response = api_client.get(f"{api_base_url}/api/v1/targets", timeout=10)
    assert response.status_code in (401, 403)


@pytest.fixture
def auth_headers(
    api_client: requests.Session, api_base_url: str, auth_payload: dict[str, str]
) -> dict[str, str]:
    login_response = api_client.post(f"{api_base_url}/api/v1/auth/login", json=auth_payload, timeout=10)
    assert login_response.status_code == 200
    token = login_response.json()["accessToken"]
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def test_create_target_with_auth(
    api_client: requests.Session, api_base_url: str, auth_headers: dict[str, str]
) -> None:
    target_payload = {
        "name": "TEST_target_contract",
        "type": "domain",
        "value": "test-contract.local",
        "tags": ["TEST"],
    }
    target_response = api_client.post(
        f"{api_base_url}/api/v1/targets", json=target_payload, headers=auth_headers, timeout=10
    )
    assert target_response.status_code == 201
    target_data = target_response.json().get("data", {})
    assert target_data.get("name") == target_payload["name"]
    assert isinstance(target_data.get("id"), str) and target_data.get("id")


def _create_target(api_client: requests.Session, api_base_url: str, headers: dict[str, str]) -> str:
    target_payload = {
        "name": "TEST_target_for_pentest",
        "type": "domain",
        "value": "test-pentest.local",
        "tags": ["TEST"],
    }
    target_response = api_client.post(f"{api_base_url}/api/v1/targets", json=target_payload, headers=headers, timeout=10)
    assert target_response.status_code == 201
    target_id = target_response.json().get("data", {}).get("id")
    assert isinstance(target_id, str) and target_id
    return target_id


def _create_pentest(
    api_client: requests.Session,
    api_base_url: str,
    headers: dict[str, str],
    target_id: str,
) -> str:
    pentest_payload = {
        "name": "TEST_pentest_contract",
        "mode": "manual",
        "targetIds": [target_id],
        "toolIds": [],
    }
    create_pentest = api_client.post(f"{api_base_url}/api/v1/pentests", json=pentest_payload, headers=headers, timeout=10)
    assert create_pentest.status_code == 201
    pentest_id = create_pentest.json().get("data", {}).get("id")
    assert isinstance(pentest_id, str) and pentest_id
    return pentest_id


def test_create_pentest_with_target(
    api_client: requests.Session, api_base_url: str, auth_headers: dict[str, str]
) -> None:
    target_id = _create_target(api_client, api_base_url, auth_headers)
    pentest_id = _create_pentest(api_client, api_base_url, auth_headers, target_id)
    assert isinstance(pentest_id, str) and pentest_id


def test_authorize_start_stop_pentest(
    api_client: requests.Session, api_base_url: str, auth_headers: dict[str, str]
) -> None:
    target_id = _create_target(api_client, api_base_url, auth_headers)
    pentest_id = _create_pentest(api_client, api_base_url, auth_headers, target_id)

    authorize_payload = {
        "agreeToTerms": True,
        "scope": ["test-contract.local"],
        "scopeDocUrl": "https://docs.omnius.local/scope.pdf",
    }
    authorize_response = api_client.post(
        f"{api_base_url}/api/v1/pentests/{pentest_id}/authorize", json=authorize_payload, headers=auth_headers, timeout=10
    )
    assert authorize_response.status_code == 200
    assert authorize_response.json().get("data", {}).get("authorized")

    start_response = api_client.post(f"{api_base_url}/api/v1/pentests/{pentest_id}/start", headers=auth_headers, timeout=10)
    assert start_response.status_code == 200
    assert start_response.json().get("data", {}).get("status") == "running"

    stop_response = api_client.post(f"{api_base_url}/api/v1/pentests/{pentest_id}/stop", headers=auth_headers, timeout=10)
    assert stop_response.status_code == 200
    assert stop_response.json().get("data", {}).get("status") == "stopped"


def test_risk_matrix_contract_5x5(
    api_client: requests.Session, api_base_url: str, auth_payload: dict[str, str]
) -> None:
    login_response = api_client.post(f"{api_base_url}/api/v1/auth/login", json=auth_payload, timeout=10)
    assert login_response.status_code == 200
    token = login_response.json()["accessToken"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    response = api_client.get(f"{api_base_url}/api/v1/findings/risk-matrix", headers=headers, timeout=10)
    assert response.status_code == 200
    payload = response.json()
    matrix = payload.get("matrix")
    assert isinstance(matrix, list) and len(matrix) == 5
    assert all(isinstance(row, list) and len(row) == 5 for row in matrix)


def test_websocket_endpoint_path_contract(api_client: requests.Session, api_base_url: str) -> None:
    response = api_client.get(f"{api_base_url}/ws/pentest/test-contract", timeout=10)
    assert response.status_code in (101, 400, 426)


# Quality Status Endpoint Tests (Phase-1 Admin Code-Quality Page)
def test_quality_status_requires_auth(api_client: requests.Session, api_base_url: str) -> None:
    """Quality status endpoint should require authentication"""
    api_client.cookies.clear()
    response = api_client.get(f"{api_base_url}/api/v1/quality/status", timeout=10)
    assert response.status_code in (401, 403), f"Expected 401/403, got {response.status_code}"


def test_quality_status_returns_valid_structure(
    api_client: requests.Session, api_base_url: str, auth_headers: dict[str, str]
) -> None:
    """Quality status endpoint should return valid structured data"""
    response = api_client.get(f"{api_base_url}/api/v1/quality/status", headers=auth_headers, timeout=10)
    assert response.status_code == 200
    
    payload = response.json()
    assert "data" in payload
    data = payload["data"]
    
    # Verify updatedAt field
    assert "updatedAt" in data
    assert isinstance(data["updatedAt"], str)
    
    # Verify checks array structure
    assert "checks" in data
    assert isinstance(data["checks"], list)
    for check in data["checks"]:
        assert "id" in check
        assert "label" in check
        assert "status" in check
        assert check["status"] in ("pass", "warn", "fail")
        assert "lastRun" in check
        assert "detail" in check
    
    # Verify reviewCycles array structure
    assert "reviewCycles" in data
    assert isinstance(data["reviewCycles"], list)
    for cycle in data["reviewCycles"]:
        assert "id" in cycle
        assert "title" in cycle
        assert "status" in cycle
        assert cycle["status"] in ("pass", "warn", "fail")
        assert "critical" in cycle
        assert "important" in cycle
        assert "notes" in cycle
    
    # Verify metrics object structure
    assert "metrics" in data
    metrics = data["metrics"]
    assert "targets" in metrics
    assert "pentests" in metrics
    assert "findings" in metrics
    assert "activePentests" in metrics
    assert "criticalFindings" in metrics
    assert all(isinstance(metrics[k], int) for k in metrics)
