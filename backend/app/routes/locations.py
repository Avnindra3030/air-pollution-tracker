from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from typing import List

from ..database import get_locations_collection
from ..models import LocationCreate, LocationResponse, APIResponse
from ..auth import get_current_user
from ..models import UserResponse

router = APIRouter(prefix="/locations", tags=["locations"])

@router.post("/", response_model=LocationResponse)
async def create_location(
    location_data: LocationCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new saved location"""
    locations_collection = get_locations_collection()
    
    # Check if location already exists for this user
    existing_location = await locations_collection.find_one({
        "user_id": current_user.id,
        "name": location_data.name
    })
    if existing_location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location with this name already exists"
        )
    
    # Create location
    location_dict = location_data.dict()
    location_dict["user_id"] = current_user.id
    
    result = await locations_collection.insert_one(location_dict)
    location_dict["_id"] = result.inserted_id
    
    return LocationResponse(**location_dict)

@router.get("/", response_model=List[LocationResponse])
async def get_user_locations(current_user: UserResponse = Depends(get_current_user)):
    """Get all saved locations for the current user"""
    locations_collection = get_locations_collection()
    
    locations = await locations_collection.find({"user_id": current_user.id}).to_list(length=100)
    return [LocationResponse(**location) for location in locations]

@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a specific saved location"""
    locations_collection = get_locations_collection()
    
    try:
        location = await locations_collection.find_one({
            "_id": ObjectId(location_id),
            "user_id": current_user.id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid location ID"
        )
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    return LocationResponse(**location)

@router.put("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: str,
    location_update: LocationCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a saved location"""
    locations_collection = get_locations_collection()
    
    try:
        # Check if location exists and belongs to user
        existing_location = await locations_collection.find_one({
            "_id": ObjectId(location_id),
            "user_id": current_user.id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid location ID"
        )
    
    if not existing_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Check if new name conflicts with other locations
    if location_update.name != existing_location["name"]:
        name_conflict = await locations_collection.find_one({
            "user_id": current_user.id,
            "name": location_update.name,
            "_id": {"$ne": ObjectId(location_id)}
        })
        if name_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Location with this name already exists"
            )
    
    # Update location
    update_data = location_update.dict()
    await locations_collection.update_one(
        {"_id": ObjectId(location_id)},
        {"$set": update_data}
    )
    
    # Get updated location
    updated_location = await locations_collection.find_one({"_id": ObjectId(location_id)})
    return LocationResponse(**updated_location)

@router.delete("/{location_id}", response_model=APIResponse)
async def delete_location(
    location_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a saved location"""
    locations_collection = get_locations_collection()
    
    try:
        # Check if location exists and belongs to user
        existing_location = await locations_collection.find_one({
            "_id": ObjectId(location_id),
            "user_id": current_user.id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid location ID"
        )
    
    if not existing_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Delete location
    await locations_collection.delete_one({"_id": ObjectId(location_id)})
    
    return APIResponse(
        success=True,
        message="Location deleted successfully"
    )

@router.post("/bulk", response_model=List[LocationResponse])
async def create_multiple_locations(
    locations_data: List[LocationCreate],
    current_user: UserResponse = Depends(get_current_user)
):
    """Create multiple saved locations at once"""
    locations_collection = get_locations_collection()
    
    # Check for name conflicts
    existing_names = await locations_collection.distinct("name", {"user_id": current_user.id})
    new_names = [loc.name for loc in locations_data]
    
    conflicts = set(existing_names) & set(new_names)
    if conflicts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Locations with these names already exist: {', '.join(conflicts)}"
        )
    
    # Create locations
    locations_to_insert = []
    for location_data in locations_data:
        location_dict = location_data.dict()
        location_dict["user_id"] = current_user.id
        locations_to_insert.append(location_dict)
    
    result = await locations_collection.insert_many(locations_to_insert)
    
    # Get created locations
    created_locations = []
    for i, location_dict in enumerate(locations_to_insert):
        location_dict["_id"] = result.inserted_ids[i]
        created_locations.append(LocationResponse(**location_dict))
    
    return created_locations 