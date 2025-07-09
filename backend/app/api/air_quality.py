from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List
import requests

router = APIRouter(prefix="/air-quality", tags=["Air Quality"])

class AirQualityResponse(BaseModel):
    aqi: int
    pm25: float
    pm10: float
    o3: float
    no2: float
    co: float
    so2: float
    timestamp: str

class ForecastResponse(BaseModel):
    forecast: List[int]
    confidence: Optional[List[float]] = None
    timestamp: str

class HistoricalDataPoint(BaseModel):
    date: str
    aqi: int
    pm25: float
    pm10: float
    o3: float
    no2: float

class HistoricalResponse(BaseModel):
    data: List[HistoricalDataPoint]

class IndianCity(BaseModel):
    name: str
    state: str
    lat: float
    lng: float
    type: str  # "district" or "town"

class IndianCitiesResponse(BaseModel):
    cities: List[IndianCity]
    total_count: int

# Comprehensive list of Indian districts and major towns
INDIAN_CITIES = [
    # Delhi NCR
    {"name": "New Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090, "type": "district"},
    {"name": "Gurgaon", "state": "Haryana", "lat": 28.4595, "lng": 77.0266, "type": "district"},
    {"name": "Noida", "state": "Uttar Pradesh", "lat": 28.5355, "lng": 77.3910, "type": "district"},
    {"name": "Faridabad", "state": "Haryana", "lat": 28.4089, "lng": 77.3178, "type": "district"},
    {"name": "Ghaziabad", "state": "Uttar Pradesh", "lat": 28.6692, "lng": 77.4538, "type": "district"},
    
    # Maharashtra
    {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777, "type": "district"},
    {"name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567, "type": "district"},
    {"name": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lng": 79.0882, "type": "district"},
    {"name": "Thane", "state": "Maharashtra", "lat": 19.2183, "lng": 72.9781, "type": "district"},
    {"name": "Nashik", "state": "Maharashtra", "lat": 19.9975, "lng": 73.7898, "type": "district"},
    {"name": "Aurangabad", "state": "Maharashtra", "lat": 19.8762, "lng": 75.3433, "type": "district"},
    {"name": "Solapur", "state": "Maharashtra", "lat": 17.6599, "lng": 75.9064, "type": "district"},
    
    # Karnataka
    {"name": "Bangalore", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946, "type": "district"},
    {"name": "Mysore", "state": "Karnataka", "lat": 12.2958, "lng": 76.6394, "type": "district"},
    {"name": "Hubli", "state": "Karnataka", "lat": 15.3647, "lng": 75.1240, "type": "district"},
    {"name": "Mangalore", "state": "Karnataka", "lat": 12.9141, "lng": 74.8560, "type": "district"},
    {"name": "Belgaum", "state": "Karnataka", "lat": 15.8497, "lng": 74.4977, "type": "district"},
    
    # Tamil Nadu
    {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707, "type": "district"},
    {"name": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lng": 76.9558, "type": "district"},
    {"name": "Madurai", "state": "Tamil Nadu", "lat": 9.9252, "lng": 78.1198, "type": "district"},
    {"name": "Salem", "state": "Tamil Nadu", "lat": 11.6643, "lng": 78.1460, "type": "district"},
    {"name": "Tiruchirappalli", "state": "Tamil Nadu", "lat": 10.7905, "lng": 78.7047, "type": "district"},
    {"name": "Vellore", "state": "Tamil Nadu", "lat": 12.9165, "lng": 79.1325, "type": "district"},
    
    # West Bengal
    {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639, "type": "district"},
    {"name": "Howrah", "state": "West Bengal", "lat": 22.5958, "lng": 88.2636, "type": "district"},
    {"name": "Durgapur", "state": "West Bengal", "lat": 23.5204, "lng": 87.3119, "type": "district"},
    {"name": "Asansol", "state": "West Bengal", "lat": 23.6889, "lng": 86.9661, "type": "district"},
    {"name": "Siliguri", "state": "West Bengal", "lat": 26.7271, "lng": 88.3953, "type": "district"},
    
    # Telangana
    {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867, "type": "district"},
    {"name": "Warangal", "state": "Telangana", "lat": 17.9689, "lng": 79.5941, "type": "district"},
    {"name": "Karimnagar", "state": "Telangana", "lat": 18.4386, "lng": 79.1288, "type": "district"},
    {"name": "Nizamabad", "state": "Telangana", "lat": 18.6725, "lng": 78.0941, "type": "district"},
    
    # Gujarat
    {"name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714, "type": "district"},
    {"name": "Surat", "state": "Gujarat", "lat": 21.1702, "lng": 72.8311, "type": "district"},
    {"name": "Vadodara", "state": "Gujarat", "lat": 22.3072, "lng": 73.1812, "type": "district"},
    {"name": "Rajkot", "state": "Gujarat", "lat": 22.3039, "lng": 70.8022, "type": "district"},
    {"name": "Bhavnagar", "state": "Gujarat", "lat": 21.7645, "lng": 72.1519, "type": "district"},
    {"name": "Jamnagar", "state": "Gujarat", "lat": 22.4707, "lng": 70.0577, "type": "district"},
    
    # Uttar Pradesh
    {"name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462, "type": "district"},
    {"name": "Kanpur", "state": "Uttar Pradesh", "lat": 26.4499, "lng": 80.3319, "type": "district"},
    {"name": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lng": 82.9739, "type": "district"},
    {"name": "Agra", "state": "Uttar Pradesh", "lat": 27.1767, "lng": 78.0081, "type": "district"},
    {"name": "Prayagraj", "state": "Uttar Pradesh", "lat": 25.4358, "lng": 81.8463, "type": "district"},
    {"name": "Bareilly", "state": "Uttar Pradesh", "lat": 28.3670, "lng": 79.4304, "type": "district"},
    {"name": "Aligarh", "state": "Uttar Pradesh", "lat": 27.8974, "lng": 78.0880, "type": "district"},
    {"name": "Moradabad", "state": "Uttar Pradesh", "lat": 28.8389, "lng": 78.7738, "type": "district"},
    
    # Rajasthan
    {"name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873, "type": "district"},
    {"name": "Jodhpur", "state": "Rajasthan", "lat": 26.2389, "lng": 73.0243, "type": "district"},
    {"name": "Kota", "state": "Rajasthan", "lat": 25.2138, "lng": 75.8648, "type": "district"},
    {"name": "Bikaner", "state": "Rajasthan", "lat": 28.0229, "lng": 73.3119, "type": "district"},
    {"name": "Ajmer", "state": "Rajasthan", "lat": 26.4499, "lng": 74.6399, "type": "district"},
    {"name": "Udaipur", "state": "Rajasthan", "lat": 24.5854, "lng": 73.7125, "type": "district"},
    
    # Andhra Pradesh
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lng": 83.2185, "type": "district"},
    {"name": "Vijayawada", "state": "Andhra Pradesh", "lat": 16.5062, "lng": 80.6480, "type": "district"},
    {"name": "Guntur", "state": "Andhra Pradesh", "lat": 16.2991, "lng": 80.4575, "type": "district"},
    {"name": "Nellore", "state": "Andhra Pradesh", "lat": 14.4426, "lng": 79.9865, "type": "district"},
    {"name": "Kurnool", "state": "Andhra Pradesh", "lat": 15.8281, "lng": 78.0373, "type": "district"},
    
    # Kerala
    {"name": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lng": 76.9366, "type": "district"},
    {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lng": 76.2673, "type": "district"},
    {"name": "Kozhikode", "state": "Kerala", "lat": 11.2588, "lng": 75.7804, "type": "district"},
    {"name": "Thrissur", "state": "Kerala", "lat": 10.5276, "lng": 76.2144, "type": "district"},
    {"name": "Kollam", "state": "Kerala", "lat": 8.8932, "lng": 76.6141, "type": "district"},
    
    # Madhya Pradesh
    {"name": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lng": 77.4126, "type": "district"},
    {"name": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lng": 75.8577, "type": "district"},
    {"name": "Jabalpur", "state": "Madhya Pradesh", "lat": 23.1815, "lng": 79.9864, "type": "district"},
    {"name": "Gwalior", "state": "Madhya Pradesh", "lat": 26.2183, "lng": 78.1828, "type": "district"},
    {"name": "Ujjain", "state": "Madhya Pradesh", "lat": 23.1765, "lng": 75.7885, "type": "district"},
    
    # Punjab
    {"name": "Ludhiana", "state": "Punjab", "lat": 30.9010, "lng": 75.8573, "type": "district"},
    {"name": "Amritsar", "state": "Punjab", "lat": 31.6340, "lng": 74.8723, "type": "district"},
    {"name": "Jalandhar", "state": "Punjab", "lat": 31.3260, "lng": 75.5762, "type": "district"},
    {"name": "Patiala", "state": "Punjab", "lat": 30.3398, "lng": 76.3869, "type": "district"},
    {"name": "Bathinda", "state": "Punjab", "lat": 30.2110, "lng": 74.9455, "type": "district"},
    
    # Haryana
    {"name": "Chandigarh", "state": "Haryana", "lat": 30.7333, "lng": 76.7794, "type": "district"},
    {"name": "Panchkula", "state": "Haryana", "lat": 30.6942, "lng": 76.8606, "type": "district"},
    {"name": "Ambala", "state": "Haryana", "lat": 30.3752, "lng": 76.7821, "type": "district"},
    {"name": "Yamunanagar", "state": "Haryana", "lat": 30.1290, "lng": 77.2674, "type": "district"},
    {"name": "Rohtak", "state": "Haryana", "lat": 28.8955, "lng": 76.6066, "type": "district"},
    
    # Bihar
    {"name": "Patna", "state": "Bihar", "lat": 25.5941, "lng": 85.1376, "type": "district"},
    {"name": "Gaya", "state": "Bihar", "lat": 24.7914, "lng": 85.0002, "type": "district"},
    {"name": "Bhagalpur", "state": "Bihar", "lat": 25.2445, "lng": 86.9718, "type": "district"},
    {"name": "Muzaffarpur", "state": "Bihar", "lat": 26.1209, "lng": 85.3647, "type": "district"},
    {"name": "Purnia", "state": "Bihar", "lat": 25.7771, "lng": 87.4753, "type": "district"},
    
    # Odisha
    {"name": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lng": 85.8245, "type": "district"},
    {"name": "Cuttack", "state": "Odisha", "lat": 20.4625, "lng": 85.8830, "type": "district"},
    {"name": "Rourkela", "state": "Odisha", "lat": 22.2492, "lng": 84.8828, "type": "district"},
    {"name": "Brahmapur", "state": "Odisha", "lat": 19.3149, "lng": 84.7941, "type": "district"},
    {"name": "Sambalpur", "state": "Odisha", "lat": 21.4704, "lng": 83.9701, "type": "district"},
    
    # Assam
    {"name": "Guwahati", "state": "Assam", "lat": 26.1445, "lng": 91.7362, "type": "district"},
    {"name": "Silchar", "state": "Assam", "lat": 24.8333, "lng": 92.7789, "type": "district"},
    {"name": "Dibrugarh", "state": "Assam", "lat": 27.4728, "lng": 95.0195, "type": "district"},
    {"name": "Jorhat", "state": "Assam", "lat": 26.7509, "lng": 94.2036, "type": "district"},
    {"name": "Nagaon", "state": "Assam", "lat": 26.3509, "lng": 92.6925, "type": "district"},
    
    # Jharkhand
    {"name": "Ranchi", "state": "Jharkhand", "lat": 23.3441, "lng": 85.3096, "type": "district"},
    {"name": "Jamshedpur", "state": "Jharkhand", "lat": 22.8046, "lng": 86.2029, "type": "district"},
    {"name": "Dhanbad", "state": "Jharkhand", "lat": 23.7957, "lng": 86.4304, "type": "district"},
    {"name": "Bokaro", "state": "Jharkhand", "lat": 23.6693, "lng": 86.1511, "type": "district"},
    {"name": "Hazaribagh", "state": "Jharkhand", "lat": 23.9924, "lng": 85.3616, "type": "district"},
    
    # Chhattisgarh
    {"name": "Raipur", "state": "Chhattisgarh", "lat": 21.2514, "lng": 81.6296, "type": "district"},
    {"name": "Bhilai", "state": "Chhattisgarh", "lat": 21.2091, "lng": 81.4285, "type": "district"},
    {"name": "Bilaspur", "state": "Chhattisgarh", "lat": 22.0796, "lng": 82.1391, "type": "district"},
    {"name": "Korba", "state": "Chhattisgarh", "lat": 22.3458, "lng": 82.6963, "type": "district"},
    {"name": "Jagdalpur", "state": "Chhattisgarh", "lat": 19.1071, "lng": 82.0218, "type": "district"},
    
    # Uttarakhand
    {"name": "Dehradun", "state": "Uttarakhand", "lat": 30.3165, "lng": 78.0322, "type": "district"},
    {"name": "Haridwar", "state": "Uttarakhand", "lat": 29.9457, "lng": 78.1642, "type": "district"},
    {"name": "Roorkee", "state": "Uttarakhand", "lat": 29.8543, "lng": 77.8880, "type": "district"},
    {"name": "Haldwani", "state": "Uttarakhand", "lat": 29.2208, "lng": 79.5286, "type": "district"},
    {"name": "Rudrapur", "state": "Uttarakhand", "lat": 28.9800, "lng": 79.4000, "type": "district"},
    
    # Himachal Pradesh
    {"name": "Shimla", "state": "Himachal Pradesh", "lat": 31.1048, "lng": 77.1734, "type": "district"},
    {"name": "Solan", "state": "Himachal Pradesh", "lat": 30.9049, "lng": 77.0965, "type": "district"},
    {"name": "Mandi", "state": "Himachal Pradesh", "lat": 31.7084, "lng": 76.9312, "type": "district"},
    {"name": "Kullu", "state": "Himachal Pradesh", "lat": 31.9578, "lng": 77.1095, "type": "district"},
    {"name": "Dharamshala", "state": "Himachal Pradesh", "lat": 32.2190, "lng": 76.3234, "type": "district"},
    
    # Jammu and Kashmir
    {"name": "Srinagar", "state": "Jammu and Kashmir", "lat": 34.0837, "lng": 74.7973, "type": "district"},
    {"name": "Jammu", "state": "Jammu and Kashmir", "lat": 32.7266, "lng": 74.8570, "type": "district"},
    {"name": "Anantnag", "state": "Jammu and Kashmir", "lat": 33.7311, "lng": 75.1486, "type": "district"},
    {"name": "Baramulla", "state": "Jammu and Kashmir", "lat": 34.2095, "lng": 74.3425, "type": "district"},
    {"name": "Udhampur", "state": "Jammu and Kashmir", "lat": 32.9242, "lng": 75.1416, "type": "district"},
    
    # Goa
    {"name": "Panaji", "state": "Goa", "lat": 15.4909, "lng": 73.8278, "type": "district"},
    {"name": "Margao", "state": "Goa", "lat": 15.2993, "lng": 73.9862, "type": "district"},
    {"name": "Vasco da Gama", "state": "Goa", "lat": 15.3800, "lng": 73.8300, "type": "district"},
    {"name": "Mapusa", "state": "Goa", "lat": 15.5915, "lng": 73.8089, "type": "district"},
    {"name": "Ponda", "state": "Goa", "lat": 15.4030, "lng": 74.0152, "type": "district"},
    
    # Manipur
    {"name": "Imphal", "state": "Manipur", "lat": 24.8170, "lng": 93.9368, "type": "district"},
    {"name": "Thoubal", "state": "Manipur", "lat": 24.6387, "lng": 93.9964, "type": "district"},
    {"name": "Bishnupur", "state": "Manipur", "lat": 24.6333, "lng": 93.7667, "type": "district"},
    
    # Meghalaya
    {"name": "Shillong", "state": "Meghalaya", "lat": 25.5788, "lng": 91.8933, "type": "district"},
    {"name": "Tura", "state": "Meghalaya", "lat": 25.5143, "lng": 90.2026, "type": "district"},
    {"name": "Jowai", "state": "Meghalaya", "lat": 25.4454, "lng": 92.2089, "type": "district"},
    
    # Nagaland
    {"name": "Kohima", "state": "Nagaland", "lat": 25.6751, "lng": 94.1086, "type": "district"},
    {"name": "Dimapur", "state": "Nagaland", "lat": 25.9117, "lng": 93.7215, "type": "district"},
    {"name": "Mokokchung", "state": "Nagaland", "lat": 26.3274, "lng": 94.5156, "type": "district"},
    
    # Tripura
    {"name": "Agartala", "state": "Tripura", "lat": 23.8315, "lng": 91.2868, "type": "district"},
    {"name": "Udaipur", "state": "Tripura", "lat": 23.5250, "lng": 91.4850, "type": "district"},
    {"name": "Dharmanagar", "state": "Tripura", "lat": 24.3667, "lng": 92.1667, "type": "district"},
    
    # Mizoram
    {"name": "Aizawl", "state": "Mizoram", "lat": 23.7307, "lng": 92.7173, "type": "district"},
    {"name": "Lunglei", "state": "Mizoram", "lat": 22.8833, "lng": 92.7333, "type": "district"},
    {"name": "Saiha", "state": "Mizoram", "lat": 22.4833, "lng": 92.9667, "type": "district"},
    
    # Arunachal Pradesh
    {"name": "Itanagar", "state": "Arunachal Pradesh", "lat": 27.0844, "lng": 93.6053, "type": "district"},
    {"name": "Naharlagun", "state": "Arunachal Pradesh", "lat": 27.1044, "lng": 93.6953, "type": "district"},
    {"name": "Pasighat", "state": "Arunachal Pradesh", "lat": 28.0667, "lng": 95.3333, "type": "district"},
    
    # Sikkim
    {"name": "Gangtok", "state": "Sikkim", "lat": 27.3389, "lng": 88.6065, "type": "district"},
    {"name": "Namchi", "state": "Sikkim", "lat": 27.1667, "lng": 88.3500, "type": "district"},
    {"name": "Mangan", "state": "Sikkim", "lat": 27.5167, "lng": 88.5333, "type": "district"},
    
    # Andaman and Nicobar Islands
    {"name": "Port Blair", "state": "Andaman and Nicobar Islands", "lat": 11.6234, "lng": 92.7265, "type": "district"},
    
    # Dadra and Nagar Haveli and Daman and Diu
    {"name": "Silvassa", "state": "Dadra and Nagar Haveli and Daman and Diu", "lat": 20.2769, "lng": 72.8787, "type": "district"},
    {"name": "Daman", "state": "Dadra and Nagar Haveli and Daman and Diu", "lat": 20.3974, "lng": 72.8328, "type": "district"},
    
    # Lakshadweep
    {"name": "Kavaratti", "state": "Lakshadweep", "lat": 10.5593, "lng": 72.6358, "type": "district"},
    
    # Puducherry
    {"name": "Puducherry", "state": "Puducherry", "lat": 11.9416, "lng": 79.8083, "type": "district"},
    {"name": "Karaikal", "state": "Puducherry", "lat": 10.9254, "lng": 79.8380, "type": "district"},
    {"name": "Mahe", "state": "Puducherry", "lat": 11.7000, "lng": 75.5333, "type": "district"},
    {"name": "Yanam", "state": "Puducherry", "lat": 16.7333, "lng": 82.2167, "type": "district"},
]

def compute_aqi_pm25(pm25):
    # Indian CPCB breakpoints for PM2.5
    breakpoints = [
        (0, 30, 0, 50),
        (31, 60, 51, 100),
        (61, 90, 101, 200),
        (91, 120, 201, 300),
        (121, 250, 301, 400),
        (251, 500, 401, 500),
    ]
    for bp_low, bp_high, i_low, i_high in breakpoints:
        if bp_low <= pm25 <= bp_high:
            return round(((i_high - i_low)/(bp_high - bp_low)) * (pm25 - bp_low) + i_low)
    return 500

def compute_aqi_pm10(pm10):
    # Indian CPCB breakpoints for PM10
    breakpoints = [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 250, 101, 200),
        (251, 350, 201, 300),
        (351, 430, 301, 400),
        (431, 600, 401, 500),
    ]
    for bp_low, bp_high, i_low, i_high in breakpoints:
        if bp_low <= pm10 <= bp_high:
            return round(((i_high - i_low)/(bp_high - bp_low)) * (pm10 - bp_low) + i_low)
    return 500

@router.get("/indian-cities", response_model=IndianCitiesResponse)
def get_indian_cities(
    state: Optional[str] = Query(None, description="Filter by state"),
    search: Optional[str] = Query(None, description="Search by city name")
):
    """Get all Indian cities with their coordinates"""
    cities = INDIAN_CITIES.copy()
    
    # Filter by state if provided
    if state:
        cities = [city for city in cities if city["state"].lower() == state.lower()]
    
    # Filter by search term if provided
    if search:
        cities = [city for city in cities if search.lower() in city["name"].lower()]
    
    return IndianCitiesResponse(
        cities=[IndianCity(**city) for city in cities],
        total_count=len(cities)
    )

@router.get("/current", response_model=AirQualityResponse)
def get_current_air_quality(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude")
):
    import random, datetime
    # Try to fetch real data from OpenAQ
    try:
        url = f"https://api.openaq.org/v2/latest?coordinates={lat},{lng}&radius=10000&limit=1"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        results = resp.json().get('results', [])
        if results:
            measurements = {m['parameter']: m['value'] for m in results[0]['measurements']}
            pm25 = measurements.get('pm25', random.uniform(10, 50))
            pm10 = measurements.get('pm10', random.uniform(15, 80))
            # Compute AQI from PM2.5 and PM10
            aqi_pm25 = compute_aqi_pm25(pm25)
            aqi_pm10 = compute_aqi_pm10(pm10)
            aqi = max(aqi_pm25, aqi_pm10)
            return AirQualityResponse(
                aqi=aqi,
                pm25=pm25,
                pm10=pm10,
                o3=measurements.get('o3', random.uniform(20, 60)),
                no2=measurements.get('no2', random.uniform(10, 40)),
                co=measurements.get('co', random.uniform(0.5, 2.5)),
                so2=measurements.get('so2', random.uniform(5, 20)),
                timestamp=results[0]['measurements'][0]['lastUpdated']
            )
    except Exception as e:
        pass  # fallback to mock data
    # Fallback to mock data
    pm25 = round(random.uniform(10, 50), 1)
    pm10 = round(random.uniform(15, 80), 1)
    aqi_pm25 = compute_aqi_pm25(pm25)
    aqi_pm10 = compute_aqi_pm10(pm10)
    aqi = max(aqi_pm25, aqi_pm10)
    return AirQualityResponse(
        aqi=aqi,
        pm25=pm25,
        pm10=pm10,
        o3=round(random.uniform(20, 60), 1),
        no2=round(random.uniform(10, 40), 1),
        co=round(random.uniform(0.5, 2.5), 2),
        so2=round(random.uniform(5, 20), 1),
        timestamp=datetime.datetime.utcnow().isoformat()
    )

@router.get("/forecast", response_model=ForecastResponse)
def get_forecast_air_quality(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude")
):
    # Mock 24-hour forecast data
    import random, datetime
    forecast = [random.randint(30, 150) for _ in range(24)]
    confidence = [round(random.uniform(0.7, 0.99), 2) for _ in range(24)]
    return ForecastResponse(
        forecast=forecast,
        confidence=confidence,
        timestamp=datetime.datetime.utcnow().isoformat()
    )

@router.get("/historical", response_model=HistoricalResponse)
def get_historical_air_quality(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    days: int = Query(7, description="Number of days of history")
):
    # Mock 7-day historical data
    import random, datetime
    data = []
    for i in range(days):
        date = (datetime.datetime.utcnow() - datetime.timedelta(days=days-1-i)).strftime('%Y-%m-%d')
        data.append(HistoricalDataPoint(
            date=date,
            aqi=random.randint(30, 150),
            pm25=round(random.uniform(10, 50), 1),
            pm10=round(random.uniform(15, 80), 1),
            o3=round(random.uniform(20, 60), 1),
            no2=round(random.uniform(10, 40), 1),
        ))
    return HistoricalResponse(data=data) 
 
 
 
 
 
 
 
 
 
 
 
 