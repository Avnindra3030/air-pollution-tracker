from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_notifications_collection
from ..models import (
    NotificationCreate, NotificationResponse, APIResponse,
    NotificationType, NotificationPriority
)
from ..auth import get_current_user
from ..models import UserResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification_data: NotificationCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new notification for the current user"""
    notifications_collection = get_notifications_collection()
    
    notification_dict = notification_data.dict()
    notification_dict["user_id"] = current_user.id
    
    result = await notifications_collection.insert_one(notification_dict)
    notification_dict["_id"] = result.inserted_id
    
    return NotificationResponse(**notification_dict)

@router.get("/", response_model=List[NotificationResponse])
async def get_user_notifications(
    current_user: UserResponse = Depends(get_current_user),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    notification_type: Optional[NotificationType] = Query(None, description="Filter by notification type"),
    priority: Optional[NotificationPriority] = Query(None, description="Filter by priority"),
    limit: int = Query(50, ge=1, le=100, description="Number of notifications to return"),
    skip: int = Query(0, ge=0, description="Number of notifications to skip")
):
    """Get notifications for the current user with optional filters"""
    notifications_collection = get_notifications_collection()
    
    # Build filter
    filter_query = {"user_id": current_user.id}
    
    if is_read is not None:
        filter_query["is_read"] = is_read
    
    if notification_type:
        filter_query["notification_type"] = notification_type
    
    if priority:
        filter_query["priority"] = priority
    
    # Get notifications sorted by creation date (newest first)
    notifications = await notifications_collection.find(filter_query).sort(
        "created_at", -1
    ).skip(skip).limit(limit).to_list(length=limit)
    
    return [NotificationResponse(**notification) for notification in notifications]

@router.get("/unread-count")
async def get_unread_notifications_count(current_user: UserResponse = Depends(get_current_user)):
    """Get count of unread notifications"""
    notifications_collection = get_notifications_collection()
    
    count = await notifications_collection.count_documents({
        "user_id": current_user.id,
        "is_read": False
    })
    
    return {"unread_count": count}

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a specific notification"""
    notifications_collection = get_notifications_collection()
    
    try:
        notification = await notifications_collection.find_one({
            "_id": ObjectId(notification_id),
            "user_id": current_user.id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID"
        )
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return NotificationResponse(**notification)

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Mark a notification as read"""
    notifications_collection = get_notifications_collection()
    
    try:
        # Check if notification exists and belongs to user
        existing_notification = await notifications_collection.find_one({
            "_id": ObjectId(notification_id),
            "user_id": current_user.id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID"
        )
    
    if not existing_notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Mark as read
    await notifications_collection.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"is_read": True}}
    )
    
    # Get updated notification
    updated_notification = await notifications_collection.find_one({"_id": ObjectId(notification_id)})
    return NotificationResponse(**updated_notification)

@router.put("/mark-all-read", response_model=APIResponse)
async def mark_all_notifications_as_read(current_user: UserResponse = Depends(get_current_user)):
    """Mark all notifications as read"""
    notifications_collection = get_notifications_collection()
    
    result = await notifications_collection.update_many(
        {"user_id": current_user.id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return APIResponse(
        success=True,
        message=f"Marked {result.modified_count} notifications as read"
    )

@router.delete("/{notification_id}", response_model=APIResponse)
async def delete_notification(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a notification"""
    notifications_collection = get_notifications_collection()
    
    try:
        # Check if notification exists and belongs to user
        existing_notification = await notifications_collection.find_one({
            "_id": ObjectId(notification_id),
            "user_id": current_user.id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID"
        )
    
    if not existing_notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Delete notification
    await notifications_collection.delete_one({"_id": ObjectId(notification_id)})
    
    return APIResponse(
        success=True,
        message="Notification deleted successfully"
    )

@router.delete("/", response_model=APIResponse)
async def delete_all_notifications(
    current_user: UserResponse = Depends(get_current_user),
    is_read: Optional[bool] = Query(None, description="Delete only read/unread notifications")
):
    """Delete all notifications for the current user"""
    notifications_collection = get_notifications_collection()
    
    filter_query = {"user_id": current_user.id}
    if is_read is not None:
        filter_query["is_read"] = is_read
    
    result = await notifications_collection.delete_many(filter_query)
    
    return APIResponse(
        success=True,
        message=f"Deleted {result.deleted_count} notifications"
    )

@router.post("/bulk", response_model=List[NotificationResponse])
async def create_multiple_notifications(
    notifications_data: List[NotificationCreate],
    current_user: UserResponse = Depends(get_current_user)
):
    """Create multiple notifications at once"""
    notifications_collection = get_notifications_collection()
    
    notifications_to_insert = []
    for notification_data in notifications_data:
        notification_dict = notification_data.dict()
        notification_dict["user_id"] = current_user.id
        notifications_to_insert.append(notification_dict)
    
    result = await notifications_collection.insert_many(notifications_to_insert)
    
    # Get created notifications
    created_notifications = []
    for i, notification_dict in enumerate(notifications_to_insert):
        notification_dict["_id"] = result.inserted_ids[i]
        created_notifications.append(NotificationResponse(**notification_dict))
    
    return created_notifications 