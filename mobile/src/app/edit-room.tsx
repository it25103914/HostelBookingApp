import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.165.196.224:5000';

type Room = {
  _id: string;
  roomNumber: string;
  roomType: string;
  pricePerMonth: number;
  capacity: number;
  description?: string;
};

export default function EditRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [room, setRoom] = useState<Room | null>(null);

  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Single');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRoom = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Login Required', 'Please login first.');
        router.replace('/');
        return;
      }

      const response = await fetch(`${API_URL}/api/rooms/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRoom(data);
        setRoomNumber(data.roomNumber);
        setRoomType(data.roomType);
        setPricePerMonth(String(data.pricePerMonth));
        setCapacity(String(data.capacity));
        setDescription(data.description || '');
      } else {
        Alert.alert('Error', data.message || 'Room not found.');
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Cannot connect to the backend server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRoom();
    }
  }, [id]);

  const handleUpdateRoom = async () => {
    if (!roomNumber || !pricePerMonth || !capacity) {
      Alert.alert(
        'Missing Information',
        'Please enter room number, price and capacity.'
      );
      return;
    }

    if (Number(pricePerMonth) <= 0 || Number(capacity) <= 0) {
      Alert.alert(
        'Invalid Information',
        'Price and capacity must be greater than 0.'
      );
      return;
    }

    try {
      setSaving(true);

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Login Required', 'Please login first.');
        router.replace('/');
        return;
      }

      const response = await fetch(`${API_URL}/api/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomNumber,
          roomType,
          pricePerMonth: Number(pricePerMonth),
          capacity: Number(capacity),
          description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Room updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/rooms'),
          },
        ]);
      } else {
        Alert.alert(
          'Update Failed',
          data.message || data.error || 'Unable to update room.'
        );
      }
    } catch (error) {
      console.log('UPDATE ROOM ERROR:', error);

      Alert.alert(
        'Connection Error',
        'Cannot connect to the backend server.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading room...</Text>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Room not found.</Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Edit Room</Text>
      <Text style={styles.subtitle}>
        Update room information
      </Text>

      <Text style={styles.label}>Room Number</Text>

      <TextInput
        style={styles.input}
        value={roomNumber}
        onChangeText={setRoomNumber}
        placeholder="Example: D101"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Room Type</Text>

      <View style={styles.typeContainer}>
        {['Single', 'Double', 'Triple'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              roomType === type && styles.selectedType,
            ]}
            onPress={() => setRoomType(type)}
          >
            <Text
              style={[
                styles.typeText,
                roomType === type && styles.selectedTypeText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Price Per Month</Text>

      <TextInput
        style={styles.input}
        value={pricePerMonth}
        onChangeText={setPricePerMonth}
        placeholder="Example: 30000"
        placeholderTextColor="#999"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Capacity</Text>

      <TextInput
        style={styles.input}
        value={capacity}
        onChangeText={setCapacity}
        placeholder="Example: 2"
        placeholderTextColor="#999"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Description</Text>

      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter room description"
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdateRoom}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.updateButtonText}>
            Update Room
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },

  backText: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
  },

  subtitle: {
    fontSize: 15,
    color: '#666666',
    marginTop: 5,
    marginBottom: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222222',
  },

  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  selectedType: {
    backgroundColor: '#007AFF',
  },

  typeText: {
    color: '#007AFF',
    fontWeight: '600',
  },

  selectedTypeText: {
    color: '#FFFFFF',
  },

  updateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },

  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },

  errorText: {
    fontSize: 18,
    color: '#C62828',
    marginBottom: 20,
  },

  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
