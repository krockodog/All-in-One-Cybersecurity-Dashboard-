from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import Cookie, Depends, FastAPI, Header, HTTPException, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(title="OMNIUS Runtime API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; connect-src 'self' ws: wss: http: https:; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; frame-ancestors 'none'"
    return response


class LoginInput(BaseModel):
    email: str
    password: str


class CreateTargetInput(BaseModel):
    name: str
    type: str
    value: str
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, str] = Field(default_factory=dict)


class CreatePentestInput(BaseModel):
    name: str
    mode: str
    targetIds: List[str]
    toolIds: List[str] = Field(default_factory=list)
    pipeline: List[str] = Field(default_factory=list)


class AuthorizePentestInput(BaseModel):
    agreeToTerms: bool
    scope: List[str]
    scopeDocUrl: str


class CreateFindingInput(BaseModel):
    name: str
    description: str = ""
    severity: str
    cvss: float
    epss: float
    cve: str = ""
    cwe: str = ""
    nist: str = "ID"
    tool: str
    targetId: str
    pentestId: str
    evidence: str = ""
    remediation: str = ""


admin_user = {
    "id": str(uuid4()),
    "username": "admin",
    "email": "admin@omnius.local",
    "password": "change_me_admin_password",
    "role": "admin",
}

tokens: Dict[str, Dict[str, str]] = {}
targets: Dict[str, Dict[str, Any]] = {}
pentests: Dict[str, Dict[str, Any]] = {}
findings: Dict[str, Dict[str, Any]] = {}
plugins: Dict[str, Dict[str, Any]] = {}
settings: Dict[str, Dict[str, Any]] = {
    admin_user["id"]: {
        "general": {
            "theme": "dark",
            "language": "en",
            "rateLimitRps": 5,
            "timeoutSec": 900,
            "outputVerbosity": "normal",
            "notificationsEmail": True,
            "notificationsInApp": True,
        },
        "llm": {},
        "external": {},
    }
}
audit_log: List[Dict[str, str]] = []
authorization_records: Dict[str, Dict[str, Any]] = {}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def severity_to_cell(severity: str) -> tuple[int, int]:
    mapping: Dict[str, tuple[int, int]] = {
        "critical": (4, 4),
        "high": (3, 3),
        "medium": (2, 2),
        "low": (1, 1),
        "info": (0, 0),
    }
    return mapping.get(severity, (0, 0))


def require_user(
    authorization: Optional[str] = Header(default=None),
    omnius_access_token: Optional[str] = Cookie(default=None),
) -> Dict[str, str]:
    token = ""
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
    elif omnius_access_token:
        token = omnius_access_token
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    payload = tokens.get(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


def append_audit(action: str, user_id: str, object_id: str) -> None:
    audit_log.append({"action": action, "userId": user_id, "objectId": object_id, "at": now_iso()})


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "omnius-runtime"}


@app.post("/api/v1/auth/login")
def login(payload: LoginInput, response: Response) -> Dict[str, Any]:
    if payload.email != admin_user["email"] or payload.password != admin_user["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = f"at-{uuid4()}"
    refresh_token = f"rt-{uuid4()}"
    tokens[access_token] = {
        "userId": admin_user["id"],
        "email": admin_user["email"],
        "role": admin_user["role"],
    }
    response.set_cookie(
        key="omnius_access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=86400,
        path="/",
    )
    response.set_cookie(
        key="omnius_refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800,
        path="/",
    )
    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "expiresInSec": 86400,
        "user": {
            "id": admin_user["id"],
            "username": admin_user["username"],
            "email": admin_user["email"],
            "role": admin_user["role"],
        },
    }


@app.post("/api/v1/auth/logout")
def logout(response: Response) -> Dict[str, bool]:
    response.delete_cookie(key="omnius_access_token", path="/")
    response.delete_cookie(key="omnius_refresh_token", path="/")
    return {"ok": True}


