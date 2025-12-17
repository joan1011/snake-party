import pytest
import os
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator

from app.database import Base, get_db
from app.main import app

# Use a real file for integration tests to test persistence more realistically
TEST_DB_FILE = "./test_integration.db"
SQLALCHEMY_DATABASE_URL = f"sqlite+aiosqlite:///{TEST_DB_FILE}"

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Remove existing test DB if any
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)
    yield
    # Cleanup after tests
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = async_sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    class_=AsyncSession,
    expire_on_commit=False
)

@pytest.fixture
async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture(autouse=True)
async def init_db():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # We might want to keep data between tests in integration, or drop. 
    # Usually integration tests might depend on previous state or want clean slate.
    # Let's drop to ensure isolation per test function, similar to unit tests, 
    # unless we want a full scenario flow. 
    # Let's drop to be safe and consistent.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(override_get_db) -> AsyncGenerator[AsyncClient, None]:
    app.dependency_overrides[get_db] = lambda: override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
