from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from uuid import uuid4
from ..models import User as UserModel
from ..schemas import User, UserCreate, UserLogin, AuthResponse, UserBase
from ..database import get_db
from ..utils import verify_password, get_password_hash

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    if not token.startswith("mock-jwt-token-"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials", 
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id_str = token.replace("mock-jwt-token-", "")
    try:
        user_id = int(user_id_str)
    except ValueError:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"}
        )

    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

@router.post("/login", response_model=AuthResponse)
async def login(creds: UserLogin, db: AsyncSession = Depends(get_db)):
    print(f"DEBUG: Login attempt for {creds.email}")
    result = await db.execute(select(UserModel).where(UserModel.email == creds.email))
    user = result.scalars().first()

    if not user:
        print(f"DEBUG: User not found for email: {creds.email}")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

    # Verify password (assuming we have hashed passwords now, but for existing/migration maybe plain?)
    # Since we just started fresh DB, we assume all new users use hash.
    if not verify_password(creds.password, user.hashed_password):
         print(f"DEBUG: Password mismatch for {creds.email}")
         raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
        
    return {"user": user, "token": f"mock-jwt-token-{user.id}"}

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(creds: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check email
    result = await db.execute(select(UserModel).where(UserModel.email == creds.email))
    if result.scalars().first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already exists")
    
    # Check username
    result = await db.execute(select(UserModel).where(UserModel.username == creds.username))
    if result.scalars().first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Username already taken")
    
    new_user = UserModel(
        username=creds.username,
        email=creds.email,
        hashed_password=get_password_hash(creds.password),
        created_at=datetime.now(),
        high_score=0,
        games_played=0
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"user": new_user, "token": f"mock-jwt-token-{new_user.id}"}

@router.post("/logout")
async def logout(current_user: UserModel = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=User)
async def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=User)
async def update_me(update: UserBase, current_user: UserModel = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if update.email != current_user.email:
         result = await db.execute(select(UserModel).where(UserModel.email == update.email))
         if result.scalars().first():
             raise HTTPException(status.HTTP_409_CONFLICT, "Email already exists")
    
    current_user.username = update.username
    current_user.email = update.email
    await db.commit()
    await db.refresh(current_user)
    return current_user
