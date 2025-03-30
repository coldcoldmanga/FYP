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
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { getBuilding } from '../../service/buildingServices';
import { getFacility } from '../../service/facilityServices';
import { getEquipment } from '../../service/equipmentServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addReport } from '../../service/reportServices';
import { faultType } from '../../constant/faultType';
import { generateReportId } from '../../util/reportIdGenerator';
import { launchImageLibrary, ImageLibraryOptions, launchCamera, CameraOptions } from 'react-native-image-picker';
import { uploadImage, uploadVideo } from '../../service/cloudinaryServices';
import { addAttachment } from '../../service/attachmentServices';
import { updateNewReportToAdmin } from '../../service/onesignalServices';
import { addNotification } from '../../service/notificationServices';
import { equipmentType } from '../../constant/equipmentType';
interface Building {
  building_id: string;
  building_name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
}

interface Facility {
  facility_id: string;
  facility_name: string;
  building_id: string;
}

interface Equipment {
  equipment_id: string;
  equipment_name: string;
  facility_id: string;
}

const SubmitReport = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [selectedFaultType, setSelectedFaultType] = useState<string>(faultType[0].type);
  const priorityLevels = ['Low', 'Medium', 'High', 'Critical'];
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const INITIAL_REGION = {
    latitude: 2.2490057879268996,  
    longitude: 102.27706624157103,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  };

  useEffect(() => {
    loadBuildings();
    loadFacilities();
    loadEquipments();
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      const filtered = facilities.filter(
        facility => facility.building_id === selectedBuilding.building_id
      );
      console.log(filtered);
      setFilteredFacilities(filtered);
      setSelectedFacility('');
      setSelectedEquipment('');
    }
  }, [selectedBuilding, facilities]);

  useEffect(() => {
    if (selectedFacility) {
      const filtered = equipments.filter(
        equipment => equipment.facility_id === selectedFacility
      );
      setFilteredEquipments(filtered);
      setSelectedEquipment('');
    }
  }, [selectedFacility, equipments]);

  const loadBuildings = async () => {
    try {
      const buildingSnapshot = await getBuilding();
      const buildingData = buildingSnapshot.map((doc: any) => ({
        building_id: doc.building_id,
        building_name: doc.building_name,
        location: doc.location,
        description: doc.description
      }));
      setBuildings(buildingData);
      console.log(buildingData);
    } catch (error) {
      console.error('Error loading buildings:', error);
      Alert.alert('Error', 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  const loadFacilities = async () => {
    try {
      const facilitySnapshot = await getFacility();
      const facilityData = facilitySnapshot.map((doc: any) => ({
        facility_id: doc.facility_id,
        facility_name: doc.facility_name,
        building_id: doc.building_id
      }));
      setFacilities(facilityData);
      console.log(facilityData);
    } catch (error) {
      console.error('Error loading facilities:', error);
    }
  };

  const loadEquipments = async () => {
    try {
      const equipmentSnapshot = await getEquipment();
      const equipmentData = equipmentSnapshot.map((doc: any) => ({
        equipment_id: doc.equipment_id,
        equipment_name: doc.equipment_name,
        facility_id: doc.facility_id
      }));
      setEquipments(equipmentData);
      console.log(equipmentData);
    } catch (error) {
      console.error('Error loading equipment:', error);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission to take pictures",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // iOS handles permissions differently
    }
  };

  const pickMedia = async (type: 'photo' | 'video' | 'mixed') => {
    const options = {
      mediaType: type,
      includeBase64: false,
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.8,
      videoQuality: 'medium', // For videos
      durationLimit: 30, // Limit video length to 30 seconds
    };

    try {
      const result = await launchImageLibrary(options as ImageLibraryOptions);
      
      if (result.didCancel) {
        return;
      }
      
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Unknown error occurred');
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        // Limit to 3 attachments total
        if (attachments.length >= 3) {
          Alert.alert('Limit Reached', 'You can only upload up to 3 attachments');
          return;
        }
        
        const asset = result.assets[0];
        const isVideo = asset.type?.startsWith('video/');
        
        setAttachments([...attachments, {
          uri: asset.uri,
          type: isVideo ? 'video' : 'image',
          name: asset.fileName || 'media'
        }]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const recordVideo = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission to record videos",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required to record videos');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    const options = {
      mediaType: 'video' as const,
      includeBase64: false,
      videoQuality: 'medium' as const,
      durationLimit: 30,
    };

    try {
      const result = await launchCamera(options as CameraOptions);
      
      if (result.didCancel) {
        return;
      }
      
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Unknown error occurred');
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        if (attachments.length >= 3) {
          Alert.alert('Limit Reached', 'You can only upload up to 3 attachments');
          return;
        }
        
        setAttachments([...attachments, {
          uri: result.assets[0].uri,
          type: 'video',
          name: result.assets[0].fileName || 'video'
        }]);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video');
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
  };

  const submitReport = async () => {
    if (!selectedBuilding) {
      Alert.alert('Error', 'Please select a building');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      setUploading(true);
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userID = userEmail?.split('@')[0];
      
      if (!userID) {
        Alert.alert('Error', 'You must be logged in to submit a report');
        return;
      }

      const reportId = await generateReportId(selectedFaultType, selectedFacility, new Date().getFullYear());

      let attachmentsData = [];
      if(attachments.length > 0){
        for (const attachment of attachments){
          try{
            let cloudinaryURL;
            if (attachment.type === 'video') {
              cloudinaryURL = await uploadVideo(attachment.uri);
            } else {
              cloudinaryURL = await uploadImage(attachment.uri);
            }
            
            attachmentsData.push({
              url: cloudinaryURL,
              type: attachment.type,
              uploaded_at: new Date()
            });
          }catch(error){
            console.error(`Error uploading ${attachment.type}:`, error);
            Alert.alert('Error', `Failed to upload ${attachment.type}. Please try again.`);
          }
        }
      }

      const reportData = {
        report_id: reportId,
        user_id: userID,
        building_id: selectedBuilding.building_id,
        facility_id: selectedFacility || null,
        equipment_id: selectedEquipment || null,
        fault_type: selectedFaultType,
        description,
        latitude: selectedBuilding.location.latitude,
        longitude: selectedBuilding.location.longitude,
        priority,
        status: 'Pending',
        submitted_at: new Date(),
        is_deleted: false
      };

      await addReport(reportData);
      //push notification to admin
      await updateNewReportToAdmin(userID, reportData.fault_type, reportData.report_id);
      //update the notification of admin in firestore
      await addNotification(`New Report Submitted`, `A new report has been submitted by ${userID}`, [], "Admin");

      if(attachmentsData.length > 0){
        for(const attachment of attachmentsData){
          await addAttachment(reportId, attachment);
        }
      }
      
      Alert.alert(
        'Success',
        'Report submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Report</Text>
      </View>

      <ScrollView 
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={INITIAL_REGION}
            mapType="hybrid"
          >
            {buildings.map((building) => (
              <Marker
                key={building.building_id}
                coordinate={{
                  latitude: building.location.latitude,
                  longitude: building.location.longitude
                }}
                title={building.building_name}
                description={building.description}
                onPress={() => handleBuildingSelect(building)}
              >
                <View style={[
                  styles.customMarker, 
                  selectedBuilding?.building_id === building.building_id ? styles.selectedMarker : null
                ]}>
                  <Icon 
                    name="location-on" 
                    size={24} 
                    color={selectedBuilding?.building_id === building.building_id ? '#1a2847' : '#fff'} 
                  />
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        {selectedBuilding && (
          <View style={styles.selectedBuildingContainer}>
            <Text style={styles.sectionTitle}>Selected Building</Text>
            <Text style={styles.selectedBuildingName}>{selectedBuilding.building_name}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Facility</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedFacility}
              onValueChange={(itemValue) => setSelectedFacility(itemValue)}
              enabled={filteredFacilities.length > 0}
              style={styles.picker}
            >
              <Picker.Item label="Select a facility" value="" />
              {filteredFacilities.map((facility) => (
                <Picker.Item 
                  key={facility.facility_id} 
                  label={facility.facility_id} 
                  value={facility.facility_id} 
                />
              ))}
            </Picker>
          </View>
          {filteredFacilities.length === 0 && selectedBuilding && (
            <Text style={styles.noItemsText}>No facilities available for this building</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Fault Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedFaultType}
              onValueChange={(itemValue) => setSelectedFaultType(itemValue)}
              style={styles.picker}
            >
              {faultType.map((type) => (
                <Picker.Item key={type.code} label={type.type} value={type.type} />
              ))}
            </Picker>
          </View>
        </View>

        {selectedFaultType && (
          <View style={styles.formGroup}>
          <Text style={styles.label}>Equipment</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedEquipment}
              onValueChange={(itemValue) => setSelectedEquipment(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select an equipment" value="" />
              {equipmentType.filter((equipment) => equipment.type === selectedFaultType).map((equipment) => (
                <Picker.Item 
                  key={equipment.equipment} 
                  label={equipment.equipment} 
                  value={equipment.equipment} 
                />
              ))}
            </Picker>
          </View>
          {/* {filteredEquipments.length === 0 && selectedFacility && (
            <Text style={styles.noItemsText}>No equipment available for this facility</Text>
          )} */}
        </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={priority}
              onValueChange={(itemValue) => setPriority(itemValue)}
              style={styles.picker}
            >
              {priorityLevels.map((level) => (
                <Picker.Item key={level} label={level} value={level} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue in detail"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Upload Media (Optional, Max 3)</Text>
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={() => pickMedia('photo')}
              disabled={uploading}
            >
              <Icon name="photo-library" size={24} color="#fff" />
              <Text style={styles.imageButtonText}>Photos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={() => pickMedia('video')}
              disabled={uploading}
            >
              <Icon name="videocam" size={24} color="#fff" />
              <Text style={styles.imageButtonText}>Videos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={recordVideo}
              disabled={uploading}
            >
              <Icon name="camera-alt" size={24} color="#fff" />
              <Text style={styles.imageButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {attachments.length > 0 && (
            <View style={styles.imagesContainer}>
              {attachments.map((attachment, index) => (
                <View key={index} style={styles.imageWrapper}>
                  {attachment.type === 'video' ? (
                    <View style={styles.videoPreview}>
                      <Icon name="videocam" size={30} color="#1a2847" />
                      <Text style={styles.videoText}>Video</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: attachment.uri }} style={styles.previewImage} />
                  )}
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeAttachment(index)}
                    disabled={uploading}
                  >
                    <Icon name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={submitReport}
        >
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  mapContainer: {
    height: 250,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  formContainer: {
    padding: 16,
  },
  selectedBuildingContainer: {
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bde0fe',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2847',
    marginBottom: 8,
  },
  selectedBuildingName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  noItemsText: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#1a2847',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  customMarker: {
    backgroundColor: '#1a2847',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedMarker: {
    backgroundColor: '#fff',
    borderColor: '#1a2847',
    borderWidth: 3,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  imageButton: {
    backgroundColor: '#1a2847',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '30%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageWrapper: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1e1e1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  videoText: {
    marginTop: 5,
    color: '#1a2847',
    fontWeight: '500',
  },
});

export default SubmitReport;