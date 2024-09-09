import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import useNotificacaoViewModel from '../../viewmodels/NotificacaoViewModel';
import { useColors } from '../../contexts/ThemeContext';

const NotificacaoScreen: React.FC = () => {
  const {
    notifications,
    modalVisible,
    notificationToDelete,
    setModalVisible,
    handleDeleteNotification,
    handleDeleteButtonPress,
    formatTimeDifference
  } = useNotificacaoViewModel();
  
  const currentColors = useColors();

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
  notificationTitle: { fontSize: 16, fontWeight: 'bold' },
  notificationBody: { fontSize: 14, marginVertical: 5 },
  timeAgo: { fontSize: 12, color: '#666' },
  deleteButton: { 
    padding: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  flatListContent: { paddingBottom: 20 },
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
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { 
    padding: 10, 
    marginHorizontal: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  modalButtonText: { fontSize: 16, color: '#fff' },
});

export default NotificacaoScreen;