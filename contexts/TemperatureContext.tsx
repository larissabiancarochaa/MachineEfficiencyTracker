// contexts/TemperatureContext.tsx
import React, { createContext, useState, ReactNode } from 'react';
import { useSupabase } from '../hooks/useSupabase';

interface TemperatureContextType {
  temperature: number | null;
  efficiency: number | null;
  temperatureHistory: number[];  // Histórico de Temperatura
  efficiencyHistory: number[];   // Histórico de Eficiência
  updateTemperature: (temp: number) => void;
  updateEfficiency: (eff: number) => void;
  addTemperatureReading: (timestamp: string, temperature: number, efficiency: number) => void;
}

const TemperatureContext = createContext<TemperatureContextType | undefined>(undefined);

export const TemperatureContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [efficiency, setEfficiency] = useState<number | null>(null);
  const [temperatureHistory, setTemperatureHistory] = useState<number[]>([]);
  const [efficiencyHistory, setEfficiencyHistory] = useState<number[]>([]);
  const { supabase } = useSupabase(); // Hook para Supabase

  const updateTemperature = (temp: number) => {
    setTemperature(temp);
    setTemperatureHistory(prev => [...prev, temp].slice(-10)); // Armazena as últimas 10 leituras
  };

  const updateEfficiency = (eff: number) => {
    setEfficiency(eff);
    setEfficiencyHistory(prev => [...prev, eff].slice(-10)); // Armazena as últimas 10 leituras
  };

  const addTemperatureReading = async (timestamp: string, temperature: number, efficiency: number) => {
    try {
      await supabase
        .from('temperature_efficiency_log')
        .insert([
          { timestamp, temperature, efficiency },
        ]);
    } catch (error) {
      console.error('Error adding temperature reading:', error);
    }
  };

  return (
    <TemperatureContext.Provider
      value={{ temperature, efficiency, temperatureHistory, efficiencyHistory, updateTemperature, updateEfficiency, addTemperatureReading }}
    >
      {children}
    </TemperatureContext.Provider>
  );
};

export const useTemperatureContext = () => {
  const context = React.useContext(TemperatureContext);
  if (!context) {
    throw new Error('useTemperatureContext must be used within a TemperatureContextProvider');
  }
  return context;
};