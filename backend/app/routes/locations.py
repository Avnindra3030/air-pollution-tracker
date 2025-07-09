from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from typing import List, Optional

from ..database import get_locations_collection
from ..models import LocationCreate, LocationResponse, APIResponse
from ..auth import get_current_user
from ..models import UserResponse

router = APIRouter(prefix="/locations", tags=["locations"])

@router.get("/search")
async def search_locations(q: str = Query(..., description="Search query")):
    """Search for locations/cities"""
    # This is a simple implementation - in a real app, you might use a geocoding service
    # For now, we'll return some popular cities that match the query
    
    popular_cities = [
        {"name": "New York, NY", "lat": 40.7128, "lng": -74.0060},
        {"name": "Los Angeles, CA", "lat": 34.0522, "lng": -118.2437},
        {"name": "Chicago, IL", "lat": 41.8781, "lng": -87.6298},
        {"name": "Houston, TX", "lat": 29.7604, "lng": -95.3698},
        {"name": "Phoenix, AZ", "lat": 33.4484, "lng": -112.0740},
        {"name": "Philadelphia, PA", "lat": 39.9526, "lng": -75.1652},
        {"name": "San Antonio, TX", "lat": 29.4241, "lng": -98.4936},
        {"name": "San Diego, CA", "lat": 32.7157, "lng": -117.1611},
        {"name": "Dallas, TX", "lat": 32.7767, "lng": -96.7970},
        {"name": "San Jose, CA", "lat": 37.3382, "lng": -121.8863},
        {"name": "Austin, TX", "lat": 30.2672, "lng": -97.7431},
        {"name": "Jacksonville, FL", "lat": 30.3322, "lng": -81.6557},
        {"name": "Fort Worth, TX", "lat": 32.7555, "lng": -97.3308},
        {"name": "Columbus, OH", "lat": 39.9612, "lng": -82.9988},
        {"name": "Charlotte, NC", "lat": 35.2271, "lng": -80.8431},
        {"name": "San Francisco, CA", "lat": 37.7749, "lng": -122.4194},
        {"name": "Indianapolis, IN", "lat": 39.7684, "lng": -86.1581},
        {"name": "Seattle, WA", "lat": 47.6062, "lng": -122.3321},
        {"name": "Denver, CO", "lat": 39.7392, "lng": -104.9903},
        {"name": "Washington, DC", "lat": 38.9072, "lng": -77.0369},
        {"name": "Delhi, India", "lat": 28.6139, "lng": 77.2090},
        {"name": "Mumbai, India", "lat": 19.0760, "lng": 72.8777},
        {"name": "Bangalore, India", "lat": 12.9716, "lng": 77.5946},
        {"name": "Chennai, India", "lat": 13.0827, "lng": 80.2707},
        {"name": "Kolkata, India", "lat": 22.5726, "lng": 88.3639},
        {"name": "Hyderabad, India", "lat": 17.3850, "lng": 78.4867},
        {"name": "Ahmedabad, India", "lat": 23.0225, "lng": 72.5714},
        {"name": "Pune, India", "lat": 18.5204, "lng": 73.8567},
        {"name": "Jaipur, India", "lat": 26.9124, "lng": 75.7873},
        {"name": "Lucknow, India", "lat": 26.8467, "lng": 80.9462},
        {"name": "London, UK", "lat": 51.5074, "lng": -0.1278},
        {"name": "Tokyo, Japan", "lat": 35.6762, "lng": 139.6503},
        {"name": "Paris, France", "lat": 48.8566, "lng": 2.3522},
        {"name": "Beijing, China", "lat": 39.9042, "lng": 116.4074},
        {"name": "Sydney, Australia", "lat": -33.8688, "lng": 151.2093},
        {"name": "Toronto, Canada", "lat": 43.6532, "lng": -79.3832},
        {"name": "Berlin, Germany", "lat": 52.5200, "lng": 13.4050},
        {"name": "Madrid, Spain", "lat": 40.4168, "lng": -3.7038},
        {"name": "Rome, Italy", "lat": 41.9028, "lng": 12.4964},
        {"name": "Amsterdam, Netherlands", "lat": 52.3676, "lng": 4.9041},
        {"name": "Vienna, Austria", "lat": 48.2082, "lng": 16.3738},
        {"name": "Stockholm, Sweden", "lat": 59.3293, "lng": 18.0686},
        {"name": "Oslo, Norway", "lat": 59.9139, "lng": 10.7522},
        {"name": "Copenhagen, Denmark", "lat": 55.6761, "lng": 12.5683},
        {"name": "Helsinki, Finland", "lat": 60.1699, "lng": 24.9384},
        {"name": "Zurich, Switzerland", "lat": 47.3769, "lng": 8.5417},
        {"name": "Brussels, Belgium", "lat": 50.8503, "lng": 4.3517},
        {"name": "Dublin, Ireland", "lat": 53.3498, "lng": -6.2603},
        {"name": "Lisbon, Portugal", "lat": 38.7223, "lng": -9.1393},
        {"name": "Athens, Greece", "lat": 37.9838, "lng": 23.7275},
        {"name": "Prague, Czech Republic", "lat": 50.0755, "lng": 14.4378},
        {"name": "Budapest, Hungary", "lat": 47.4979, "lng": 19.0402},
        {"name": "Warsaw, Poland", "lat": 52.2297, "lng": 21.0122},
        {"name": "Bucharest, Romania", "lat": 44.4268, "lng": 26.1025},
        {"name": "Sofia, Bulgaria", "lat": 42.6977, "lng": 23.3219},
        {"name": "Belgrade, Serbia", "lat": 44.7866, "lng": 20.4489},
        {"name": "Zagreb, Croatia", "lat": 45.8150, "lng": 15.9819},
        {"name": "Ljubljana, Slovenia", "lat": 46.0569, "lng": 14.5058},
        {"name": "Bratislava, Slovakia", "lat": 48.1486, "lng": 17.1077},
        {"name": "Vilnius, Lithuania", "lat": 54.6872, "lng": 25.2797},
        {"name": "Riga, Latvia", "lat": 56.9496, "lng": 24.1052},
        {"name": "Tallinn, Estonia", "lat": 59.4370, "lng": 24.7536},
    ]
    
    # Filter cities based on search query
    query_lower = q.lower()
    matching_cities = [
        city for city in popular_cities 
        if query_lower in city["name"].lower()
    ]
    
    return matching_cities

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
    location_data: LocationCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a saved location"""
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
    
    # Update location
    update_data = location_data.dict()
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
        result = await locations_collection.delete_one({
            "_id": ObjectId(location_id),
            "user_id": current_user.id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid location ID"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
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