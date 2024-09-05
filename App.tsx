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
import { ThemeProvider, useTheme, useColors } from './contexts/ThemeContext';
import { TouchableOpacity, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  useNotifications();

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          <TemperatureContextProvider>
            <MainTabs />
          </TemperatureContextProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

const MainTabs: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const currentColors = useColors();
  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <>
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
          tabBarActiveTintColor: currentColors.notificationText,
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: currentColors.background,
          },
        })}
      >
        <Tab.Screen name="Home" component={IndexScreen} />
        <Tab.Screen name="Notificações" component={NotificacaoScreen} />
      </Tab.Navigator>
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: currentColors.buttonBackground }]}
        onPress={toggleTheme}
      >
        <Ionicons
          name={isDarkMode ? 'sunny' : 'moon'}
          size={24}
          color={currentColors.buttonText}
        />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 50,
    padding: 10,
    elevation: 10,
    width: 45,
    height: 45,
  },
});

export default App;