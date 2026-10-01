import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://hostel-booking-api-nl99.onrender.com';

export default function BookingScreen() {
  const { roomId, roomNumber } =
    useLocalSearchParams<{
      roomId: string;
      roomNumber: string;
    }>();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      Alert.alert(
        'Missing Information',
        'Please enter both start date and end date.'
      );
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      Alert.alert(
        'Invalid Date',
        'Please use the format YYYY-MM-DD.'
      );
      return;
    }

    if (end <= start) {
      Alert.alert(
        'Invalid Dates',
        'End date must be after the start date.'
      );
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert(
          'Login Required',
          'Please login first.'
        );

        router.replace('/');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId,
            startDate,
            endDate,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Booking Successful',
          `Your booking request for Room ${roomNumber} has been submitted.`,
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/rooms');
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Booking Failed',
          data.message || 'Unable to create booking.'
        );
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>
          ← Back
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Book Room {roomNumber}
      </Text>

      <Text style={styles.subtitle}>
        Enter your required booking period
      </Text>

      <Text style={styles.label}>
        Start Date
      </Text>

      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#999"
        value={startDate}
        onChangeText={setStartDate}
      />

      <Text style={styles.hint}>
        Example: 2026-10-01
      </Text>

      <Text style={styles.label}>
        End Date
      </Text>

      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#999"
        value={endDate}
        onChangeText={setEndDate}
      />

      <Text style={styles.hint}>
        Example: 2027-01-01
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>
            Submit Booking
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 25,
    paddingTop: 55,
  },

  backButton: {
    marginBottom: 25,
  },

  backText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 7,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 5,
  },

  hint: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 20,
  },

  button: {
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});