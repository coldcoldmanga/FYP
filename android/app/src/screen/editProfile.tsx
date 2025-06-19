import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { updateUser, getUser } from '../service/userServices';

const EditProfile = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState('');
  const [profileData, setProfileData] = useState({
    fullname: '',
    email: '',
    phone_number: '',
    profile_picture: null as string | null,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {

      const userEmail = await AsyncStorage.getItem('userEmail');
      const userID = userEmail?.split('@')[0] || '';  
      setUserID(userID);  

      if (!userID) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }
      
      // Fetch user data from Firestore
      const userData = await getUser(userEmail || '');
      if (userData) {
        setProfileData({
          fullname: userData?.fullname || '',
          email: userData?.email || userEmail,
          phone_number: userData?.phone_number || '',
          profile_picture: userData?.profile_picture || null,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 500,
      maxWidth: 500,
      quality: 0.5,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Unknown error');
        return;
      }
      
      if (response.assets && response.assets[0].base64) {
        // Store image as base64 string
        setProfileData({
          ...profileData,
          profile_picture: `data:image/jpeg;base64,${response.assets[0].base64}`
        });
      }
    });
  };

  const handleUpdateProfile = async () => {
    try {
      if (!profileData.fullname.trim()) {
        Alert.alert('Error', 'Please enter your full name');
        return;
      }
      
      if (!profileData.phone_number.trim()) {
        Alert.alert('Error', 'Please enter your phone number');
        return;
      }
      
      setLoading(true);
      
      // Use the updateUser function from firestoreServices
      await updateUser(
        profileData.profile_picture,
        profileData.fullname,
        profileData.email,
        profileData.phone_number
      );
      
      Alert.alert(
        'Success', 
        'Profile updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.fullname) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a2847" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#1a2847" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={handleSelectImage}>
              {profileData.profile_picture ? (
                <Image 
                  source={{ uri: profileData.profile_picture }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Icon name="person" size={60} color="#ccc" />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Icon name="edit" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={profileData.fullname}
                onChangeText={(text) => setProfileData({...profileData, fullname: text})}
                placeholder="Enter your full name"
                placeholderTextColor="#666666"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={profileData.email}
                editable={false}
                placeholder="Email cannot be changed"
                placeholderTextColor="#666666"
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={profileData.phone_number}
                onChangeText={(text) => setProfileData({...profileData, phone_number: text})}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#666666"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a2847',
  },
  placeholder: {
    width: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1a2847',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#1a2847',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfile;