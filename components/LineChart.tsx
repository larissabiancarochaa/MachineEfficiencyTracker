import React from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTemperatureContext } from '../contexts/TemperatureContext';

const screenWidth = Dimensions.get('window').width;

const LineChartComponent: React.FC = () => {
  const { temperatureHistory, efficiencyHistory } = useTemperatureContext();

  const hasData = temperatureHistory.length > 0 && efficiencyHistory.length > 0;

  const data = {
    labels: temperatureHistory.length > 0 ? temperatureHistory.map((_, index) => `${index + 1}`) : [],
    datasets: [
      {
        data: temperatureHistory,
        color: (opacity = 1) => `rgba(0, 148, 255, ${opacity})`,
        strokeWidth: 3, 
      },
      {
        data: efficiencyHistory,
        color: (opacity = 1) => `rgba(255, 159, 64, ${opacity})`, 
        strokeWidth: 3, 
      },
    ],
  };

  return (
    <View style={styles.container}>
      {hasData ? (
        <View style={styles.chartWrapper}>
          <LineChart
            data={data}
            width={Dimensions.get('window').width * 0.9 - 32} 
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: '#1e2923',
              backgroundGradientFrom: '#43cea2',
              backgroundGradientTo: '#185a9d',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, 
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, 
              style: {
                borderRadius: 16,
                elevation: 10,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#185a9d',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      ) : (
        <Text style={styles.noDataText}>Nenhum dado disponível</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  chartWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  chart: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  noDataText: {
    fontSize: 18,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default LineChartComponent;