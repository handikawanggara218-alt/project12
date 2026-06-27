import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kunci penyimpanan
const STORAGE_KEY = '@todo_list_v1';

export default function App() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Muat data saat aplikasi dibuka
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData !== null) {
          setTasks(JSON.parse(savedData));
        }
      } catch (error) {
        console.log('Gagal memuat data:', error);
        Alert.alert('Info', 'Tidak dapat memuat data tersimpan');
      }
    };

    loadTasks();
  }, []);

  // Simpan data ke AsyncStorage
  const saveTasks = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.log('Gagal menyimpan data:', error);
      Alert.alert('Peringatan', 'Data gagal disimpan');
    }
  };

  // Fitur Tambah Tugas
  const addTask = () => {
    const trimmedText = taskText.trim();
    if (!trimmedText) {
      Alert.alert('Peringatan', 'Tugas tidak boleh kosong!');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      text: trimmedText,
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setTaskText('');
  };

  // Fitur Tandai Selesai / Belum Selesai
  const toggleComplete = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Fitur Hapus dengan Konfirmasi
  const deleteTask = (taskId) => {
    Alert.alert(
      'Konfirmasi Hapus',
      'Yakin ingin menghapus tugas ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const updatedTasks = tasks.filter((task) => task.id !== taskId);
            setTasks(updatedTasks);
            saveTasks(updatedTasks);
          },
        },
      ]
    );
  };

  // Filter tugas untuk pencarian
  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tampilan jika daftar kosong
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Belum ada tugas 😊</Text>
      <Text style={styles.emptySubText}>Tambahkan tugas baru di atas</Text>
    </View>
  );

  // Render setiap item tugas
  const renderItem = ({ item }) => (
    <View style={styles.taskCard}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => toggleComplete(item.id)}
      >
        <Text style={[styles.taskText, item.completed && styles.taskDone]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <Text style={styles.title}>📋 Daftar Tugas</Text>

      {/* Kolom Pencarian */}
      <TextInput
        style={styles.searchInput}
        placeholder="Cari tugas..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Kolom Tambah Tugas */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ketik tugas baru..."
          value={taskText}
          onChangeText={setTaskText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Daftar Tugas */}
      <FlatList
        data={filteredTasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#212529',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#0d6efd',
    width: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskContent: {
    flex: 1,
    marginRight: 10,
  },
  taskText: {
    fontSize: 16,
    color: '#212529',
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: '#6c757d',
  },
  deleteText: {
    fontSize: 20,
    color: '#dc3545',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 14,
    color: '#adb5bd',
  },
});