@app.get("/api/v1/auth/me")
def me(user: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    return {
        "user": {
            "id": user["userId"],
            "username": admin_user["username"],
            "email": user["email"],
            "role": user["role"],
        }
    }


@app.get("/api/v1/targets")
def list_targets(_: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    return {"data": list(targets.values())}


@app.post("/api/v1/targets", status_code=201)
def create_target(payload: CreateTargetInput, user: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    target_id = str(uuid4())
    entity = {
        "id": target_id,
        "name": payload.name,
        "type": payload.type,
        "value": payload.value,
        "tags": payload.tags,
        "metadata": payload.metadata,
        "findingsCount": 0,
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
        "userId": user["userId"],
    }
    targets[target_id] = entity
    append_audit("target.create", user["userId"], target_id)
    return {"data": entity}


@app.get("/api/v1/pentests")
def list_pentests(_: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    return {"data": list(pentests.values())}


@app.post("/api/v1/pentests", status_code=201)
def create_pentest(payload: CreatePentestInput, user: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    pentest_id = str(uuid4())
    entity = {
        "id": pentest_id,
        "name": payload.name,
        "mode": payload.mode,
        "status": "draft",
        "targetIds": payload.targetIds,
        "toolIds": payload.toolIds,
        "pipeline": payload.pipeline,
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
        "userId": user["userId"],
    }
    pentests[pentest_id] = entity
    append_audit("pentest.create", user["userId"], pentest_id)
    return {"data": entity}


@app.post("/api/v1/pentests/{pentest_id}/authorize")
def authorize_pentest(pentest_id: str, payload: AuthorizePentestInput, user: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    if pentest_id not in pentests:
        raise HTTPException(status_code=404, detail="Pentest not found")
    if not payload.agreeToTerms:
        raise HTTPException(status_code=400, detail="Terms agreement required")
    record = {
        "agreedToTerms": payload.agreeToTerms,
        "scope": payload.scope,
        "scopeDocument": payload.scopeDocUrl,
        "authorizedAt": now_iso(),
        "expiresAt": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
        "authorizedById": user["userId"],
    }
    authorization_records[pentest_id] = record
    pentests[pentest_id]["status"] = "authorized"
    pentests[pentest_id]["authorization"] = record
    pentests[pentest_id]["authorized"] = True
    pentests[pentest_id]["updatedAt"] = now_iso()
    append_audit("pentest.authorize", user["userId"], pentest_id)
    return {"data": pentests[pentest_id]}


@app.post("/api/v1/pentests/{pentest_id}/start")
def start_pentest(pentest_id: str, user: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    if pentest_id not in pentests:
        raise HTTPException(status_code=404, detail="Pentest not found")
    auth_record = authorization_records.get(pentest_id)
    if not auth_record:
        raise HTTPException(status_code=403, detail="Authorization required")
    if datetime.fromisoformat(auth_record["expiresAt"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=403, detail="Authorization expired")
    pentests[pentest_id]["status"] = "running"
    pentests[pentest_id]["startedAt"] = now_iso()
    pentests[pentest_id]["updatedAt"] = now_iso()
    append_audit("pentest.start", user["userId"], pentest_id)
    return {"data": pentests[pentest_id]}


@app.post("/api/v1/pentests/{pentest_id}/stop")
def stop_pentest(pentest_id: str, user: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    if pentest_id not in pentests:
        raise HTTPException(status_code=404, detail="Pentest not found")
    pentests[pentest_id]["status"] = "stopped"
    pentests[pentest_id]["completedAt"] = now_iso()
    pentests[pentest_id]["updatedAt"] = now_iso()
    append_audit("pentest.stop", user["userId"], pentest_id)
    return {"data": pentests[pentest_id]}


@app.get("/api/v1/findings")
def list_findings(_: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    return {"data": list(findings.values())}


@app.post("/api/v1/findings", status_code=201)
def create_finding(payload: CreateFindingInput, user: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    finding_id = str(uuid4())
    entity = payload.model_dump()
    entity.update({"id": finding_id, "status": "open", "createdAt": now_iso()})
    findings[finding_id] = entity
    if payload.targetId in targets:
        targets[payload.targetId]["findingsCount"] += 1
    append_audit("finding.create", user["userId"], finding_id)
    return {"data": entity}


@app.get("/api/v1/findings/risk-matrix")
def risk_matrix(_: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    matrix = [[0 for _ in range(5)] for _ in range(5)]
    for finding in findings.values():
        severity = str(finding.get("severity", "info"))
        x, y = severity_to_cell(severity)
        matrix[y][x] += 1
    return {
        "labels": {
            "likelihood": ["Very Unlikely", "Unlikely", "Possible", "Likely", "Almost Certain"],
            "impact": ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"],
        },
        "matrix": matrix,
    }


@app.get("/api/v1/dashboard/stats")
def dashboard_stats(_: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    data = {
        "totalPentests": len(pentests),
        "activePentests": len([item for item in pentests.values() if item.get("status") == "running"]),
        "criticalFindings": len([item for item in findings.values() if item.get("severity") == "critical"]),
        "highFindings": len([item for item in findings.values() if item.get("severity") == "high"]),
        "mediumFindings": len([item for item in findings.values() if item.get("severity") == "medium"]),
    }
    return {"data": data}


@app.get("/api/v1/users")
def list_users(_: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    return {
        "data": [
            {
                "id": admin_user["id"],
                "username": admin_user["username"],
                "email": admin_user["email"],
                "role": admin_user["role"],
            }
        ]
    }


@app.get("/api/v1/users/audit")
def user_audit(_: Dict[str, str] = Depends(require_user)) -> Dict[str, Any]:
    return {"data": audit_log}


class WebSocketHub:
    def __init__(self) -> None:
        self.clients: Dict[str, List[WebSocket]] = {}

    async def connect(self, pentest_id: str, socket: WebSocket) -> None:
        await socket.accept()
        self.clients.setdefault(pentest_id, []).append(socket)

    def disconnect(self, pentest_id: str, socket: WebSocket) -> None:
        if pentest_id not in self.clients:
            return
        self.clients[pentest_id] = [client for client in self.clients[pentest_id] if client != socket]
        if not self.clients[pentest_id]:
            self.clients.pop(pentest_id, None)


hub = WebSocketHub()


@app.websocket("/ws/pentest/{pentest_id}")
async def pentest_terminal(websocket: WebSocket, pentest_id: str) -> None:
    await hub.connect(pentest_id, websocket)
    try:
        while True:
            message = await websocket.receive_text()
            await websocket.send_json(
                {
                    "time": now_iso(),
                    "level": "info",
                    "message": f"{pentest_id}: {message}",
                }
            )
    except WebSocketDisconnect:
        hub.disconnect(pentest_id, websocket)


@app.get("/ws/pentest/{pentest_id}")
def ws_upgrade_required(pentest_id: str) -> Response:
    _ = pentest_id
    return Response(status_code=426)
