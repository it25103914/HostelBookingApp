import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const API_URL = 'http://10.165.196.224:5000';

type Room = {
  _id: string;
  roomNumber: string;
  roomType: string;
  pricePerMonth: number;
  capacity: number;
  currentOccupancy: number;
  description?: string;
  availabilityStatus: string;
};

export default function RoomsScreen() {

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);


  // ==========================================
  // GET ROOMS
  // ==========================================

  const fetchRooms = async () => {

    try {

      setLoading(true);

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
        `${API_URL}/api/rooms`,
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

        setRooms(data);

      } else {

        Alert.alert(
          'Error',
          data.message ||
            'Cannot load rooms.'
        );
      }

    } catch (error) {

      console.log(
        'GET ROOMS ERROR:',
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


  // ==========================================
  // LOAD ROOMS WHEN SCREEN OPENS
  // ==========================================

  useEffect(() => {

    fetchRooms();

  }, []);


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {

    await AsyncStorage.removeItem('token');

    await AsyncStorage.removeItem('user');

    router.replace('/');

  };


  // ==========================================
  // OPEN ROOM DETAILS
  // ==========================================

  const handleViewRoom = (
    roomId: string
  ) => {

    router.push({
      pathname: '/room-details',

      params: {
        id: roomId,
      },
    });

  };


  // ==========================================
  // OPEN MY BOOKINGS
  // ==========================================

  const handleMyBookings = () => {

    router.push('/my-bookings');

  };


  // ==========================================
  // OPEN ADD ROOM
  // ==========================================

  const handleAddRoom = () => {

    router.push('/add-room');

  };


  // ==========================================
  // OPEN EDIT ROOM
  // ==========================================

  const handleEditRoom = (
    roomId: string
  ) => {

    router.push({
      pathname: '/edit-room',

      params: {
        id: roomId,
      },
    });

  };


  // ==========================================
  // DELETE ROOM
  // ==========================================

  const handleDeleteRoom = (
    roomId: string,
    roomNumber: string
  ) => {

    Alert.alert(
      'Delete Room',

      `Are you sure you want to delete Room ${roomNumber}?`,

      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {

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
                `${API_URL}/api/rooms/${roomId}`,

                {
                  method: 'DELETE',

                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );


              const data =
                await response.json();


              if (response.ok) {

                Alert.alert(
                  'Success',
                  'Room deleted successfully.'
                );

                fetchRooms();

              } else {

                Alert.alert(
                  'Delete Failed',

                  data.message ||
                    'Cannot delete room.'
                );
              }


            } catch (error) {

              console.log(
                'DELETE ROOM ERROR:',
                error
              );

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


  // ==========================================
  // ROOM CARD
  // ==========================================

  const renderRoom = ({
    item,
  }: {
    item: Room;
  }) => {

    const isAvailable =
      item.availabilityStatus ===
      'Available';

    return (

      <View style={styles.card}>

        {/* Room Number */}

        <Text style={styles.roomNumber}>
          Room {item.roomNumber}
        </Text>


        {/* Room Type */}

        <Text style={styles.roomType}>
          {item.roomType} Room
        </Text>


        {/* Price */}

        <Text style={styles.price}>
          Rs.{' '}
          {item.pricePerMonth.toLocaleString()}
          {' '} / month
        </Text>


        {/* Capacity */}

        <Text style={styles.capacity}>
          Occupancy:{' '}
          {item.currentOccupancy}
          {' / '}
          {item.capacity}
        </Text>


        {/* Availability Status */}

        <View
          style={[
            styles.statusContainer,

            isAvailable
              ? styles.availableContainer
              : styles.fullContainer,
          ]}
        >

          <Text
            style={[
              styles.status,

              isAvailable
                ? styles.available
                : styles.full,
            ]}
          >

            {item.availabilityStatus}

          </Text>

        </View>


        {/* Description */}

        {item.description ? (

          <Text
            style={styles.description}
            numberOfLines={2}
          >

            {item.description}

          </Text>

        ) : (

          <Text
            style={styles.noDescription}
          >

            No description available

          </Text>

        )}


        {/* View Room Button */}

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            handleViewRoom(item._id)
          }
        >

          <Text
            style={styles.viewButtonText}
          >

            View Room

          </Text>

        </TouchableOpacity>


        {/* Edit Room Button */}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            handleEditRoom(item._id)
          }
        >

          <Text
            style={styles.editButtonText}
          >

            ✏️ Edit Room

          </Text>

        </TouchableOpacity>


        {/* Delete Room Button */}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            handleDeleteRoom(
              item._id,
              item.roomNumber
            )
          }
        >

          <Text
            style={styles.deleteButtonText}
          >

            🗑️ Delete Room

          </Text>

        </TouchableOpacity>


      </View>
    );
  };


  // ==========================================
  // LOADING SCREEN
  // ==========================================

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

          Loading rooms...

        </Text>

      </View>
    );
  }


  // ==========================================
  // MAIN SCREEN
  // ==========================================

  return (

    <View style={styles.container}>

      {/* =====================================
          HEADER
      ===================================== */}

      <View style={styles.header}>

        {/* Title */}

        <View style={styles.titleContainer}>

          <Text style={styles.title}>
            Available Rooms
          </Text>

          <Text style={styles.subtitle}>
            Choose your hostel room
          </Text>

        </View>


        {/* Header Buttons */}

        <View style={styles.headerButtons}>

          {/* My Bookings */}

          <TouchableOpacity
            onPress={handleMyBookings}
            style={styles.bookingsButton}
          >

            <Text
              style={styles.bookingsText}
            >

              My Bookings

            </Text>

          </TouchableOpacity>


          {/* Add Room */}

          <TouchableOpacity
            onPress={handleAddRoom}
            style={styles.addRoomButton}
          >

            <Text style={styles.addRoomText}>
              + Add Room
            </Text>

          </TouchableOpacity>


          {/* Logout */}

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >

            <Text style={styles.logout}>
              Logout
            </Text>

          </TouchableOpacity>

        </View>

      </View>


      {/* =====================================
          ROOM LIST
      ===================================== */}

      {rooms.length === 0 ? (

        <View style={styles.emptyContainer}>

          <Text style={styles.emptyIcon}>
            🏠
          </Text>

          <Text
            style={styles.emptyTitle}
          >

            No Rooms Available

          </Text>

          <Text
            style={styles.emptyText}
          >

            There are currently no rooms
            in the system.

          </Text>

        </View>

      ) : (

        <FlatList
          data={rooms}

          keyExtractor={(item) =>
            item._id
          }

          renderItem={renderRoom}

          contentContainerStyle={
            styles.list
          }

          showsVerticalScrollIndicator={
            false
          }
        />

      )}

    </View>
  );
}


// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 55,
  },


  // ========================================
  // HEADER
  // ========================================

  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,

    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',
  },


  titleContainer: {
    flex: 1,
  },


  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#222222',
  },


  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#666666',
  },


  // ========================================
  // HEADER BUTTONS
  // ========================================

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  bookingsButton: {
    marginRight: 12,
    paddingVertical: 8,
  },


  bookingsText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },


  addRoomButton: {
    backgroundColor: '#28A745',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
  },


  addRoomText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },


  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 5,
  },


  logout: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
  },


  // ========================================
  // ROOM LIST
  // ========================================

  list: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },


  // ========================================
  // ROOM CARD
  // ========================================

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


  roomNumber: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 5,
  },


  roomType: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 8,
  },


  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 7,
  },


  capacity: {
    fontSize: 15,
    color: '#555555',
    marginBottom: 10,
  },


  // ========================================
  // STATUS
  // ========================================

  statusContainer: {
    alignSelf: 'flex-start',

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 20,

    marginBottom: 10,
  },


  availableContainer: {
    backgroundColor: '#DFF6E4',
  },


  fullContainer: {
    backgroundColor: '#FFE1E1',
  },


  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },


  available: {
    color: '#16833B',
  },


  full: {
    color: '#C62828',
  },


  // ========================================
  // DESCRIPTION
  // ========================================

  description: {
    fontSize: 14,

    lineHeight: 21,

    color: '#666666',

    marginBottom: 14,
  },


  noDescription: {
    fontSize: 14,

    color: '#999999',

    fontStyle: 'italic',

    marginBottom: 14,
  },


  // ========================================
  // VIEW ROOM BUTTON
  // ========================================

  viewButton: {
    backgroundColor: '#007AFF',

    height: 46,

    borderRadius: 9,

    justifyContent: 'center',

    alignItems: 'center',
  },


  viewButtonText: {
    color: '#FFFFFF',

    fontSize: 16,

    fontWeight: 'bold',
  },


  // ========================================
  // EDIT ROOM BUTTON
  // ========================================

  editButton: {
    backgroundColor: '#FF9500',

    height: 46,

    borderRadius: 9,

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: 10,
  },


  editButtonText: {
    color: '#FFFFFF',

    fontSize: 16,

    fontWeight: 'bold',
  },


  // ========================================
  // DELETE ROOM BUTTON
  // ========================================

  deleteButton: {
    backgroundColor: '#FF3B30',

    height: 46,

    borderRadius: 9,

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: 10,
  },


  deleteButtonText: {
    color: '#FFFFFF',

    fontSize: 16,

    fontWeight: 'bold',
  },


  // ========================================
  // LOADING
  // ========================================

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


  // ========================================
  // EMPTY
  // ========================================

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
  },

});