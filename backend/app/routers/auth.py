from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
from uuid import uuid4
from ..models import User, UserCreate, UserLogin, AuthResponse, UserBase
from ..database import db

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token.startswith("mock-jwt-token-"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials", 
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = token.replace("mock-jwt-token-", "")
    with db.lock:
        user = next((u for u in db.users if u["id"] == user_id), None)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

@router.post("/login", response_model=AuthResponse)
def login(creds: UserLogin):
    print(f"DEBUG: Login attempt for {creds.email}")
    with db.lock:
        user = next((u for u in db.users if u["email"] == creds.email), None)
        if user:
            print(f"DEBUG: Found user: {user['email']}, stored_password: {user['password']}, input_password: {creds.password}")
        else:
            print(f"DEBUG: User not found for email: {creds.email}")
            
        if not user or user["password"] != creds.password:
             raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
        
        return {"user": user, "token": f"mock-jwt-token-{user['id']}"}

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(creds: UserCreate):
    with db.lock:
        if any(u["email"] == creds.email for u in db.users):
            raise HTTPException(status.HTTP_409_CONFLICT, "Email already exists")
        if any(u["username"] == creds.username for u in db.users):
            raise HTTPException(status.HTTP_409_CONFLICT, "Username already taken")
        
        new_user = {
            "id": str(uuid4()),
            "username": creds.username,
            "email": creds.email,
            "password": creds.password,
            "highScore": 0,
            "gamesPlayed": 0,
            "createdAt": datetime.now()
        }
        db.users.append(new_user)
        return {"user": new_user, "token": f"mock-jwt-token-{new_user['id']}"}

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=User)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=User)
def update_me(update: UserBase, current_user: dict = Depends(get_current_user)):
    with db.lock:
        if update.email != current_user["email"] and any(u["email"] == update.email for u in db.users):
             raise HTTPException(status.HTTP_409_CONFLICT, "Email already exists")
        
        current_user["username"] = update.username
        current_user["email"] = update.email
        return current_user
