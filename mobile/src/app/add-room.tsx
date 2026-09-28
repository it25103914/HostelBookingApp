import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as ImagePicker from 'expo-image-picker';

import { File } from 'expo-file-system';

const API_URL = 'http://10.165.196.224:5000';

export default function AddRoomScreen() {
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Single');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');

  const [image, setImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // SELECT IMAGE
  // ==========================================

  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library permission to select a room image.'
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.log(
        'IMAGE PICKER ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to select image.'
      );
    }
  };

  // ==========================================
  // ADD ROOM
  // ==========================================

  const handleAddRoom = async () => {
    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (
      !roomNumber.trim() ||
      !pricePerMonth.trim() ||
      !capacity.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please enter room number, price and capacity.'
      );

      return;
    }

    if (
      Number(pricePerMonth) <= 0 ||
      Number(capacity) <= 0
    ) {
      Alert.alert(
        'Invalid Information',
        'Price and capacity must be greater than 0.'
      );

      return;
    }

    try {
      setLoading(true);

      // --------------------------------------
      // GET TOKEN
      // --------------------------------------

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

      // --------------------------------------
      // CREATE FORM DATA
      // --------------------------------------

      const formData = new FormData();

      formData.append(
        'roomNumber',
        roomNumber.trim()
      );

      formData.append(
        'roomType',
        roomType
      );

      formData.append(
        'pricePerMonth',
        String(Number(pricePerMonth))
      );

      formData.append(
        'capacity',
        String(Number(capacity))
      );

      formData.append(
        'description',
        description.trim()
      );

      // --------------------------------------
      // ADD IMAGE
      // --------------------------------------

      if (image) {
        const file = new File(image.uri);

        formData.append(
          'image',
          file
        );

        console.log(
          'IMAGE FILE:',
          file
        );
      }

      console.log(
        'IMAGE TO UPLOAD:',
        image
      );

      // --------------------------------------
      // SEND REQUEST
      // --------------------------------------

      const response = await fetch(
        `${API_URL}/api/rooms`,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

      // --------------------------------------
      // READ RESPONSE
      // --------------------------------------

      const data =
        await response.json();

      console.log(
        'ADD ROOM RESPONSE:',
        data
      );

      // --------------------------------------
      // SUCCESS
      // --------------------------------------

      if (response.ok) {
        Alert.alert(
          'Success',
          'Room added successfully!',
          [
            {
              text: 'OK',

              onPress: () => {
                router.replace('/rooms');
              },
            },
          ]
        );

        return;
      }

      // --------------------------------------
      // SERVER ERROR
      // --------------------------------------

      Alert.alert(
        'Error',
        data.message ||
          data.error ||
          'Unable to add room.'
      );

    } catch (error) {
      console.log(
        'ADD ROOM ERROR:',
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
  // SCREEN
  // ==========================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      {/* BACK */}

      <TouchableOpacity
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ← Back
        </Text>
      </TouchableOpacity>

      {/* TITLE */}

      <Text style={styles.title}>
        Add New Room
      </Text>

      <Text style={styles.subtitle}>
        Enter room information
      </Text>

      {/* ROOM NUMBER */}

      <Text style={styles.label}>
        Room Number
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Example: D101"
        placeholderTextColor="#999"
        value={roomNumber}
        onChangeText={setRoomNumber}
      />

      {/* ROOM TYPE */}

      <Text style={styles.label}>
        Room Type
      </Text>

      <View style={styles.typeContainer}>

        {/* SINGLE */}

        <TouchableOpacity
          style={[
            styles.typeButton,
            roomType === 'Single' &&
              styles.selectedType,
          ]}
          onPress={() =>
            setRoomType('Single')
          }
        >
          <Text
            style={[
              styles.typeText,
              roomType === 'Single' &&
                styles.selectedTypeText,
            ]}
          >
            Single
          </Text>
        </TouchableOpacity>

        {/* DOUBLE */}

        <TouchableOpacity
          style={[
            styles.typeButton,
            roomType === 'Double' &&
              styles.selectedType,
          ]}
          onPress={() =>
            setRoomType('Double')
          }
        >
          <Text
            style={[
              styles.typeText,
              roomType === 'Double' &&
                styles.selectedTypeText,
            ]}
          >
            Double
          </Text>
        </TouchableOpacity>

        {/* TRIPLE */}

        <TouchableOpacity
          style={[
            styles.typeButton,
            roomType === 'Triple' &&
              styles.selectedType,
          ]}
          onPress={() =>
            setRoomType('Triple')
          }
        >
          <Text
            style={[
              styles.typeText,
              roomType === 'Triple' &&
                styles.selectedTypeText,
            ]}
          >
            Triple
          </Text>
        </TouchableOpacity>

      </View>

      {/* PRICE */}

      <Text style={styles.label}>
        Price Per Month
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Example: 25000"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={pricePerMonth}
        onChangeText={setPricePerMonth}
      />

      {/* CAPACITY */}

      <Text style={styles.label}>
        Capacity
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Example: 2"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={capacity}
        onChangeText={setCapacity}
      />

      {/* DESCRIPTION */}

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.descriptionInput,
        ]}
        placeholder="Enter room description"
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      {/* ROOM IMAGE */}

      <Text style={styles.label}>
        Room Image
      </Text>

      <TouchableOpacity
        style={styles.imageButton}
        onPress={handlePickImage}
      >
        <Text style={styles.imageButtonText}>
          📷 Select Room Image
        </Text>
      </TouchableOpacity>

      {/* IMAGE PREVIEW */}

      {image && (
        <View style={styles.previewContainer}>

          <Image
            source={{
              uri: image.uri,
            }}
            style={styles.previewImage}
          />

          <Text
            style={styles.selectedText}
          >
            Image selected ✓
          </Text>

        </View>
      )}

      {/* ADD ROOM BUTTON */}

      <TouchableOpacity
        style={[
          styles.addButton,
          loading &&
            styles.disabledButton,
        ]}
        onPress={handleAddRoom}
        disabled={loading}
      >

        {loading ? (
          <ActivityIndicator
            color="#ffffff"
          />
        ) : (
          <Text
            style={styles.addButtonText}
          >
            Add Room
          </Text>
        )}

      </TouchableOpacity>

    </ScrollView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  backText: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },

  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 5,
    marginBottom: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
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
    backgroundColor: '#ffffff',
  },

  selectedType: {
    backgroundColor: '#007AFF',
  },

  typeText: {
    color: '#007AFF',
    fontWeight: '600',
  },

  selectedTypeText: {
    color: '#ffffff',
  },

  imageButton: {
    backgroundColor: '#5856D6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  imageButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  previewContainer: {
    marginTop: 15,
    alignItems: 'center',
  },

  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },

  selectedText: {
    marginTop: 8,
    color: '#16833B',
    fontWeight: '600',
  },

  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },

  disabledButton: {
    opacity: 0.7,
  },

  addButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

});