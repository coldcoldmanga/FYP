import React, { useState, useEffect } from 'react';
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
import firestore from '@react-native-firebase/firestore';

interface Building {
  id: string;
  name: string;
  coordinate: { latitude: number; longitude: number };
  description: string;
}

// Sample building data for testing
const buildingData: Building[] = [
  {
    id: '1',
    name: 'University Library',
    coordinate: { latitude: 2.24963, longitude: 102.27609 },
    description: 'Main Library of the University',
  },
  {
    id: '2',
    name: 'Science Block',
    coordinate: { latitude: 2.25000, longitude: 102.27700 },
    description: 'Science Department',
  },
  {
    id: '3',
    name: 'Engineering Complex',
    coordinate: { latitude: 2.24900, longitude: 102.27500 },
    description: 'Engineering Faculty Building',
  },
  // Add more buildings as needed
];

const SubmitReport = () => {
  const [description, setDescription] = useState('');
  const [faultType, setFaultType] = useState('Air Conditioning');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const addData = async () => {
    if (!selectedBuilding) {
      Alert.alert('No building selected', 'Please select a building on the map.');
      return;
    }
    
    try {
      await firestore()
        .collection('report')
        .doc(Date.now().toString())
        .set({
          buildingId: selectedBuilding.id,
          buildingName: selectedBuilding.name,
          latitude: selectedBuilding.coordinate.latitude,
          longitude: selectedBuilding.coordinate.longitude,
          description,
          faultType,
          timestamp: firestore.FieldValue.serverTimestamp(),
          status: 'Pending',
          priority: 'Medium',
        });
      Alert.alert('Success', 'Report submitted successfully!');
      // Reset form
      setDescription('');
      setSelectedBuilding(null);
    } catch (error) {
      console.error('Error adding document: ', error);
      Alert.alert('Error', 'Failed to save report. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          mapType="satellite" // Set map type to satellite
          initialRegion={{
            latitude: 2.24963,
            longitude: 102.27609,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {buildingData.map((building) => (
            <Marker
              key={building.id}
              coordinate={building.coordinate}
              title={building.name}
              description={building.description}
              onPress={() => setSelectedBuilding(building)}
            >
              {/* Custom marker design */}
              <View style={[
                styles.customMarker, 
                selectedBuilding?.id === building.id ? styles.selectedMarker : null
              ]}>
                <Icon 
                  name="school" 
                  size={24} 
                  color={selectedBuilding?.id === building.id ? '#1a2847' : '#fff'} 
                />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      <ScrollView style={styles.form}>
        {selectedBuilding && (
          <View style={styles.selectedBuilding}>
            <Text style={styles.selectedTitle}>Selected Building</Text>
            <Text style={styles.selectedText}>
              Name: {selectedBuilding.name}
            </Text>
            <Text style={styles.selectedDescription}>
              {selectedBuilding.description}
            </Text>
            <Text style={styles.selectedCoordinates}>
              Coordinates: {selectedBuilding.coordinate.latitude.toFixed(5)},{' '}
              {selectedBuilding.coordinate.longitude.toFixed(5)}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Fault Type</Text>
        <TouchableOpacity style={styles.input}>
          <Text style={styles.inputText}>{faultType}</Text>
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

        <TouchableOpacity style={styles.submitButton} onPress={addData}>
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  mapContainer: { 
    height: 300, 
    width: '100%', 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd' 
  },
  map: { 
    ...StyleSheet.absoluteFillObject 
  },
  form: { 
    padding: 16 
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
  inputText: {
    color: '#333',
    fontSize: 16,
  },
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  submitButton: {
    backgroundColor: '#1a2847',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  customMarker: {
    backgroundColor: '#1a2847',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarker: {
    backgroundColor: '#fff',
    borderColor: '#1a2847',
    borderWidth: 3,
    padding: 10,
  },
  selectedBuilding: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a2847',
    marginBottom: 8,
  },
  selectedText: { 
    fontSize: 16, 
    color: '#333',
    marginBottom: 4,
  },
  selectedDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  selectedCoordinates: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  }
});

export default SubmitReport;