import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, TouchableOpacity, Modal, Alert } from 'react-native';
import { useSupabase } from '../../hooks/useSupabase'; 
import * as Notifications from 'expo-notifications';
import { FontAwesome } from '@expo/vector-icons';

interface NotificationItem {
  id: number;
  message: string;
  sent_at: string;
}

const NotificacaoScreen: React.FC = () => {
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

        // Determinar a mensagem com base no valor crítico
        if (temperature >= 20) {
          message = `A temperatura atingiu ${temperature}°C. Verifique o sistema.`;
        } else if (efficiency <= 70) {
          message = `A eficiência caiu para ${efficiency}%. Ação necessária.`;
        } else {
          // Mensagem padrão com os valores mais recentes
          message = `Temperatura: ${temperature}°C, Eficiência: ${efficiency}%`;
        }

        // Inserir a notificação no banco de dados
        await supabase
          .from('notifications')
          .insert([
            { message, notification_type: 'device', sent_at: new Date().toISOString(), temperature, efficiency },
          ]);

        if (Platform.OS !== 'web') {
          // Agendar a notificação para iOS e Android
          await Notifications.scheduleNotificationAsync({
            content: { title: 'Atualização de Dados', body: message },
            trigger: null,
          });
        } else {
          // Mostrar notificação na web
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

    // Inicializar a última notificação e buscar as notificações
    fetchNotifications();

    // Atualizar notificações se o tempo desde a última notificação for maior ou igual a 2 minutos
    const checkNotificationInterval = () => {
      const now = Date.now();
      const interval = 120000; // 2 minutos em milissegundos
      if (lastNotificationTime && now - lastNotificationTime >= interval) {
        fetchLatestLog();
      }
    };

    const notificationInterval = setInterval(checkNotificationInterval, 60000); // Checar a cada 1 minuto
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

    // Fetch notifications every 30 seconds
    const refreshInterval = setInterval(fetchNotifications, 30000);
    // Fetch notifications immediately on mount
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

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Notificações Recentes</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.notificationContainer}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>Atualização</Text>
                <Text style={styles.notificationBody}>{item.message}</Text>
                <Text style={styles.timeAgo}>{formatTimeDifference(item.sent_at)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteButtonPress(item)}
              >
                <FontAwesome name="trash" size={24} color="#ff6f6f" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.modalMessage}>Tem certeza que deseja excluir esta notificação?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleDeleteNotification}
              >
                <Text style={styles.modalButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#ffffff' },
  container: { width: '90%', maxWidth: 700, flex: 1 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 20, color: '#185a9d' },
  notificationContainer: { 
    marginBottom: 15, 
    padding: 15, 
    backgroundColor: '#f8f8f8', 
    elevation: 3, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: 'bold', color: '#185a9d' },
  notificationBody: { fontSize: 14, marginVertical: 5 },
  timeAgo: { fontSize: 12, color: '#777' },
  deleteButton: { padding: 10 },
  flatListContent: { paddingBottom: 20 },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContent: { 
    width: '80%', 
    maxWidth: 300,
    padding: 20, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row' },
  modalButton: { 
    padding: 10, 
    marginHorizontal: 10, 
    backgroundColor: '#185a9d', 
    borderRadius: 5 
  },
  modalButtonText: { color: '#fff', fontSize: 16 }
});

export default NotificacaoScreen;