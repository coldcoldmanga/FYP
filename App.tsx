import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

const App = () => {
  const [description, setDescription] = useState('');
  const [faultType, setFaultType] = useState('Air Conditioning');
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 2.2496328650989734,
    longitude:  102.27609213877413,
  });

  const addData = async () => {
    try {
      await firestore()
        .collection('report')
        .doc(Date.now().toString())
        .set({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          description,
          faultType,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
      Alert.alert('Success', 'Location and report details saved successfully!');
    } catch (error) {
      console.error('Error adding document: ', error);
      Alert.alert('Error', 'Failed to save report. Please try again.');
    }
  };

  const handleMapPress = (event: { nativeEvent: { coordinate: any; }; }) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              ...selectedLocation,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={selectedLocation}
              title="Selected Location"
              description="This location will be reported"
            />
          </MapView>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Fault Type</Text>
          <TouchableOpacity style={styles.input}>
            <Text style={styles.placeholder}>{faultType}</Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
          />

        <Text style={styles.label}>Attachments</Text>
          <View style={styles.attachmentButtons}>
            <TouchableOpacity style={styles.attachmentButton}>
              <Icon name="camera-outline" size={20} color="#666" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.attachmentButton}>
              <Icon name="cloud-upload-outline" size={20} color="#666" />
              <Text style={styles.buttonText}>Upload File</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={addData}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home-outline" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="document-text-outline" size={24} color="#666" />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person-outline" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: 300,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholder: {
    color: '#666',
    flex: 1,
    marginLeft: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1a2847',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    gap: 8,
    backgroundColor: '#fff',
  },
  buttonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default App;