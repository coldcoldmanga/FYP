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
import { addEquipment } from '../../service/equipmentServices';
import { getFacility } from '../../service/facilityServices';

const AddEquipment = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(false);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        equipment_name: '',
        equipment_type: '',
        facility_id: '',
        description: '',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false
    });

    useEffect(() => {
        loadFacilities();
    }, []);

    const loadFacilities = async () => {
        try {
            const facilitiesData = await getFacility();
            setFacilities(facilitiesData);
        } catch (error) {
            console.error('Error loading facilities:', error);
            Alert.alert('Error', 'Failed to load facilities');
        }
    };

    const handleSubmit = async () => {
        if (!formData.equipment_name.trim()) {
            Alert.alert('Error', 'Equipment name is required');
            return;
        }

        if (!formData.facility_id) {
            Alert.alert('Error', 'Please select a facility');
            return;
        }

        setLoading(true);
        try {
            await addEquipment(formData);
            Alert.alert('Success', 'Equipment added successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error adding equipment:', error);
            Alert.alert('Error', 'Failed to add equipment');
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
                <Text style={styles.headerTitle}>Add New Equipment</Text>
            </View>

            <ScrollView 
                style={styles.formContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Equipment Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.equipment_name}
                        onChangeText={(text) => setFormData({...formData, equipment_name: text})}
                        placeholder="Enter equipment name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Equipment Type</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.facility_id}
                            onValueChange={(itemValue) => 
                                setFormData({...formData, equipment_type: itemValue})
                            }
                        >
                            <Picker.Item label="Computers/Desktops" value="Computers/Desktops" />
                            <Picker.Item label="Laptops" value="Laptops" />
                            <Picker.Item label="Printers" value="Printers" />
                            <Picker.Item label="Projectors" value="Projectors" />
                            <Picker.Item label="Whiteboards/Smartboards" value="Whiteboards/Smartboards" />
                            <Picker.Item label="Audio/Visual Equipment" value="Audio/Visual Equipment" />
                            <Picker.Item label="Office Supplies" value="Office Supplies" />
                            <Picker.Item label="Other" value="Other" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Facility *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.facility_id}
                            onValueChange={(itemValue) => 
                                setFormData({...formData, facility_id: itemValue})
                            }
                        >
                            <Picker.Item label="Select a facility" value="" />
                            {facilities.map((facility) => (
                                <Picker.Item 
                                    key={facility.id}
                                    label={facility.facility_name}
                                    value={facility.id}
                                />
                            ))}
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
                        {loading ? 'Adding...' : 'Add Equipment'}
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
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
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

export default AddEquipment;