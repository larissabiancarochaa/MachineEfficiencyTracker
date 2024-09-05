import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, TouchableOpacity, Modal, Alert } from 'react-native';
import { useSupabase } from '../../hooks/useSupabase'; 
import * as Notifications from 'expo-notifications';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '../../contexts/ThemeContext';

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

  const currentColors = useColors(); // Obtém as cores atuais do tema

  return (
    <View style={[styles.outerContainer, { backgroundColor: currentColors.background }]}>
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        <Text style={[styles.header, { color: currentColors.text }]}>Notificações Recentes</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.notificationContainer, { backgroundColor: currentColors.notificationBackground }]}>
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: currentColors.text }]}>Atualização</Text>
                <Text style={[styles.notificationBody, { color: currentColors.text }]}>{item.message}</Text>
                <Text style={[styles.timeAgo, { color: currentColors.text }]}>{formatTimeDifference(item.sent_at)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: currentColors.modalButtonBackground }]}
                onPress={() => handleDeleteButtonPress(item)}
              >
                <FontAwesome name="trash" size={24} color={currentColors.modalButtonText} />
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
          <View style={[styles.modalContent, { backgroundColor: currentColors.modalContentBackground }]}>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>Confirmar Exclusão</Text>
            <Text style={[styles.modalMessage, { color: currentColors.text }]}>Tem certeza que deseja excluir esta notificação?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.modalButtonBackground }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.modalButtonText }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.modalButtonBackground }]}
                onPress={handleDeleteNotification}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.modalButtonText }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, alignItems: 'center', padding: 20 },
  container: { width: '90%', maxWidth: 700, flex: 1 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 20 },
  notificationContainer: { 
    marginBottom: 15, 
    padding: 15, 
    elevation: 3, 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontWeight: 'bold', marginBottom: 5 },
  notificationBody: { marginBottom: 5 },
  timeAgo: { fontSize: 12, color: 'gray' },
  flatListContent: { paddingBottom: 20 },
  deleteButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#d9534f' 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContent: { 
    width: '80%', 
    padding: 20, 
    alignItems: 'center',
    maxWidth: 300, 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  modalMessage: { 
    fontSize: 16, 
    marginBottom: 20,
    textAlign: 'center' 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%',
    gap: 20, 
  },
  modalButton: { 
    flex: 1, 
    padding: 10, 
    alignItems: 'center' 
  },
  modalButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default NotificacaoScreen;