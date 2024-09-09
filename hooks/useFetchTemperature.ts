import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { API_KEY, CITY, BASE_URL } from '../constants/api';

interface TemperatureData {
  temperature: number;
  efficiency: number;
}

export const useFetchTemperature = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemperature = async (): Promise<TemperatureData | null> => {
    setLoading(true);
    setError(null);
    let retries = 5;
    let delay = 10000;

    while (retries > 0) {
      try {
        const response = await axios.get(
          `${BASE_URL}?q=${CITY}&appid=${API_KEY}&units=metric`
        );

        const data = response.data;

        // Formata a temperatura em decimal
        const temperature = parseFloat(data.main.temp).toFixed(2);
        let efficiency = 75;
        const temperatureValue = parseFloat(temperature);

        if (temperatureValue >= 28) {
          efficiency = 100;
        } else if (temperatureValue >= 24) {
          efficiency = 75 + (temperatureValue - 24) * (100 - 75) / (28 - 24);
        }

        // Formata a eficiencia em decimal
        const formattedEfficiency = efficiency.toFixed(2);

        return {
          temperature: parseFloat(temperature),
          efficiency: parseFloat(formattedEfficiency),
        };
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError;
          if (axiosError.response?.status === 429) {
            retries -= 1;
            console.error('Rate limit exceeded, retrying...', { retries });
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            setError('Failed to fetch temperature');
            console.error('Error fetching temperature:', axiosError);
            return null;
          }
        } else {
          setError('An unexpected error occurred');
          console.error('Unexpected error:', err);
          return null;
        }
      }
    }

    setError('Failed to fetch temperature after multiple retries');
    return null;
  };

  return { fetchTemperature, loading, error };
};