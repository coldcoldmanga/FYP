import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addUser } from '../../service/userServices';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import { firebaseApp } from '../../config/firebase';
import { signUp } from '../../service/authServices';

const firestore = getFirestore(firebaseApp);

const AddAdminWorker = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [userID, setUserID] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userType, setUserType] = useState('Maintenance Worker');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [specialization, setSpecialization] = useState('');

    const handleSubmit = async () => {
        if (!fullname || !email || !phoneNumber) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const currentDate = new Date();
            
            // For maintenance workers, include specialization if provided
            if (userType === 'Maintenance Worker' && specialization) {
                // Assuming specialization is stored as an array
                const specializationArray = specialization.split(',').map(s => s.trim());
                
                // Add user with specialization
                await addUser(
                    fullname,
                    email,
                    phoneNumber,
                    userType,
                    '', // playerID
                    currentDate, // createdAt
                    currentDate, // updatedAt
                    null, // lastLogin
                    'Active', // status
                    0, // active_task (only for maintenance workers)
                    false // not applicable for maintenance workers
                );
                
                // Update the user document to add specialization
                const userID = email.split('@')[0];
                const userRef = doc(firestore, 'user', userID);
                await updateDoc(userRef, { specialize: specializationArray });
            } else {
                // Add admin or other user types
                await addUser(
                    fullname,
                    email,
                    phoneNumber,
                    userType,
                    '', // playerID
                    currentDate, // createdAt
                    currentDate, // updatedAt
                    null, // lastLogin
                    'Active', // status
                    0, // active_task (not used for admin)
                    isSuperAdmin // _superAdmin (only for admin)
                );


            }
            //sign up the user to firebase auth with default password
            await signUp(email, "MMUisYou");

            Alert.alert(
                'Success', 
                `${userType} registered successfully`, 
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Error registering user:', error);
            Alert.alert('Error', 'Failed to register user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register New {userType}</Text>
            </View>

            <ScrollView 
                style={styles.formContainer}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={fullname}
                        onChangeText={setFullname}
                        placeholder="Enter full name"
                        placeholderTextColor="#666666"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter email"
                        placeholderTextColor="#666666"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Phone Number *</Text>
                    <TextInput
                        style={styles.input}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        placeholderTextColor="#666666"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>User Type *</Text>
                    <View style={styles.userTypeContainer}>
                        <TouchableOpacity
                            style={[
                                styles.userTypeButton,
                                userType === 'Maintenance Worker' && styles.userTypeButtonActive
                            ]}
                            onPress={() => setUserType('Maintenance Worker')}
                        >
                            <Text 
                                style={[
                                    styles.userTypeText,
                                    userType === 'Maintenance Worker' && styles.userTypeTextActive
                                ]}
                            >
                                Maintenance Worker
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.userTypeButton,
                                userType === 'Admin' && styles.userTypeButtonActive
                            ]}
                            onPress={() => setUserType('Admin')}
                        >
                            <Text 
                                style={[
                                    styles.userTypeText,
                                    userType === 'Admin' && styles.userTypeTextActive
                                ]}
                            >
                                Admin
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {userType === 'Admin' && (
                    <View style={styles.formGroup}>
                        <View style={styles.switchContainer}>
                            <Text style={styles.label}>Super Admin</Text>
                            <Switch
                                value={isSuperAdmin}
                                onValueChange={setIsSuperAdmin}
                                trackColor={{ false: '#e0e0e0', true: '#4A90E2' }}
                                thumbColor={isSuperAdmin ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                )}

                {userType === 'Maintenance Worker' && (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Specialization (comma separated)</Text>
                        <TextInput
                            style={styles.input}
                            value={specialization}
                            onChangeText={setSpecialization}
                            placeholder="E.g. Plumbing, Electrical, HVAC"
                            placeholderTextColor="#aaa"
                        />
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Registering...' : `Register ${userType}`}
                    </Text>
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
    formContainer: {
        padding: 16,
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
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#666666',
    },
    userTypeContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    userTypeButton: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    userTypeButtonActive: {
        borderColor: '#4A90E2',
        backgroundColor: '#e3f2fd',
    },
    userTypeText: {
        color: '#666',
        fontWeight: '500',
    },
    userTypeTextActive: {
        color: '#4A90E2',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#4A90E2',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddAdminWorker;