import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.services import user_service
from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.api.v1.schemas import user as user_schema
# The test DB URL is now set via pytest.ini, but we define it here for the engine
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Create a new database session for each test.
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    Create a new TestClient for each test.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]


@pytest.fixture(scope="function")
def admin_auth_headers(client: TestClient, db_session: Session):
    """
    Create an admin user for the test module and return auth headers.
    """
    admin_user = user_service.create_user(
        db_session,
        user_schema.UserCreate(
            nom_agent="Admin Test User",
            identifiant="admin_test",
            role="admin",
            password="adminpassword",
            is_active=True,
        ),
    )

    response = client.post(
        "/auth/login",
        json={"identifiant": "admin_test", "password": "adminpassword"},
    )
    tokens = response.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers
