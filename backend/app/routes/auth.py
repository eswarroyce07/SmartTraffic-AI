from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.user_service import create_user, get_user_by_email, get_user_by_id
from app.services.auth_service import verify_password, create_access_token, get_current_user
from app.schemas import TokenData

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):
    try:
        user = await create_user(data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    doc = await get_user_by_email(data.email)
    if not doc or not verify_password(data.password, doc["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    from app.services.user_service import _serialize_user
    user = _serialize_user(doc)
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: TokenData = Depends(get_current_user)):
    user = await get_user_by_id(current_user.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/users", response_model=list[UserResponse])
async def list_users(current_user: TokenData = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    from app.database import get_users_collection, is_mongo
    from app.services.user_service import _serialize_user
    col = get_users_collection()
    if is_mongo():
        docs = []
        async for doc in col.find({}, {"hashed_password": 0}):
            doc["_id"] = str(doc["_id"])
            docs.append(_serialize_user(doc))
        return docs
    return [_serialize_user(u) for u in col]
