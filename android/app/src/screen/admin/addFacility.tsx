import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addFacility } from '../../service/facilityServices';
import { getBuilding } from '../../service/buildingServices';

const AddFacility = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(false);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        facility_id: '',
        facility_name: '',
        facility_type: '',
        building_id: '',
        description: '',
        status: 'Active',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false
    });

    useEffect(() => {
        loadBuildings();
    }, []);

    const loadBuildings = async () => {
        try {
            const buildingsData = await getBuilding();
            setBuildings(buildingsData);
        } catch (error) {
            console.error('Error loading buildings:', error);
            Alert.alert('Error', 'Failed to load buildings');
        }
    };

    const handleSubmit = async () => {
        if (!formData.facility_name.trim()) {
            Alert.alert('Error', 'Facility name is required');
            return;
        }

        if (!formData.building_id) {
            Alert.alert('Error', 'Please select a building');
            return;
        }

        setLoading(true);
        try {
            await addFacility(formData);
            Alert.alert('Success', 'Facility added successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error adding facility:', error);
            Alert.alert('Error', 'Failed to add facility');
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
                <Text style={styles.headerTitle}>Add New Facility</Text>
            </View>

            <ScrollView 
                style={styles.formContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Facility ID</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.facility_id}
                        onChangeText={(text) => setFormData({...formData, facility_id: text})}
                        placeholder="Enter facility ID"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Facility Name</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.facility_name}
                        onChangeText={(text) => setFormData({...formData, facility_name: text})}
                        placeholder="Enter facility name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Building</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.building_id}
                            onValueChange={(itemValue) => 
                                setFormData({...formData, building_id: itemValue})
                            }
                        >
                            <Picker.Item label="Select a building" value="" />
                            {buildings.map((building) => (
                                <Picker.Item 
                                    key={building.id}
                                    label={building.building_name}
                                    value={building.id}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Facility Type</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.facility_type}
                            onValueChange={(itemValue) => 
                                setFormData({...formData, facility_type: itemValue})
                            }
                        >
                            <Picker.Item label="Classroom" value="Classroom" />
                            <Picker.Item label="Laboratory" value="Laboratory" />
                            <Picker.Item label="Office" value="Office" />
                            <Picker.Item label="Meeting Room" value="Meeting Room" />
                            <Picker.Item label="Lecture Hall" value="Lecture Hall" />
                            <Picker.Item label="Library" value="Library" />
                            <Picker.Item label="Cafeteria" value="Cafeteria" />
                            <Picker.Item label="Auditorium" value="Auditorium" />
                            <Picker.Item label="Other" value="Other" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Status</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.status}
                            onValueChange={(itemValue) => 
                                setFormData({...formData, status: itemValue})
                            }
                        >
                            <Picker.Item label="Active" value="Active" />
                            <Picker.Item label="Inactive" value="Inactive" />
                            <Picker.Item label="Closed" value="Closed" />
                            <Picker.Item label="Renovation" value="Renovation" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({...formData, description: text})}
                        placeholder="Enter description"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Adding...' : 'Add Facility'}
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
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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

export default AddFacility;