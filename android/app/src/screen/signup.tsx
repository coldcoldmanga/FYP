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
  Button,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationProp } from '@react-navigation/native';
import { signUp } from '../services/authServices';
import { Picker } from '@react-native-picker/picker';
import { addUser } from '../services/firestoreServices';

const SignUp = ({navigation}: {navigation: NavigationProp<any>}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState('Select User Type'); // Default user type
  const [lastLogin, setLastLogin] = useState(null);
  const [active_task, setActive_task] = useState(0);

  let userData:any = {
    fullName,
    email,
    phoneNumber,
    userType,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
    status: 'active',
    active_task
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !phoneNumber || !userType) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try{
        await signUp(email, password);
        await addUser(fullName, email, phoneNumber, userType, new Date(), new Date(), lastLogin, 'active', 0);
        navigation.navigate('Login');
    }catch(error){
        Alert.alert('Error', (error as Error).message);
    }
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../assets/login.png')} // Replace with your logo path
          style={styles.logo}
        />
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <Picker
          selectedValue={userType}
          style={styles.picker}
          onValueChange={(itemValue) => setUserType(itemValue)}
        >
          <Picker.Item label="Select User Type" value="" />
          <Picker.Item label="Student" value="Student" />
          <Picker.Item label="Staff" value="Staff" />
          <Picker.Item label="Maintenance Worker" value="Maintenance Worker" />
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSignUp} 
        >
          <Text style={styles.submitButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 5,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#1a2847',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#1a2847',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  picker: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#ddd',
  },
   placeholder: {
    color: '#666',
    flex: 1,
    marginLeft: 8,
  },
});

export default SignUp;