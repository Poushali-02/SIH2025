import requests
from dotenv import load_dotenv
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import _column_transformer
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

load_dotenv()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Request model
class LocationRequest(BaseModel):
    address: str

# Response Model
class PredictionResponse(BaseModel):
    predicted_class_pmk: int
    predicted_probability_pmk: float
    predicted_class_pmjvm: int
    predicted_probability_pmjvm: float
    predicted_class_jjm: int
    predicted_probability_jjm: float

API_KEY = os.getenv('GEOCODING_API')

if API_KEY is None:
    raise ValueError("Credentials not found in environment variables")

def get_location(API, address):
    url = f'https://api.geoapify.com/v1/geocode/search?text={address}&apiKey={API}'
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error fetching data from API: {response.status_code}")
        print(response.text)

    data = response.json()

    if 'features' in data and len(data['features']) > 0:
        coordinates = data['features'][0]['geometry']['coordinates']
        lon, lat = coordinates[0], coordinates[1]
        return np.ceil(lon), np.ceil(lat)
    else:
        raise ValueError('Geocoding failed:', data)
    
@app.post("/predict", response_model=PredictionResponse)
def make_prediction(add: LocationRequest):
    
    lon, lat = get_location(API_KEY, add)

    land_use_types = ['forest', 'agriculture', 'urban', 'wasteland', 'water', 'grassland', 'fallow']
    ownership_types = ['tribal', 'government', 'private', 'communal']
    
    pmk = joblib.load('pmk_model.pkl')
    jjm = joblib.load('jjm_model.pkl')
    pmjvm = joblib.load('pmjvm_model.pkl')

    if lat is None and lon is None:
        return PredictionResponse(
            predicted_class_pmk=0,
            predicted_probability_pmk=0.0,
            predicted_class_jjm=0,
            predicted_probability_jjm=0.0,
            predicted_class_pmjvm=0,
            predicted_probability_pmjvm=0.0
        )
    sample = {
        'latitude': lat,
        'longitude': lon,
        'land_use_type': np.random.choice(land_use_types),
        'ownership_type': np.random.choice(ownership_types),
        'tribal_area_proximity': np.random.choice([0, 1]),
        'forest_cover_pct': np.random.uniform(0, 100),
        'annual_land_change': np.random.uniform(-10, 10),
        'socio_economic_index': np.random.uniform(0, 1),
        'environmental_score': np.random.uniform(0, 1),
        'legal_restriction_zone': np.random.choice([0, 1]),
        'water_body_proximity': np.random.choice([0, 1])
    }
    
    sample_df = pd.DataFrame([sample])
    
    try:
        pred_proba_pmk = pmk.predict_proba(sample_df)[0][1]
        pred_class_pmk = pmk.predict(sample_df)[0]
        pred_proba_jjm = jjm.predict_proba(sample_df)[0][1]
        pred_class_jjm = jjm.predict(sample_df)[0]
        pred_proba_pmjvm = pmjvm.predict_proba(sample_df)[0][1]
        pred_class_pmjvm = pmjvm.predict(sample_df)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return PredictionResponse(
        predicted_class_pmk=int(pred_class_pmk),
        predicted_probability_pmk=float(pred_proba_pmk),
        predicted_class_jjm=int(pred_class_jjm),
        predicted_probability_jjm=float(pred_proba_jjm),
        predicted_class_pmjvm=int(pred_class_pmjvm),
        predicted_probability_pmjvm=float(pred_proba_pmjvm)
    )
print(make_prediction(LocationRequest(address="MG Road, Bangalore, Karnataka, India")))
