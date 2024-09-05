import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LineChart from '../../components/LineChart';
import { useTemperatureContext } from '../../contexts/TemperatureContext';
import { useFetchTemperature } from '../../hooks/useFetchTemperature';
import { useColors } from '../../contexts/ThemeContext';
import ExportButton from '../../components/ExportButton';

const screenWidth = Dimensions.get('window').width;

const IndexScreen: React.FC = () => {
  const { temperature, efficiency, updateTemperature, updateEfficiency, addTemperatureReading } = useTemperatureContext();
  const { fetchTemperature } = useFetchTemperature();
  const [loading, setLoading] = useState<boolean>(false);

  const colors = useColors();

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
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Image
          source={require('../../assets/logo.png')} 
          style={styles.logo}
        />
        
        <View style={styles.cardContainer}>
          <View style={[styles.card, { backgroundColor: colors.formBackground }]}>
            <MaterialCommunityIcons name="thermometer" size={24} color={colors.sunOrange} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Temperatura Atual</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{temperature ? `${temperature}°C` : 'N/A'}</Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: colors.formBackground }]}>
            <MaterialCommunityIcons name="gauge" size={24} color={colors.green} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Eficiência da Máquina</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{efficiency ? `${efficiency}%` : 'N/A'}</Text>
          </View>
        </View>

        <LineChart />

        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonLoading, { backgroundColor: colors.buttonBackground }]}
            onPress={fetchData}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.buttonText }]}>{loading ? 'Carregando...' : 'Atualizar Dados'}</Text>
          </TouchableOpacity>
        )}
        <ExportButton />
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
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: (screenWidth * 0.9 - 60) / 2,
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
  },
  button: {
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IndexScreen;