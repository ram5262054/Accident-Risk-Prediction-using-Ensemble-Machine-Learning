import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IndianFeatureEngineering:
    def __init__(self):
        self.festival_dates = self._load_festival_calendar()
        self.monsoon_months = self._load_monsoon_calendar()
        self.urban_cities = self._load_urban_classification()
    
    def _load_festival_calendar(self) -> Dict:
        return {
            'diwali': [((10, 20), (11, 15))],
            'holi': [((3, 1), (3, 31))],
            'eid': [((4, 1), (5, 31))],
            'christmas': [((12, 20), (12, 31))],
            'dussehra': [((9, 15), (10, 15))],
            'ganesh_chaturthi': [((8, 15), (9, 15))],
            'navratri': [((9, 15), (10, 15))],
            'pongal': [((1, 13), (1, 16))],
            'onam': [((8, 15), (9, 15))],
            'durga_puja': [((9, 15), (10, 15))]
        }
    
    def _load_monsoon_calendar(self) -> Dict:
        return {
            'kerala': [6, 7, 8, 9],
            'maharashtra': [6, 7, 8, 9],
            'karnataka': [6, 7, 8, 9],
            'goa': [6, 7, 8, 9],
            'delhi': [7, 8, 9],
            'uttar pradesh': [7, 8, 9],
            'rajasthan': [7, 8, 9],
            'tamil nadu': [10, 11, 12],
            'andhra pradesh': [10, 11, 12],
            'west bengal': [6, 7, 8, 9],
            'odisha': [6, 7, 8, 9],
            'assam': [6, 7, 8, 9],
            'meghalaya': [6, 7, 8, 9]
        }
    
    def _load_urban_classification(self) -> List[str]:
        return [
            'delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata',
            'hyderabad', 'pune', 'ahmedabad', 'surat', 'jaipur',
            'lucknow', 'kanpur', 'nagpur', 'indore', 'thane',
            'bhopal', 'visakhapatnam', 'pimpri-chinchwad', 'patna', 'vadodara'
        ]
    
    def check_festival_season(self, date: datetime) -> bool:
        month = date.month
        day = date.day
        
        for festival, date_ranges in self.festival_dates.items():
            for date_range in date_ranges:
                start, end = date_range
                start_month, start_day = start
                end_month, end_day = end
                
                if start_month == end_month:
                    if month == start_month and start_day <= day <= end_day:
                        return True
                else:
                    if (month == start_month and day >= start_day) or \
                       (month == end_month and day <= end_day) or \
                       (start_month < month < end_month):
                        return True
        
        return False
    
    def check_monsoon(self, date: datetime, state: str) -> bool:
        month = date.month
        state_lower = state.lower().strip()
        
        monsoon_months = self.monsoon_months.get(state_lower, [])
        return month in monsoon_months
    
    def classify_urban_rural(self, city: str) -> str:
        if not city:
            return 'rural'
        
        city_lower = city.lower().strip()
        return 'urban' if city_lower in self.urban_cities else 'rural'
    
    def encode_road_type(self, road_type: str) -> int:
        road_type_map = {
            'NH': 5,
            'Expressway': 5,
            'SH': 4,
            'MDR': 3,
            'ODR': 2,
            'VR': 1,
            'Urban': 3
        }
        return road_type_map.get(road_type, 2)
    
    def score_road_condition(self, condition: str) -> float:
        if not condition:
            return 0.5
        
        condition_lower = condition.lower()
        
        if 'good' in condition_lower or 'excellent' in condition_lower:
            return 1.0
        elif 'fair' in condition_lower or 'average' in condition_lower:
            return 0.6
        elif 'poor' in condition_lower or 'bad' in condition_lower:
            return 0.3
        elif 'construction' in condition_lower or 'repair' in condition_lower:
            return 0.2
        else:
            return 0.5
    
    def score_lighting(self, lighting: str) -> float:
        if not lighting:
            return 0.5
        
        lighting_lower = lighting.lower()
        
        if 'daylight' in lighting_lower or 'day' in lighting_lower:
            return 1.0
        elif 'street' in lighting_lower or 'lit' in lighting_lower:
            return 0.7
        elif 'dusk' in lighting_lower or 'dawn' in lighting_lower:
            return 0.4
        elif 'dark' in lighting_lower or 'unlit' in lighting_lower:
            return 0.2
        else:
            return 0.5
    
    def score_weather(self, weather: str) -> float:
        if not weather:
            return 0.5
        
        weather_lower = weather.lower()
        
        if 'clear' in weather_lower or 'sunny' in weather_lower:
            return 1.0
        elif 'cloudy' in weather_lower or 'overcast' in weather_lower:
            return 0.8
        elif 'rain' in weather_lower or 'drizzle' in weather_lower:
            return 0.4
        elif 'heavy rain' in weather_lower or 'storm' in weather_lower:
            return 0.2
        elif 'fog' in weather_lower or 'mist' in weather_lower:
            return 0.3
        elif 'snow' in weather_lower:
            return 0.1
        else:
            return 0.5
    
    def calculate_visibility_score(self, weather: str, lighting: str) -> float:
        weather_score = self.score_weather(weather)
        lighting_score = self.score_lighting(lighting)
        
        return (weather_score + lighting_score) / 2
    
    def estimate_vehicle_density(self, road_type: str, urban_rural: str, hour: int) -> float:
        base_density = 0.5
        
        if urban_rural == 'urban':
            base_density += 0.3
        
        if road_type in ['NH', 'Expressway', 'SH']:
            base_density += 0.2
        
        if 7 <= hour <= 10 or 17 <= hour <= 20:
            base_density += 0.3
        elif 22 <= hour or hour <= 5:
            base_density -= 0.3
        
        return min(1.0, max(0.0, base_density))
    
    def check_heavy_vehicles(self, vehicles: List[str]) -> bool:
        heavy_vehicle_types = ['truck', 'bus', 'tractor']
        
        if not vehicles:
            return False
        
        for vehicle in vehicles:
            if any(hv in vehicle.lower() for hv in heavy_vehicle_types):
                return True
        
        return False
    
    def extract_features(self, accident_record: Dict) -> Dict:
        dt = accident_record.get('datetime')
        if isinstance(dt, str):
            dt = datetime.fromisoformat(dt)
        
        state = accident_record.get('state', '')
        city = accident_record.get('city', '')
        road_type = accident_record.get('road_type', '')
        weather = accident_record.get('weather', '')
        lighting = accident_record.get('lighting', '')
        road_condition = accident_record.get('road_condition', '')
        vehicles = accident_record.get('vehicles_involved', [])
        
        urban_rural = self.classify_urban_rural(city)
        
        features = {
            'hour': dt.hour,
            'day_of_week': dt.weekday(),
            'month': dt.month,
            'is_weekend': 1 if dt.weekday() >= 5 else 0,
            'is_festival_season': 1 if self.check_festival_season(dt) else 0,
            'is_monsoon': 1 if self.check_monsoon(dt, state) else 0,
            
            'latitude': accident_record.get('latitude', 0.0),
            'longitude': accident_record.get('longitude', 0.0),
            'road_type_encoded': self.encode_road_type(road_type),
            'is_urban': 1 if urban_rural == 'urban' else 0,
            
            'road_condition_score': self.score_road_condition(road_condition),
            'lighting_score': self.score_lighting(lighting),
            'weather_risk_score': 1.0 - self.score_weather(weather),
            'visibility_score': self.calculate_visibility_score(weather, lighting),
            
            'vehicle_density': self.estimate_vehicle_density(road_type, urban_rural, dt.hour),
            'heavy_vehicle_present': 1 if self.check_heavy_vehicles(vehicles) else 0,
            
            'casualties': accident_record.get('casualties', 0),
            'injuries': accident_record.get('injuries', 0)
        }
        
        return features
    
    def extract_features_batch(self, accident_records: List[Dict]) -> pd.DataFrame:
        features_list = []
        
        for record in accident_records:
            try:
                features = self.extract_features(record)
                features_list.append(features)
            except Exception as e:
                logger.error(f"Error extracting features for record {record.get('accident_id')}: {e}")
                continue
        
        return pd.DataFrame(features_list)

if __name__ == "__main__":
    engineer = IndianFeatureEngineering()
    
    sample_accident = {
        'accident_id': 'DL2024001234',
        'datetime': datetime(2024, 10, 25, 18, 30),
        'latitude': 28.6139,
        'longitude': 77.2090,
        'state': 'Delhi',
        'city': 'Delhi',
        'road_type': 'NH',
        'weather': 'Clear',
        'lighting': 'Street Lit',
        'road_condition': 'Good',
        'vehicles_involved': ['Car', 'Two Wheeler'],
        'casualties': 0,
        'injuries': 2
    }
    
    logger.info("Extracting features for sample accident...")
    features = engineer.extract_features(sample_accident)
    
    logger.info("\nExtracted Features:")
    for key, value in features.items():
        logger.info(f"  {key}: {value}")
    
    logger.info(f"\nFestival season: {engineer.check_festival_season(sample_accident['datetime'])}")
    logger.info(f"Monsoon season: {engineer.check_monsoon(sample_accident['datetime'], sample_accident['state'])}")
    logger.info(f"Urban/Rural: {engineer.classify_urban_rural(sample_accident['city'])}")
