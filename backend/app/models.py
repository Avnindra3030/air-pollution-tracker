from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

# User Models
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Config:
        validate_by_name = True
        json_encoders = {ObjectId: str}

# Location Models
class LocationBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        validate_by_name = True
        json_encoders = {ObjectId: str}

# Air Quality Models
class AirQualityData(BaseModel):
    timestamp: datetime
    aqi: int
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None

class AirQualityHistory(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    location_id: PyObjectId
    location_name: str
    latitude: float
    longitude: float
    data: AirQualityData
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        validate_by_name = True
        json_encoders = {ObjectId: str}

# Notification Models
class NotificationType(str, Enum):
    AQI_ALERT = "aqi_alert"
    FORECAST_ALERT = "forecast_alert"
    SYSTEM = "system"

class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: NotificationType
    priority: NotificationPriority = NotificationPriority.MEDIUM
    location_name: Optional[str] = None
    aqi_value: Optional[int] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        validate_by_name = True
        json_encoders = {ObjectId: str}

# User Settings Models
class UserSettings(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    aqi_threshold: int = Field(default=100, ge=0, le=500)
    enable_notifications: bool = True
    notification_frequency: str = Field(default="daily", pattern="^(hourly|daily|weekly)$")
    preferred_units: str = Field(default="metric", pattern="^(metric|imperial)$")
    theme: str = Field(default="light", pattern="^(light|dark|auto)$")
    language: str = Field(default="en", pattern="^(en|hi|ta|te|bn|mr|gu|kn|ml|pa|or|as)$")
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        validate_by_name = True
        json_encoders = {ObjectId: str}

# API Response Models
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Forecast Models
class ForecastData(BaseModel):
    timestamp: datetime
    aqi: int
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    description: Optional[str] = None

class ForecastResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    forecast: List[ForecastData]
    generated_at: datetime = Field(default_factory=datetime.utcnow) 