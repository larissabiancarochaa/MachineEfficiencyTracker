import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TemperatureContextProvider } from './contexts/TemperatureContext';
import IndexScreen from './app/tabs/index';
import NotificacaoScreen from './app/tabs/notificacao';
import { useNotifications } from './hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  useNotifications();

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <TemperatureContextProvider>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'home';

                if (route.name === 'Home') {
                  iconName = 'home';
                } else if (route.name === 'Notificações') {
                  iconName = 'notifications';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#185a9d',
              tabBarInactiveTintColor: 'gray',
              headerShown: false,
            })}
          >
            <Tab.Screen name="Home" component={IndexScreen} />
            <Tab.Screen name="Notificações" component={NotificacaoScreen} />
          </Tab.Navigator>
        </TemperatureContextProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;