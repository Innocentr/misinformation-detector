from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select # Use SQLModel Session
from app.api import deps
from app.core import security
from app.core.security import get_password_hash
from app.models import User, Token, UserCreate, UserPublic
router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    statement = select(User).where(User.username == form_data.username)
    user = db.exec(statement).first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Incorrect username or password"
        )
    
    # tore user ID in JWT subject
    access_token = security.create_access_token(subject=str(user.id))
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserPublic)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate
):
    """
    Vantage AI: Register a new account.
    """
    # Check if user already exists
    user = db.exec(select(User).where(User.username == user_in.username)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    # Create new user with hashed password
    db_obj = User(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        is_superuser=False # Default to standard user
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj