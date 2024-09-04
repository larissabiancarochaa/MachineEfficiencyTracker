import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useTemperatureContext } from '../../contexts/TemperatureContext';
import { useFetchTemperature } from '../../hooks/useFetchTemperature';
import { useSupabase } from '../../hooks/useSupabase'; 

const CRITICAL_TEMPERATURE_THRESHOLD = 18; 
const CRITICAL_EFFICIENCY_THRESHOLD = 70; 
const MIN_NOTIFICATION_INTERVAL_MS = 5 * 60 * 1000;

const NotificacaoScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<{ id: string, title: string, body: string, timestamp: number }[]>([]);
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  const { temperature, efficiency } = useTemperatureContext();
  const { fetchTemperature } = useFetchTemperature();
  const { supabase } = useSupabase(); 

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Você precisa permitir notificações para usar este recurso.');
        return;
      }
    };

    requestPermissions();

    // Load notifications from the database
    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('timestamp', { ascending: false });
          
        if (error) throw error;

        setNotifications(data || []);
        const lastTime = data && data.length > 0 ? Math.max(...data.map(n => n.timestamp)) : 0;
        setLastNotificationTime(lastTime);
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };

    loadNotifications();

    // Check temperature and notify periodically
    const checkTemperatureAndNotify = async () => {
      const data = await fetchTemperature();
      if (data) {
        const currentTime = Date.now();

        // Check if enough time has passed since the last notification
        if (currentTime - lastNotificationTime >= MIN_NOTIFICATION_INTERVAL_MS) {
          let notificationBody = '';

          // Construct notification body based on critical values
          if (data.temperature >= CRITICAL_TEMPERATURE_THRESHOLD && data.efficiency < CRITICAL_EFFICIENCY_THRESHOLD) {
            notificationBody = `Temperatura crítica: ${data.temperature}°C, Eficiência crítica: ${data.efficiency}%.`;
          } else if (data.temperature >= CRITICAL_TEMPERATURE_THRESHOLD) {
            notificationBody = `Temperatura crítica: ${data.temperature}°C.`;
          } else if (data.efficiency < CRITICAL_EFFICIENCY_THRESHOLD) {
            notificationBody = `Eficiência crítica: ${data.efficiency}%.`;
          }

          // Notify if there is any critical condition
          if (notificationBody) {
            // Schedule notification
            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: "Aviso Crítico",
                body: notificationBody,
                sound: 'default',
              },
              trigger: null, // Trigger immediately for testing
            });

            // Save notification to the database
            const { error } = await supabase
              .from('notifications')
              .insert([
                {
                  id: notificationId,
                  title: "Aviso Crítico",
                  body: notificationBody,
                  timestamp: currentTime,
                },
              ]);

            if (error) {
              console.error('Failed to save notification', error);
              return;
            }

            // Update the last notification time
            setLastNotificationTime(currentTime);
          }
        }
      }
    };

    // Call the function initially and then set an interval
    checkTemperatureAndNotify();
    const interval = setInterval(checkTemperatureAndNotify, 30000); // Verifica a cada 30 segundos

    // Clean up the interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, [fetchTemperature, lastNotificationTime, supabase]);

  // Function to format the time difference
  const formatTimeDifference = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 30) return `${Math.floor(diffDay / 30)} mês${Math.floor(diffDay / 30) > 1 ? 'es' : ''} atrás`;
    if (diffDay > 0) return `${diffDay} dia${diffDay > 1 ? 's' : ''} atrás`;
    if (diffHour > 0) return `${diffHour} hora${diffHour > 1 ? 's' : ''} atrás`;
    if (diffMin > 0) return `${diffMin} minuto${diffMin > 1 ? 's' : ''} atrás`;
    return `${diffSec} segundo${diffSec > 1 ? 's' : ''} atrás`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notificações Recentes</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text>{item.body}</Text>
            <Text style={styles.timeAgo}>{formatTimeDifference(item.timestamp)}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  notificationContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
  },
  notificationTitle: {
    fontWeight: 'bold',
  },
  timeAgo: {
    marginTop: 5,
    fontStyle: 'italic',
    color: '#555',
  },
});

export default NotificacaoScreen;