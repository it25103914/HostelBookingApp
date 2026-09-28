import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
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
  currentOccupancy: number;
  description?: string;
  image?: string;
  availabilityStatus: string;
};

export default function RoomDetailsScreen() {
  const { id } =
    useLocalSearchParams<{ id: string }>();

  const [room, setRoom] =
    useState<Room | null>(null);

  const [loading, setLoading] =
    useState(true);

  const fetchRoom = async () => {
    try {
      const token =
        await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert(
          'Login Required',
          'Please login first.'
        );

        router.replace('/');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/rooms/${id}`,
        {
          method: 'GET',
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setRoom(data);

        console.log(
          'ROOM IMAGE:',
          data.image
        );

        console.log(
          'ROOM DATA:',
          data
        );
      } else {
        Alert.alert(
          'Error',
          data.message ||
            'Room not found.'
        );
      }

    } catch (error) {

      console.log(
        'GET ROOM ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Cannot connect to the backend server.'
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const handleBooking = () => {

    if (!room) {
      return;
    }

    if (
      room.availabilityStatus ===
      'Full'
    ) {
      Alert.alert(
        'Room Full',
        'This room is currently full and cannot be booked.'
      );

      return;
    }

    router.push({
      pathname: '/booking',
      params: {
        roomId: room._id,
        roomNumber:
          room.roomNumber,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#007AFF"
        />

        <Text
          style={styles.loadingText}
        >
          Loading room details...
        </Text>

      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.center}>

        <Text
          style={styles.errorText}
        >
          Room not found.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.backButtonText}
          >
            Go Back
          </Text>
        </TouchableOpacity>

      </View>
    );
  }

  /*
   * Create image URL
   *
   * Backend stores image like:
   * uploads\1790471019633.jpg
   *
   * Mobile needs:
   * http://10.165.196.224:5000/uploads/1790471019633.jpg
   */

  const imageUrl = room.image
    ? `${API_URL}/${room.image.replace(/\\/g, '/')}`
    : null;

  console.log(
    'FINAL IMAGE URL:',
    imageUrl
  );

  return (
    <ScrollView
      style={styles.container}
    >

      <TouchableOpacity
        style={styles.backLink}
        onPress={() =>
          router.back()
        }
      >
        <Text
          style={styles.backLinkText}
        >
          ← Back to Rooms
        </Text>
      </TouchableOpacity>

      {/* ROOM IMAGE */}

      {imageUrl ? (

        <Image
          source={{
            uri: imageUrl,
          }}
          style={styles.roomImage}
          resizeMode="cover"
          onLoad={() => {
            console.log(
              'IMAGE LOADED SUCCESSFULLY'
            );
          }}
          onError={(error) => {
            console.log(
              'IMAGE LOAD ERROR:',
              error.nativeEvent
            );
          }}
        />

      ) : (

        <View
          style={styles.noImage}
        >
          <Text
            style={styles.noImageText}
          >
            No Room Image
          </Text>
        </View>

      )}

      <View
        style={styles.content}
      >

        <Text
          style={styles.title}
        >
          Room {room.roomNumber}
        </Text>

        <Text
          style={styles.roomType}
        >
          {room.roomType} Room
        </Text>

        <View
          style={styles.infoBox}
        >

          <Text
            style={styles.infoLabel}
          >
            Monthly Price
          </Text>

          <Text
            style={styles.price}
          >
            Rs.{' '}
            {room.pricePerMonth.toLocaleString()}
          </Text>

        </View>

        <View
          style={styles.infoBox}
        >

          <Text
            style={styles.infoLabel}
          >
            Capacity
          </Text>

          <Text
            style={styles.infoValue}
          >
            {room.currentOccupancy}
            {' / '}
            {room.capacity}
          </Text>

        </View>

        <View
          style={styles.infoBox}
        >

          <Text
            style={styles.infoLabel}
          >
            Availability
          </Text>

          <Text
            style={[
              styles.status,
              room.availabilityStatus ===
              'Available'
                ? styles.available
                : styles.full,
            ]}
          >
            {room.availabilityStatus}
          </Text>

        </View>

        <Text
          style={styles.sectionTitle}
        >
          Description
        </Text>

        <Text
          style={styles.description}
        >
          {room.description ||
            'No description available.'}
        </Text>

        <TouchableOpacity
          style={[
            styles.bookButton,
            room.availabilityStatus ===
              'Full' &&
              styles.disabledButton,
          ]}
          onPress={handleBooking}
          disabled={
            room.availabilityStatus ===
            'Full'
          }
        >

          <Text
            style={styles.bookButtonText}
          >
            {room.availabilityStatus ===
            'Full'
              ? 'Room Full'
              : 'Book This Room'}
          </Text>

        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  backLink: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
  },

  backLinkText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },

  roomImage: {
    width: '100%',
    height: 230,
    backgroundColor: '#dddddd',
  },

  noImage: {
    width: '100%',
    height: 230,
    backgroundColor: '#dddddd',
    justifyContent: 'center',
    alignItems: 'center',
  },

  noImageText: {
    color: '#666666',
    fontSize: 16,
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#222222',
  },

  roomType: {
    fontSize: 18,
    color: '#666666',
    marginTop: 5,
    marginBottom: 20,
  },

  infoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 5,
  },

  price: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#007AFF',
  },

  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },

  status: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  available: {
    color: '#16833B',
  },

  full: {
    color: '#C62828',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
    color: '#222222',
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
    marginBottom: 25,
  },

  bookButton: {
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },

  disabledButton: {
    backgroundColor: '#999999',
  },

  bookButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },

  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },

  backButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

});