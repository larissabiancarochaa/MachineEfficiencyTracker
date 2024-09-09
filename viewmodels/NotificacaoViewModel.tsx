import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useSupabase } from '../hooks/useSupabase'; 

interface NotificationItem {
  id: number;
  message: string;
  sent_at: string;
}

const useNotificacaoViewModel = () => {
  const { supabase } = useSupabase();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastNotificationTime, setLastNotificationTime] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<NotificationItem | null>(null);

  useEffect(() => {
    const getNotificationPermissions = async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
      } else {
        if (!('Notification' in window)) {
          console.log('Este navegador não suporta notificações.');
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Permissão para notificações não concedida.');
        }
      }
    };

    getNotificationPermissions();
  }, []);

  useEffect(() => {
    const fetchLatestLog = async () => {
      const { data: log } = await supabase
        .from('temperature_efficiency_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (log) {
        const { temperature, efficiency } = log;
        let message = '';

        if (temperature >= 20) {
          message = `A temperatura atingiu ${temperature}°C. Verifique o sistema.`;
        } else if (efficiency <= 70) {
          message = `A eficiência caiu para ${efficiency}%. Ação necessária.`;
        } else {
          message = `Temperatura: ${temperature}°C, Eficiência: ${efficiency}%`;
        }

        await supabase
          .from('notifications')
          .insert([
            { message, notification_type: 'device', sent_at: new Date().toISOString(), temperature, efficiency },
          ]);

        if (Platform.OS !== 'web') {
          await Notifications.scheduleNotificationAsync({
            content: { title: 'Atualização de Dados', body: message },
            trigger: null,
          });
        } else {
          new Notification('Atualização de Dados', { body: message });
        }
      }
    };

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false });

      if (data && data.length > 0) {
        const latestNotification = data[0];
        setLastNotificationTime(new Date(latestNotification.sent_at).getTime());
      }

      setNotifications(data || []);
    };

    fetchNotifications();

    const checkNotificationInterval = () => {
      const now = Date.now();
      const interval = 120000;
      if (lastNotificationTime && now - lastNotificationTime >= interval) {
        fetchLatestLog();
      }
    };

    const notificationInterval = setInterval(checkNotificationInterval, 60000);
    return () => clearInterval(notificationInterval);
  }, [supabase, lastNotificationTime]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false });

      setNotifications(data || []);
    };

    const refreshInterval = setInterval(fetchNotifications, 30000);
    fetchNotifications();

    return () => clearInterval(refreshInterval);
  }, [supabase]);

  const formatTimeDifference = (timestamp: string) => {
    const now = Date.now();
    const diffMs = now - new Date(timestamp).getTime();
    const diffMin = Math.floor(diffMs / 1000 / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay} dia${diffDay > 1 ? 's' : ''} atrás`;
    if (diffHour > 0) return `${diffHour} hora${diffHour > 1 ? 's' : ''} atrás`;
    return `${diffMin} minuto${diffMin > 1 ? 's' : ''} atrás`;
  };

  const handleDeleteNotification = async () => {
    if (notificationToDelete) {
      await supabase
        .from('notifications')
        .delete()
        .match({ id: notificationToDelete.id });

      setNotifications((prevNotifications) =>
        prevNotifications.filter((item) => item.id !== notificationToDelete.id)
      );
      setModalVisible(false);
    }
  };

  const handleDeleteButtonPress = (notification: NotificationItem) => {
    setNotificationToDelete(notification);
    setModalVisible(true);
  };

  return {
    notifications,
    modalVisible,
    notificationToDelete,
    setModalVisible,
    handleDeleteNotification,
    handleDeleteButtonPress,
    formatTimeDifference
  };
};

export default useNotificacaoViewModel;