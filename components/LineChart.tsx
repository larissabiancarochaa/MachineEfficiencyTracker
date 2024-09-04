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
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: efficiencyHistory,
        color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      {hasData ? (
        <LineChart
          data={data}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffffff',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            ...(Platform.OS === 'web' ? { maxWidth: '100%' } : {}), 
          }}
        />
      ) : (
        <Text style={styles.noDataText}>No data available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#888',
  },
});

export default LineChartComponent;