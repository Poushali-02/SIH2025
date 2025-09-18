const API_BASE_URL = 'http://localhost:8000';

export interface PredictionResponse {
  predicted_class_pmk: number;
  predicted_probability_pmk: number;
  predicted_class_pmjvm: number;
  predicted_probability_pmjvm: number;
  predicted_class_jjm: number;
  predicted_probability_jjm: number;
}

export interface PredictionRequest {
  address: string;
}

export const getPrediction = async (address: string): Promise<PredictionResponse> => {
  console.log('Making prediction request to:', `${API_BASE_URL}/predict`);
  console.log('Request body:', { address });
  
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: PredictionResponse = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching prediction:', error);
    throw error;
  }
};