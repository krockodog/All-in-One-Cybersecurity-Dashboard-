"""Contract tests for OMNIUS /api/v1 auth, pentest flow, risk matrix, and websocket path."""

import os
import pytest
import requests


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")


@pytest.fixture(scope="session")
def api_base_url():
    if not BASE_URL:
        pytest.skip("REACT_APP_BACKEND_URL is not set")
    return BASE_URL.rstrip("/")


@pytest.fixture(scope="session")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def auth_payload():
    return {
        "email": "admin@omnius.local",
        "password": "change_me_admin_password",
    }


def test_auth_login_and_token_contract(api_client, api_base_url, auth_payload):
    response = api_client.post(f"{api_base_url}/api/v1/auth/login", json=auth_payload, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("accessToken"), str) and data["accessToken"]
    assert isinstance(data.get("refreshToken"), str) and data["refreshToken"]
    assert data.get("user", {}).get("email") == auth_payload["email"]


def test_protected_targets_requires_bearer(api_client, api_base_url):
    api_client.cookies.clear()
    response = api_client.get(f"{api_base_url}/api/v1/targets", timeout=10)
    assert response.status_code in (401, 403)


def test_pentest_flow_create_authorize_start_stop(api_client, api_base_url, auth_payload):
    login_response = api_client.post(f"{api_base_url}/api/v1/auth/login", json=auth_payload, timeout=10)
    assert login_response.status_code == 200
    token = login_response.json()["accessToken"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    target_payload = {
        "name": "TEST_target_contract",
        "type": "domain",
        "value": "test-contract.local",
        "tags": ["TEST"],
    }
    target_response = api_client.post(f"{api_base_url}/api/v1/targets", json=target_payload, headers=headers, timeout=10)
    assert target_response.status_code == 201
    target_data = target_response.json().get("data", {})
    assert target_data.get("name") == target_payload["name"]
    target_id = target_data.get("id")
    assert isinstance(target_id, str) and target_id

    pentest_payload = {
        "name": "TEST_pentest_contract",
        "mode": "manual",
        "targetIds": [target_id],
        "toolIds": [],
    }
    create_pentest = api_client.post(f"{api_base_url}/api/v1/pentests", json=pentest_payload, headers=headers, timeout=10)
    assert create_pentest.status_code == 201
    pentest_data = create_pentest.json().get("data", {})
    pentest_id = pentest_data.get("id")
    assert isinstance(pentest_id, str) and pentest_id

    authorize_payload = {
        "agreeToTerms": True,
        "scope": ["test-contract.local"],
        "scopeDocUrl": "https://docs.omnius.local/scope.pdf",
    }
    authorize_response = api_client.post(
        f"{api_base_url}/api/v1/pentests/{pentest_id}/authorize", json=authorize_payload, headers=headers, timeout=10
    )
    assert authorize_response.status_code == 200
    assert authorize_response.json().get("data", {}).get("authorized") == True

    start_response = api_client.post(f"{api_base_url}/api/v1/pentests/{pentest_id}/start", headers=headers, timeout=10)
    assert start_response.status_code == 200
    assert start_response.json().get("data", {}).get("status") == "running"

    stop_response = api_client.post(f"{api_base_url}/api/v1/pentests/{pentest_id}/stop", headers=headers, timeout=10)
    assert stop_response.status_code == 200
    assert stop_response.json().get("data", {}).get("status") == "stopped"


def test_risk_matrix_contract_5x5(api_client, api_base_url, auth_payload):
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


def test_websocket_endpoint_path_contract(api_client, api_base_url):
    response = api_client.get(f"{api_base_url}/ws/pentest/test-contract", timeout=10)
    assert response.status_code in (101, 400, 426)
