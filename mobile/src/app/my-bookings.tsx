import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://hostel-booking-api-nl99.onrender.com';

type Booking = {
  _id: string;
  roomId: {
    _id: string;
    roomNumber: string;
    roomType: string;
    pricePerMonth: number;
  };
  startDate: string;
  endDate: string;
  bookingDate: string;
  status: string;
};

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
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
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBookings(data);
      } else {
        Alert.alert(
          'Error',
          data.message || 'Cannot load bookings.'
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

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusStyle = (status: string) => {
    if (status === 'Approved') {
      return styles.approved;
    }

    if (status === 'Rejected') {
      return styles.rejected;
    }

    if (status === 'Cancelled') {
      return styles.cancelled;
    }

    return styles.pending;
  };

  const handleCancelBooking = async (
    bookingId: string
  ) => {

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {

            try {
              const token =
                await AsyncStorage.getItem('token');

              if (!token) {
                router.replace('/');
                return;
              }

              const response = await fetch(
                `${API_URL}/api/bookings/${bookingId}`,
                {
                  method: 'PUT',
                  headers: {
                    'Content-Type':
                      'application/json',
                    Authorization:
                      `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    status: 'Cancelled',
                  }),
                }
              );

              const data =
                await response.json();

              if (response.ok) {

                Alert.alert(
                  'Booking Cancelled',
                  'Your booking has been cancelled.'
                );

                fetchBookings();

              } else {

                Alert.alert(
                  'Error',
                  data.message ||
                    'Unable to cancel booking.'
                );
              }

            } catch (error) {

              Alert.alert(
                'Connection Error',
                'Cannot connect to the backend server.'
              );

            }
          },
        },
      ]
    );
  };

  const renderBooking = ({
    item,
  }: {
    item: Booking;
  }) => {

    return (
      <View style={styles.card}>

        <View style={styles.cardHeader}>

          <Text style={styles.roomNumber}>
            Room {item.roomId.roomNumber}
          </Text>

          <View
            style={[
              styles.statusContainer,
              getStatusStyle(item.status),
            ]}
          >
            <Text style={styles.statusText}>
              {item.status}
            </Text>
          </View>

        </View>

        <Text style={styles.roomType}>
          {item.roomId.roomType} Room
        </Text>

        <Text style={styles.price}>
          Rs.{' '}
          {item.roomId.pricePerMonth.toLocaleString()}
          {' '} / month
        </Text>

        <View style={styles.dateBox}>

          <View>
            <Text style={styles.dateLabel}>
              Start Date
            </Text>

            <Text style={styles.date}>
              {formatDate(item.startDate)}
            </Text>
          </View>

          <View>
            <Text style={styles.dateLabel}>
              End Date
            </Text>

            <Text style={styles.date}>
              {formatDate(item.endDate)}
            </Text>
          </View>

        </View>

        <Text style={styles.bookingDate}>
          Booking submitted:{' '}
          {formatDate(item.bookingDate)}
        </Text>

        {item.status !== 'Cancelled' &&
          item.status !== 'Rejected' ? (

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() =>
              handleCancelBooking(item._id)
            }
          >
            <Text style={styles.cancelButtonText}>
              Cancel Booking
            </Text>
          </TouchableOpacity>

        ) : null}

      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#007AFF"
        />

        <Text style={styles.loadingText}>
          Loading bookings...
        </Text>

      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.replace('/rooms')}
        >
          <Text style={styles.backText}>
            ← Rooms
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          My Bookings
        </Text>

        <View style={{ width: 55 }} />

      </View>

      {bookings.length === 0 ? (

        <View style={styles.emptyContainer}>

          <Text style={styles.emptyIcon}>
            📋
          </Text>

          <Text style={styles.emptyTitle}>
            No Bookings Yet
          </Text>

          <Text style={styles.emptyText}>
            You have not made any room bookings yet.
          </Text>

          <TouchableOpacity
            style={styles.roomsButton}
            onPress={() =>
              router.replace('/rooms')
            }
          >
            <Text style={styles.roomsButtonText}>
              Browse Rooms
            </Text>
          </TouchableOpacity>

        </View>

      ) : (

        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 55,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  backText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#222222',
  },

  list: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 15,

    elevation: 3,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  roomNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222222',
  },

  roomType: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 15,
  },

  statusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  pending: {
    backgroundColor: '#F0A500',
  },

  approved: {
    backgroundColor: '#16833B',
  },

  rejected: {
    backgroundColor: '#C62828',
  },

  cancelled: {
    backgroundColor: '#777777',
  },

  dateBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  dateLabel: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 4,
  },

  date: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },

  bookingDate: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 12,
  },

  cancelButton: {
    height: 42,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: 'bold',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 10,
  },

  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },

  roomsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 8,
  },

  roomsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

});