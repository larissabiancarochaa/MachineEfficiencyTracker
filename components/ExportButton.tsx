import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useSupabase } from '../hooks/useSupabase';
import * as XLSX from 'xlsx';
import { useColors } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const ExportButton: React.FC = () => {
  const { supabase } = useSupabase();
  const colors = useColors();

  const downloadExcel = async () => {
    try {
      const { data, error } = await supabase
        .from('temperature_efficiency_log')
        .select('*');
      
      if (error) throw error;

      if (data) {
        // Conversão de data
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        
        // Crea o excel
        const excelFile = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        
        if (Platform.OS === 'web') {
          const blob = new Blob([new Uint8Array(excelFile)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'temperature_efficiency_log.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          // Salva o excel no mobile
          const fileUri = FileSystem.cacheDirectory + 'temperature_efficiency_log.xlsx';
          await FileSystem.writeAsStringAsync(fileUri, excelFile, { encoding: FileSystem.EncodingType.Base64 });
          await Sharing.shareAsync(fileUri);
        }
      }
    } catch (error) {
      console.error('Error downloading Excel file:', error);
    }
  };

  return (
    <TouchableOpacity
      style={Platform.OS === 'web' ? styles.buttonWeb : styles.buttonMobile}
      onPress={downloadExcel}
    >
      {Platform.OS === 'web' ? (
        <MaterialIcons name="file-download" size={24} color={colors.buttonText} />
      ) : (
        <Text style={styles.buttonText}>Download</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonWeb: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 45,
    height: 45,
    backgroundColor: '#185a9d',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonMobile: {
    position: 'relative',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#185a9d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExportButton;