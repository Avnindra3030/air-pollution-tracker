from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from bson import ObjectId
from typing import List

from ..database import get_users_collection, get_user_settings_collection
from ..models import (
    UserCreate, UserLogin, UserResponse, TokenResponse, 
    UserSettings, APIResponse
)
from ..auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=TokenResponse)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    users_collection = get_users_collection()
    settings_collection = get_user_settings_collection()
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    existing_username = await users_collection.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user_dict = user_data.dict()
    user_dict["password"] = get_password_hash(user_data.password)
    
    result = await users_collection.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    # Create default user settings
    default_settings = UserSettings(
        user_id=result.inserted_id,
        aqi_threshold=100,
        enable_notifications=True,
        notification_frequency="daily",
        preferred_units="metric",
        theme="light",
        language="en"
    )
    await settings_collection.insert_one(default_settings.dict())
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(result.inserted_id)}, expires_delta=access_token_expires
    )
    
    user_response = UserResponse(**user_dict)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/login", response_model=TokenResponse)
async def login_user(user_credentials: UserLogin):
    """Login user"""
    user = await authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update user profile"""
    users_collection = get_users_collection()
    
    # Check if email is already taken by another user
    if user_update.email != current_user.email:
        existing_user = await users_collection.find_one({"email": user_update.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check if username is already taken by another user
    if user_update.username != current_user.username:
        existing_username = await users_collection.find_one({"username": user_update.username})
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update user
    update_data = user_update.dict(exclude={"password"})
    if user_update.password:
        update_data["password"] = get_password_hash(user_update.password)
    
    await users_collection.update_one(
        {"_id": current_user.id},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await users_collection.find_one({"_id": current_user.id})
    return UserResponse(**updated_user)

@router.delete("/me", response_model=APIResponse)
async def delete_user_account(current_user: UserResponse = Depends(get_current_user)):
    """Delete user account"""
    users_collection = get_users_collection()
    
    await users_collection.delete_one({"_id": current_user.id})
    
    return APIResponse(
        success=True,
        message="User account deleted successfully"
    )

@router.get("/settings", response_model=UserSettings)
async def get_user_settings(current_user: UserResponse = Depends(get_current_user)):
    """Get user settings"""
    settings_collection = get_user_settings_collection()
    
    settings = await settings_collection.find_one({"user_id": current_user.id})
    if not settings:
        # Create default settings if not found
        default_settings = UserSettings(
            user_id=current_user.id,
            aqi_threshold=100,
            enable_notifications=True,
            notification_frequency="daily",
            preferred_units="metric",
            theme="light",
            language="en"
        )
        await settings_collection.insert_one(default_settings.dict())
        return default_settings
    
    return UserSettings(**settings)

@router.put("/settings", response_model=UserSettings)
async def update_user_settings(
    settings_update: UserSettings,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update user settings"""
    settings_collection = get_user_settings_collection()
    
    # Ensure user_id matches current user
    settings_update.user_id = current_user.id
    
    await settings_collection.replace_one(
        {"user_id": current_user.id},
        settings_update.dict()
    )
    
    return settings_update 