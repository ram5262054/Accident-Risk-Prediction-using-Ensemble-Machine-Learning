from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
from enum import Enum
import json

class Severity(Enum):
    FATAL = "Fatal"
    GRIEVOUS = "Grievous"
    MINOR = "Minor"
    DAMAGE_ONLY = "Damage Only"

class RoadType(Enum):
    NATIONAL_HIGHWAY = "NH"
    STATE_HIGHWAY = "SH"
    MAJOR_DISTRICT_ROAD = "MDR"
    OTHER_DISTRICT_ROAD = "ODR"
    VILLAGE_ROAD = "VR"
    URBAN_ROAD = "Urban"
    EXPRESSWAY = "Expressway"

class CollisionType(Enum):
    HEAD_ON = "Head-on"
    REAR_END = "Rear-end"
    SIDE_COLLISION = "Side Collision"
    HIT_PEDESTRIAN = "Hit Pedestrian"
    HIT_PARKED_VEHICLE = "Hit Parked Vehicle"
    ROLLOVER = "Rollover"
    HIT_ANIMAL = "Hit Animal"
    HIT_OBJECT = "Hit Object"
    OTHER = "Other"

class VehicleType(Enum):
    TWO_WHEELER = "Two Wheeler"
    AUTO_RICKSHAW = "Auto Rickshaw"
    CAR = "Car"
    TAXI = "Taxi"
    BUS = "Bus"
    TRUCK = "Truck"
    TRACTOR = "Tractor"
    CYCLE = "Cycle"
    OTHER = "Other"

@dataclass
class IndianAccidentRecord:
    accident_id: str
    datetime: datetime
    latitude: float
    longitude: float
    state: str
    district: str
    city: Optional[str] = None
    road_type: Optional[RoadType] = None
    road_number: Optional[str] = None
    location_description: Optional[str] = None
    severity: Severity = Severity.MINOR
    casualties: int = 0
    injuries: int = 0
    vehicles_involved: List[VehicleType] = field(default_factory=list)
    weather: Optional[str] = None
    road_condition: Optional[str] = None
    lighting: Optional[str] = None
    collision_type: Optional[CollisionType] = None
    cause: Optional[str] = None
    police_station: Optional[str] = None
    fir_number: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    def validate_coordinates(self) -> bool:
        if not (8 <= self.latitude <= 37 and 68 <= self.longitude <= 97):
            return False
        return True
    
    def to_dict(self) -> dict:
        return {
            'accident_id': self.accident_id,
            'datetime': self.datetime.isoformat(),
            'latitude': self.latitude,
            'longitude': self.longitude,
            'state': self.state,
            'district': self.district,
            'city': self.city,
            'road_type': self.road_type.value if self.road_type else None,
            'road_number': self.road_number,
            'location_description': self.location_description,
            'severity': self.severity.value,
            'casualties': self.casualties,
            'injuries': self.injuries,
            'vehicles_involved': [v.value for v in self.vehicles_involved],
            'weather': self.weather,
            'road_condition': self.road_condition,
            'lighting': self.lighting,
            'collision_type': self.collision_type.value if self.collision_type else None,
            'cause': self.cause,
            'police_station': self.police_station,
            'fir_number': self.fir_number,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)
    
    @classmethod
    def from_dict(cls, data: dict) -> 'IndianAccidentRecord':
        data_copy = data.copy()
        
        if isinstance(data_copy.get('datetime'), str):
            data_copy['datetime'] = datetime.fromisoformat(data_copy['datetime'])
        
        if isinstance(data_copy.get('created_at'), str):
            data_copy['created_at'] = datetime.fromisoformat(data_copy['created_at'])
        
        if isinstance(data_copy.get('updated_at'), str):
            data_copy['updated_at'] = datetime.fromisoformat(data_copy['updated_at'])
        
        if data_copy.get('road_type'):
            data_copy['road_type'] = RoadType(data_copy['road_type'])
        
        if data_copy.get('severity'):
            data_copy['severity'] = Severity(data_copy['severity'])
        
        if data_copy.get('collision_type'):
            data_copy['collision_type'] = CollisionType(data_copy['collision_type'])
        
        if data_copy.get('vehicles_involved'):
            data_copy['vehicles_involved'] = [VehicleType(v) for v in data_copy['vehicles_involved']]
        
        return cls(**data_copy)

@dataclass
class Hotspot:
    hotspot_id: str
    latitude: float
    longitude: float
    radius_meters: int = 500
    accident_count: int = 0
    severity_score: float = 0.0
    risk_level: str = "LOW"
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    identified_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> dict:
        return {
            'hotspot_id': self.hotspot_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'radius_meters': self.radius_meters,
            'accident_count': self.accident_count,
            'severity_score': self.severity_score,
            'risk_level': self.risk_level,
            'state': self.state,
            'district': self.district,
            'city': self.city,
            'identified_at': self.identified_at.isoformat(),
            'last_updated': self.last_updated.isoformat()
        }

class IndianStates:
    STATES = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ]
    
    @classmethod
    def validate_state(cls, state: str) -> bool:
        return state in cls.STATES
    
    @classmethod
    def normalize_state_name(cls, state: str) -> Optional[str]:
        state_lower = state.lower().strip()
        
        for valid_state in cls.STATES:
            if valid_state.lower() == state_lower:
                return valid_state
        
        state_mapping = {
            'delhi': 'Delhi',
            'mumbai': 'Maharashtra',
            'bangalore': 'Karnataka',
            'chennai': 'Tamil Nadu',
            'kolkata': 'West Bengal',
            'hyderabad': 'Telangana',
            'pune': 'Maharashtra',
            'ahmedabad': 'Gujarat'
        }
        
        return state_mapping.get(state_lower)

if __name__ == "__main__":
    sample_accident = IndianAccidentRecord(
        accident_id="DL2024001234",
        datetime=datetime(2024, 3, 15, 14, 30),
        latitude=28.6139,
        longitude=77.2090,
        state="Delhi",
        district="New Delhi",
        city="New Delhi",
        road_type=RoadType.NATIONAL_HIGHWAY,
        road_number="NH-44",
        location_description="Near ITO Junction",
        severity=Severity.GRIEVOUS,
        casualties=0,
        injuries=2,
        vehicles_involved=[VehicleType.CAR, VehicleType.TWO_WHEELER],
        weather="Clear",
        road_condition="Good",
        lighting="Daylight",
        collision_type=CollisionType.SIDE_COLLISION,
        cause="Over-speeding",
        police_station="ITO Police Station",
        fir_number="FIR/2024/001234"
    )
    
    print("Sample Indian Accident Record:")
    print(sample_accident.to_json())
    
    print(f"\nCoordinates valid: {sample_accident.validate_coordinates()}")
    
    print("\nSupported Indian States:")
    for state in IndianStates.STATES[:10]:
        print(f"  - {state}")
    print(f"  ... and {len(IndianStates.STATES) - 10} more")
