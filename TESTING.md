# Testing Guide

This document describes the testing setup for Snake Party.

## Test Structure

```
backend/
├── tests/                    # Unit tests (SQLite in-memory)
│   ├── conftest.py          # Test fixtures and setup
│   └── test_main.py         # API endpoint tests
└── tests_integration/        # Integration tests (SQLite file-based)
    ├── conftest.py          # Integration test fixtures
    └── test_integration.py  # Full user journey tests

frontend/
└── src/
    └── game/
        └── gameLogic.test.ts  # Game logic unit tests (28 tests)
```

## Backend Tests

### Unit Tests (`tests/`)

**Database:** SQLite in-memory (`:memory:`)
**Purpose:** Fast, isolated tests for individual endpoints

**Tests:**
- ✅ Root endpoint
- ✅ Auth flow (signup, login, get user)
- ✅ Leaderboard retrieval
- ✅ Score submission
- ✅ Global stats

**Run:**
```bash
cd backend
uv run pytest tests/ -v
```

### Integration Tests (`tests_integration/`)

**Database:** SQLite file-based (`test_integration.db`)
**Purpose:** Test complete user workflows

**Tests:**
- ✅ Full game lifecycle (signup → login → profile update → score submission → leaderboard verification → stats)

**Run:**
```bash
cd backend
uv run pytest tests_integration/ -v
```

### Run All Backend Tests

```bash
cd backend
uv run pytest tests/ tests_integration/ -v
```

**Expected Output:**
```
============================== test session starts ==============================
collected 6 items

tests/test_main.py::test_read_main PASSED                                [ 16%]
tests/test_main.py::test_auth_flow PASSED                                [ 33%]
tests/test_main.py::test_leaderboard PASSED                              [ 50%]
tests/test_main.py::test_submit_score PASSED                             [ 66%]
tests/test_main.py::test_stats PASSED                                    [ 83%]
tests_integration/test_integration.py::test_full_game_lifecycle PASSED   [100%]

============================== 6 passed in X.XXs ===============================
```

## Frontend Tests

### Game Logic Tests

**Framework:** Vitest
**Purpose:** Test core game mechanics

**Tests (28 total):**
- ✅ Initial state creation
- ✅ Food generation
- ✅ Direction validation
- ✅ Snake movement
- ✅ Collision detection
- ✅ Game state management
- ✅ Mode switching

**Run:**
```bash
cd frontend
npm run test
```

**Run Once (CI mode):**
```bash
cd frontend
npm run test -- --run
```

**Expected Output:**
```
✓ src/game/gameLogic.test.ts (28 tests) 13ms

Test Files  1 passed (1)
     Tests  28 passed (28)
```

## CI/CD Integration

The GitHub Actions pipeline automatically runs all tests:

1. **Backend Unit Tests** (SQLite in-memory)
2. **Backend Integration Tests** (PostgreSQL container)
3. **Frontend Tests** (Vitest)
4. **Frontend Build** (validates production build)
5. **Docker Build** (validates container build)

See [CI_CD_SETUP.md](./CI_CD_SETUP.md) for details.

## Test Coverage

### Backend Coverage
- **Auth:** Signup, login, get user, update profile
- **Leaderboard:** Get leaderboard, submit scores
- **Stats:** Global stats, user stats
- **Health:** Database connectivity

### Frontend Coverage
- **Game Logic:** All core mechanics
- **State Management:** Game states (idle, playing, paused, game-over)
- **Collision Detection:** Walls, self-collision, food
- **Modes:** Pass-through and walls modes

## Adding New Tests

### Backend Test

Create a new test in `backend/tests/test_*.py`:

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_my_feature(client: AsyncClient):
    response = await client.get("/api/my-endpoint")
    assert response.status_code == 200
```

### Frontend Test

Create a new test in `frontend/src/**/*.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

## Test Configuration

### Backend (`backend/pyproject.toml`)

```toml
[tool.pytest.ini_options]
pythonpath = "."
asyncio_mode = "auto"
asyncio_default_fixture_loop_scope = "function"
filterwarnings = [
    "ignore::DeprecationWarning:passlib.*",
    "ignore:Support for class-based `config` is deprecated:DeprecationWarning"
]
```

### Frontend (`frontend/vitest.config.ts`)

Configured to use jsdom environment for React component testing.

## Troubleshooting

### Backend Tests Fail

**Issue:** Database connection errors
**Fix:**
```bash
cd backend
rm -f test_integration.db sql_app.db
uv run pytest tests/ -v
```

**Issue:** Import errors
**Fix:**
```bash
cd backend
uv sync --all-groups
```

### Frontend Tests Fail

**Issue:** Module not found
**Fix:**
```bash
cd frontend
npm install
```

**Issue:** Tests timeout
**Fix:** Increase timeout in `vitest.config.ts`

## Continuous Testing

### Watch Mode (Development)

**Backend:**
```bash
cd backend
uv run pytest tests/ --watch
```

**Frontend:**
```bash
cd frontend
npm run test  # Runs in watch mode by default
```

## Test Best Practices

1. ✅ **Isolation:** Each test should be independent
2. ✅ **Clean State:** Use fixtures to reset database
3. ✅ **Descriptive Names:** Test names should describe what they test
4. ✅ **Fast:** Keep tests fast (< 1s per test)
5. ✅ **Coverage:** Test happy paths and error cases

---

**Total Test Count:** 34 tests (6 backend + 28 frontend)
**All tests passing:** ✅
