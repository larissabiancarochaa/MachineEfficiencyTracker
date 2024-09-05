import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LineChart from '../../components/LineChart';
import { useTemperatureContext } from '../../contexts/TemperatureContext';
import { useFetchTemperature } from '../../hooks/useFetchTemperature';

const screenWidth = Dimensions.get('window').width;

const IndexScreen: React.FC = () => {
  const { temperature, efficiency, updateTemperature, updateEfficiency, addTemperatureReading } = useTemperatureContext();
  const { fetchTemperature } = useFetchTemperature();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchTemperature();
      console.log('Fetched data:', data);
      if (data) {
        updateTemperature(data.temperature);
        updateEfficiency(data.efficiency);
        const timestamp = new Date().toISOString();
        await addTemperatureReading(timestamp, data.temperature, data.efficiency);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = Platform.OS === 'web' ? 60000 : 600000;

    const fetchDataInterval = setInterval(fetchData, interval);

    return () => clearInterval(fetchDataInterval);
  }, []);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Image
          source={require('../../assets/logo.png')} 
          style={styles.logo}
        />
        
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <MaterialCommunityIcons name="thermometer" size={24} color="#185a9d" />
            <Text style={styles.cardTitle}>Temperatura Atual</Text>
            <Text style={styles.cardValue}>{temperature ? `${temperature}°C` : 'N/A'}</Text>
          </View>
          
          <View style={styles.card}>
            <MaterialCommunityIcons name="gauge" size={24} color="#43cea2" />
            <Text style={styles.cardTitle}>Eficiência da Máquina</Text>
            <Text style={styles.cardValue}>{efficiency ? `${efficiency}%` : 'N/A'}</Text>
          </View>
        </View>

        <LineChart />

        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonLoading]}
            onPress={fetchData}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Atualizar Dados'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '90%',
    padding: 20,
  },
  logo: {
    width: 150, 
    height: 100, 
    resizeMode: 'contain', 
    marginBottom: 10, 
    alignSelf: 'center', 
  },
  companyName: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    marginBottom: 40,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: (screenWidth * 0.9 - 60) / 2,
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 24,
    color: '#333',
  },
  button: {
    backgroundColor: '#185a9d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonLoading: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IndexScreen;