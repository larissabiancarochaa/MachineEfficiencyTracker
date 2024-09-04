import { useState } from 'react';
import { Platform } from 'react-native';
import axios, { AxiosError } from 'axios';

interface TemperatureData {
  temperature: number;
  efficiency: number;
}

const API_KEY = '7e6760b07550ac7dccad042bba033795';
const CITY = 'San Francisco';

export const useFetchTemperature = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemperature = async (): Promise<TemperatureData | null> => {
    setLoading(true);
    setError(null);
    let retries = 5; // Número de tentativas
    let delay = 10000; // Tempo inicial de espera (10 segundos)

    while (retries > 0) {
      try {
        // Diferenciar entre web e mobile, se necessário
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
        );

        const data = response.data;

        const temperature = parseFloat(data.main.temp); // Garantir que seja um número
        let efficiency = 75;
        if (temperature >= 28) {
          efficiency = 100;
        } else if (temperature >= 24) {
          efficiency = 75 + (temperature - 24) * (100 - 75) / (28 - 24);
        }

        // Retorna os dados de temperatura e eficiência
        return {
          temperature,
          efficiency,
        };
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError;
          if (axiosError.response?.status === 429) {
            retries -= 1;
            console.error('Rate limit exceeded, retrying...', { retries });
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; // Dobra o tempo de espera a cada tentativa
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