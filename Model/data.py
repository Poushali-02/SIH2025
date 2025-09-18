import requests
from dotenv import load_dotenv
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import _column_transformer
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

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

print("Loading models...")
pmk = joblib.load('pmk_model.pkl')
jjm = joblib.load('jjm_model.pkl')
pmjvm = joblib.load('pmjvm_model.pkl')
print("Models loaded successfully")

def get_location(API, address):
    print(f"Geocoding address: {address}")
    url = f'https://api.geoapify.com/v1/geocode/search?text={address}&apiKey={API}'
    print(f"API URL: {url}")
    response = requests.get(url)
    print(f"API response status: {response.status_code}")

    if response.status_code != 200:
        print(f"Error fetching data from API: {response.status_code}")
        print(response.text)
        raise ValueError(f"API error: {response.status_code}")

    data = response.json()
    print(f"API response data keys: {list(data.keys())}")

    if 'features' in data and len(data['features']) > 0:
        coordinates = data['features'][0]['geometry']['coordinates']
        lon, lat = coordinates[0], coordinates[1]
        print(f"Coordinates: lon={lon}, lat={lat}")
        return np.ceil(lon), np.ceil(lat)
    else:
        print(f"Geocoding failed, data: {data}")
        raise ValueError('Geocoding failed:', data)
    
@app.post("/predict", response_model=PredictionResponse)
def make_prediction(add: LocationRequest):
    print(f"Received request for address: {add.address}")
    
    lon, lat = get_location(API_KEY, add.address)
    print(f"Geocoded coordinates: lat={lat}, lon={lon}")
    
    sample = {
        'latitude': lat,
        'longitude': lon,
        'land_use_type': 'urban',
        'ownership_type': 'private',
        'tribal_area_proximity': 0,
        'forest_cover_pct': 50.0,
        'annual_land_change': 0.0,
        'socio_economic_index': 0.5,
        'environmental_score': 0.5,
        'legal_restriction_zone': 0,
        'water_body_proximity': 0
    }
    
    sample_df = pd.DataFrame([sample])
    print(f"Sample data: {sample}")
    
    try:
        pred_proba_pmk = pmk.predict_proba(sample_df)[0][1]
        pred_class_pmk = pmk.predict(sample_df)[0]
        pred_proba_jjm = jjm.predict_proba(sample_df)[0][1]
        pred_class_jjm = jjm.predict(sample_df)[0]
        pred_proba_pmjvm = pmjvm.predict_proba(sample_df)[0][1]
        pred_class_pmjvm = pmjvm.predict(sample_df)[0]
        print(f"Predictions: PMK={pred_class_pmk} ({pred_proba_pmk}), JJM={pred_class_jjm} ({pred_proba_jjm}), PMJVM={pred_class_pmjvm} ({pred_proba_pmjvm})")
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return PredictionResponse(
        predicted_class_pmk=int(pred_class_pmk),
        predicted_probability_pmk=float(pred_proba_pmk),
        predicted_class_jjm=int(pred_class_jjm),
        predicted_probability_jjm=float(pred_proba_jjm),
        predicted_class_pmjvm=int(pred_class_pmjvm),
        predicted_probability_pmjvm=float(pred_proba_pmjvm)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
