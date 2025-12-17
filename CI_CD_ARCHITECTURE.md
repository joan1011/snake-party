# CI/CD Architecture Overview

## Complete Pipeline Flow

```mermaid
graph TB
    A[Developer Push to GitHub] --> B{Branch?}
    B -->|main| C[Trigger CI/CD Pipeline]
    B -->|develop| C
    B -->|feature/*| D[Pull Request]
    D --> C
    
    C --> E[Job 1: Backend Tests]
    C --> F[Job 2: Frontend Tests]
    
    E --> E1[Setup Python 3.12]
    E1 --> E2[Start PostgreSQL Container]
    E2 --> E3[Install Dependencies uv]
    E3 --> E4[Run Migrations]
    E4 --> E5[Unit Tests SQLite]
    E5 --> E6[Integration Tests PostgreSQL]
    E6 --> E7{Tests Pass?}
    
    F --> F1[Setup Node.js 20]
    F1 --> F2[Install Dependencies npm]
    F2 --> F3[Run ESLint]
    F3 --> F4[Run Vitest Tests]
    F4 --> F5[Build Production Bundle]
    F5 --> F6{Tests Pass?}
    
    E7 -->|Yes| G[Job 3: Docker Build]
    F6 -->|Yes| G
    E7 -->|No| FAIL1[❌ Pipeline Failed]
    F6 -->|No| FAIL1
    
    G --> G1[Setup Docker Buildx]
    G1 --> G2[Build Docker Image]
    G2 --> G3{Build Success?}
    
    G3 -->|Yes| H{Branch = main?}
    G3 -->|No| FAIL2[❌ Build Failed]
    
    H -->|Yes| I[Job 4: Deploy to Render]
    H -->|No| SUCCESS1[✅ Tests Passed - No Deploy]
    
    I --> I1[Call Render API]
    I1 --> I2[Trigger Deployment]
    I2 --> I3[Render Builds Docker Image]
    I3 --> I4[Render Runs Migrations]
    I4 --> I5[Render Starts Service]
    I5 --> I6[Health Check]
    I6 --> SUCCESS2[✅ Deployed Successfully]
    
    style A fill:#e1f5ff
    style C fill:#fff4e1
    style E fill:#e8f5e9
    style F fill:#e8f5e9
    style G fill:#f3e5f5
    style I fill:#fce4ec
    style SUCCESS1 fill:#c8e6c9
    style SUCCESS2 fill:#c8e6c9
    style FAIL1 fill:#ffcdd2
    style FAIL2 fill:#ffcdd2
```

## Test Coverage

```mermaid
graph LR
    A[Test Suite] --> B[Backend: 6 Tests]
    A --> C[Frontend: 28 Tests]
    
    B --> B1[Unit Tests]
    B --> B2[Integration Tests]
    
    B1 --> B1A[API Endpoints]
    B1 --> B1B[Auth Flow]
    B1 --> B1C[Leaderboard]
    B1 --> B1D[Stats]
    
    B2 --> B2A[Full User Journey]
    B2 --> B2B[Database Integration]
    
    C --> C1[Game Logic]
    C --> C2[State Management]
    C --> C3[Collision Detection]
    
    style A fill:#e3f2fd
    style B fill:#e8f5e9
    style C fill:#fff3e0
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "GitHub"
        A[Repository]
        B[GitHub Actions]
    end
    
    subgraph "CI Pipeline"
        C[Backend Tests]
        D[Frontend Tests]
        E[Docker Build]
    end
    
    subgraph "Render Cloud"
        F[PostgreSQL Database]
        G[Web Service]
        H[Docker Container]
    end
    
    subgraph "Container"
        I[Nginx Port 80]
        J[FastAPI Port 8000]
        K[React Build]
    end
    
    A -->|Push| B
    B --> C
    B --> D
    C --> E
    D --> E
    E -->|Deploy API Call| G
    G --> H
    H --> I
    H --> J
    H --> K
    G --> F
    J -.->|Connects to| F
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#e8f5e9
    style D fill:#e8f5e9
    style E fill:#f3e5f5
    style F fill:#fce4ec
    style G fill:#fce4ec
    style H fill:#e0f2f1
```

## Environment Flow

```mermaid
graph LR
    A[Local Development] -->|git push| B[GitHub Repository]
    B -->|Auto-trigger| C[GitHub Actions]
    C -->|Tests Pass| D{Branch?}
    D -->|main| E[Production Render]
    D -->|develop| F[Staging Optional]
    D -->|feature/*| G[PR Review]
    
    E --> H[Live App]
    F --> I[Staging App]
    G --> J[Test Results]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style E fill:#c8e6c9
    style F fill:#fff9c4
    style H fill:#a5d6a7
```

## Security & Secrets Flow

```mermaid
graph TB
    A[Render Dashboard] -->|Generate| B[API Key]
    A -->|Get| C[Service ID]
    
    B --> D[GitHub Secrets]
    C --> D
    
    D --> E[RENDER_API_KEY]
    D --> F[RENDER_SERVICE_ID]
    
    E --> G[GitHub Actions Workflow]
    F --> G
    
    G -->|Authenticated API Call| H[Render API]
    H -->|Trigger| I[Deployment]
    
    style A fill:#fce4ec
    style D fill:#fff3e0
    style G fill:#e1f5ff
    style H fill:#fce4ec
    style I fill:#c8e6c9
```

## Timeline

```mermaid
gantt
    title CI/CD Pipeline Timeline
    dateFormat  ss
    axisFormat %S
    
    section Backend
    Setup Python       :00, 10s
    Install Deps       :10, 15s
    Unit Tests         :25, 5s
    Integration Tests  :30, 5s
    
    section Frontend
    Setup Node         :00, 10s
    Install Deps       :10, 20s
    Lint               :30, 3s
    Tests              :33, 3s
    Build              :36, 15s
    
    section Docker
    Build Image        :51, 60s
    
    section Deploy
    API Call           :111, 2s
    Render Build       :113, 180s
    Health Check       :293, 5s
```

**Total Pipeline Duration:** ~5-10 minutes

## Key Metrics

| Metric | Value |
|--------|-------|
| **Total Tests** | 34 (6 backend + 28 frontend) |
| **Test Duration** | ~1 second |
| **Build Duration** | ~5 minutes |
| **Deploy Duration** | ~3-5 minutes |
| **Total Pipeline** | ~8-10 minutes |
| **Success Rate** | Target: >95% |

## Monitoring Points

```mermaid
graph LR
    A[Pipeline Start] -->|Monitor| B[Test Results]
    B -->|Monitor| C[Build Status]
    C -->|Monitor| D[Deploy Status]
    D -->|Monitor| E[Health Check]
    E -->|Monitor| F[Application Logs]
    
    B -.->|Alert on Fail| G[Notification]
    C -.->|Alert on Fail| G
    D -.->|Alert on Fail| G
    E -.->|Alert on Fail| G
    
    style A fill:#e1f5ff
    style G fill:#ffcdd2
    style E fill:#c8e6c9
```

---

## Quick Stats

- **Languages:** Python, TypeScript, JavaScript
- **Frameworks:** FastAPI, React, Vite
- **Testing:** Pytest, Vitest
- **CI/CD:** GitHub Actions
- **Deployment:** Render
- **Database:** PostgreSQL
- **Container:** Docker
- **Web Server:** Nginx

---

**Last Updated:** 2025-12-17
