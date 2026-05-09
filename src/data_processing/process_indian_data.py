import pandas as pd
import numpy as np
from datetime import datetime
import os
import sys
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.indian_accident import IndianAccidentRecord, Severity, RoadType, CollisionType, VehicleType
from ml.indian_features import IndianFeatureEngineering

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IndianDataProcessor:
    def __init__(self):
        self.feature_engineer = IndianFeatureEngineering()
        self.min_lat, self.max_lat = 8.0, 37.0
        self.min_lon, self.max_lon = 68.0, 97.0
    
    def validate_coordinates(self, lat, lon):
        return (self.min_lat <= lat <= self.max_lat and 
                self.min_lon <= lon <= self.max_lon)
    
    def generate_realistic_indian_data(self, n_samples=50000):
        logger.info(f"Generating {n_samples} realistic Indian accident records...")
        
        indian_cities = {
            'Delhi': (28.6139, 77.2090, 'Delhi'),
            'Mumbai': (19.0760, 72.8777, 'Maharashtra'),
            'Bangalore': (12.9716, 77.5946, 'Karnataka'),
            'Chennai': (13.0827, 80.2707, 'Tamil Nadu'),
            'Kolkata': (22.5726, 88.3639, 'West Bengal'),
            'Hyderabad': (17.3850, 78.4867, 'Telangana'),
            'Pune': (18.5204, 73.8567, 'Maharashtra'),
            'Ahmedabad': (23.0225, 72.5714, 'Gujarat'),
            'Jaipur': (26.9124, 75.7873, 'Rajasthan'),
            'Lucknow': (26.8467, 80.9462, 'Uttar Pradesh')
        }
        
        records = []
        
        for i in range(n_samples):
            city_name = np.random.choice(list(indian_cities.keys()))
            base_lat, base_lon, state = indian_cities[city_name]
            
            lat = base_lat + np.random.uniform(-0.1, 0.1)
            lon = base_lon + np.random.uniform(-0.1, 0.1)
            
            year = np.random.choice([2022, 2023, 2024])
            month = np.random.randint(1, 13)
            day = np.random.randint(1, 29)
            hour_probs = np.array([0.02]*6 + [0.06]*4 + [0.04]*4 + [0.08]*4 + [0.04]*6)
            hour_probs = hour_probs / hour_probs.sum()
            hour = int(np.random.choice(range(24), p=hour_probs))
            minute = np.random.randint(0, 60)
            
            dt = datetime(year, month, day, hour, minute)
            
            severity_weights = [0.6, 0.25, 0.15]
            severity = np.random.choice([Severity.MINOR, Severity.GRIEVOUS, Severity.FATAL], p=severity_weights)
            
            casualties = 0
            injuries = 0
            if severity == Severity.FATAL:
                casualties = np.random.randint(1, 5)
                injuries = np.random.randint(0, 3)
            elif severity == Severity.GRIEVOUS:
                injuries = np.random.randint(1, 6)
            else:
                injuries = np.random.randint(0, 2)
            
            road_types = [RoadType.NATIONAL_HIGHWAY, RoadType.STATE_HIGHWAY, RoadType.URBAN_ROAD, 
                         RoadType.OTHER_DISTRICT_ROAD, RoadType.VILLAGE_ROAD]
            road_type = np.random.choice(road_types, p=[0.3, 0.25, 0.25, 0.15, 0.05])
            
            weather_options = ['Clear', 'Rain', 'Fog', 'Cloudy']
            weather = np.random.choice(weather_options, p=[0.6, 0.2, 0.1, 0.1])
            
            lighting_options = ['Daylight', 'Street Lit', 'Dusk/Dawn', 'Dark Unlit']
            if 6 <= hour <= 18:
                lighting = 'Daylight'
            elif 19 <= hour <= 23:
                lighting = np.random.choice(['Street Lit', 'Dark Unlit'], p=[0.7, 0.3])
            else:
                lighting = np.random.choice(['Street Lit', 'Dark Unlit'], p=[0.5, 0.5])
            
            road_condition = np.random.choice(['Good', 'Fair', 'Poor'], p=[0.5, 0.3, 0.2])
            
            collision_types = [CollisionType.HEAD_ON, CollisionType.REAR_END, CollisionType.SIDE_COLLISION,
                             CollisionType.HIT_PEDESTRIAN, CollisionType.ROLLOVER]
            collision_type = np.random.choice(collision_types)
            
            vehicle_types = [VehicleType.TWO_WHEELER, VehicleType.CAR, VehicleType.BUS, 
                           VehicleType.TRUCK, VehicleType.AUTO_RICKSHAW]
            n_vehicles = np.random.randint(1, 4)
            vehicles = list(np.random.choice(vehicle_types, size=n_vehicles, replace=False))
            
            district = f"{city_name} District"
            
            record = {
                'accident_id': f'IND{year}{i:06d}',
                'datetime': dt,
                'latitude': lat,
                'longitude': lon,
                'state': state,
                'district': district,
                'city': city_name,
                'road_type': road_type.value,
                'road_number': f'{road_type.value}-{np.random.randint(1, 100)}',
                'location_description': f'Near {city_name} Junction',
                'severity': severity.value,
                'casualties': casualties,
                'injuries': injuries,
                'vehicles_involved': [v.value for v in vehicles],
                'weather': weather,
                'road_condition': road_condition,
                'lighting': lighting,
                'collision_type': collision_type.value,
                'cause': np.random.choice(['Over-speeding', 'Drunk Driving', 'Signal Violation', 
                                          'Wrong Lane', 'Mechanical Failure']),
                'police_station': f'{city_name} Police Station',
                'fir_number': f'FIR/{year}/{i:06d}'
            }
            
            records.append(record)
            
            if (i + 1) % 10000 == 0:
                logger.info(f"Generated {i + 1}/{n_samples} records...")
        
        df = pd.DataFrame(records)
        logger.info(f"Generated {len(df)} records")
        return df
    
    def extract_features_from_df(self, df):
        logger.info("Extracting features...")
        
        features_list = []
        for idx, row in df.iterrows():
            try:
                features = self.feature_engineer.extract_features(row.to_dict())
                features['accident_id'] = row['accident_id']
                features['severity'] = row['severity']
                features['is_hotspot'] = row.get('is_hotspot', 0)
                features['cluster_id'] = row.get('cluster_id', -1)
                features_list.append(features)
            except Exception as e:
                logger.error(f"Error processing row {idx}: {e}")
                continue
            
            if (idx + 1) % 10000 == 0:
                logger.info(f"Processed {idx + 1}/{len(df)} records...")
        
        features_df = pd.DataFrame(features_list)
        logger.info(f"Extracted features for {len(features_df)} records")
        return features_df
    
    def create_hotspot_labels(self, df, eps_km=0.5, min_samples=10):
        logger.info("Creating hotspot labels using DBSCAN...")
        
        from sklearn.cluster import DBSCAN
        
        coords = df[['latitude', 'longitude']].values
        
        eps_degrees = eps_km / 111.0
        
        dbscan = DBSCAN(eps=eps_degrees, min_samples=min_samples, metric='euclidean')
        clusters = dbscan.fit_predict(coords)
        
        df['cluster_id'] = clusters
        df['is_hotspot'] = (clusters != -1).astype(int)
        
        n_hotspots = len(set(clusters)) - (1 if -1 in clusters else 0)
        n_hotspot_accidents = (clusters != -1).sum()
        
        logger.info(f"Identified {n_hotspots} hotspots")
        logger.info(f"{n_hotspot_accidents}/{len(df)} accidents in hotspots ({n_hotspot_accidents/len(df)*100:.1f}%)")
        
        return df
    
    def save_processed_data(self, df, features_df, output_dir='data/processed'):
        os.makedirs(output_dir, exist_ok=True)
        
        accidents_path = os.path.join(output_dir, 'indian_accidents.csv')
        df.to_csv(accidents_path, index=False)
        logger.info(f"Saved accidents to {accidents_path}")
        
        features_path = os.path.join(output_dir, 'indian_features.csv')
        features_df.to_csv(features_path, index=False)
        logger.info(f"Saved features to {features_path}")
        
        return accidents_path, features_path

if __name__ == "__main__":
    processor = IndianDataProcessor()
    
    logger.info("="*60)
    logger.info("INDIAN TRAFFIC DATA PROCESSING")
    logger.info("="*60)
    
    df = processor.generate_realistic_indian_data(n_samples=50000)
    
    df = processor.create_hotspot_labels(df)
    
    features_df = processor.extract_features_from_df(df)
    
    accidents_path, features_path = processor.save_processed_data(df, features_df)
    
    logger.info("\n" + "="*60)
    logger.info("DATA PROCESSING COMPLETE")
    logger.info("="*60)
    logger.info(f"\nAccidents file: {accidents_path}")
    logger.info(f"Features file: {features_path}")
    logger.info(f"\nTotal records: {len(df)}")
    logger.info(f"Hotspot accidents: {df['is_hotspot'].sum()}")
    logger.info(f"Features extracted: {len(features_df.columns)}")
