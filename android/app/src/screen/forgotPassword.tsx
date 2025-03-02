import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { forgotPassword } from '../services/authServices';
import { NavigationProp } from '@react-navigation/native';

const ForgotPassword = ({navigation}: {navigation: NavigationProp<any>}) => {
    const [email, setEmail] = useState('');

    const handleForgotPassword = async () => {
        if(!email){
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        else if(!RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(email)){
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        try{
            await forgotPassword(email);
            navigation.navigate('Login');
        }catch(error){
            Alert.alert('Error', (error as Error).message);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Forgot Password</Text>
    
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
    
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleForgotPassword}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
    
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Go Back</Text>
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
  });

export default ForgotPassword;
