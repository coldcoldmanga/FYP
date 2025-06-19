import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet, 
    Alert
} from 'react-native';
import { updateBuilding } from '../../../service/buildingServices';

interface BuildingDetailModalProps {
    visible: boolean;
    building: {
        id: string;
        building_name: string;
        building_code?: string;
        description?: string;
        location?: {
            latitude: number;
            longitude: number;
        };
    } | null;
    onClose: () => void;
    onUpdate: () => void;
}

const EditBuildingModal = ({ visible, building, onClose, onUpdate }: BuildingDetailModalProps) => {
    const [formData, setFormData] = useState({
        building_name: '',
        building_code: '',
        description: '',
        location: {
            latitude: '',
            longitude: ''
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (building) {
            setFormData({
                building_name: building.building_name || '',
                building_code: building.building_code || '',
                description: building.description || '',
                location: {
                    latitude: building.location?.latitude?.toString() || '',
                    longitude: building.location?.longitude?.toString() || ''
                }
            });
        }
    }, [building]);

    const handleUpdate = async () => {
        if (!building?.id || !formData.building_name.trim()) {
            Alert.alert('Error', 'Building name is required');
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                ...formData,
                location: {
                    latitude: parseFloat(formData.location.latitude) || null,
                    longitude: parseFloat(formData.location.longitude) || null
                },
                updated_at: new Date()
            };

            await updateBuilding(building.id, updateData);
            Alert.alert('Success', 'Building updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating building:', error);
            Alert.alert('Error', 'Failed to update building');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Building</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Building Name*</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.building_name}
                            onChangeText={(text) => setFormData({...formData, building_name: text})}
                            placeholder="Enter building name"
                            placeholderTextColor="#aaa"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Building Code</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.building_code}
                            onChangeText={(text) => setFormData({...formData, building_code: text})}
                            placeholder="Enter building code"
                            placeholderTextColor="#aaa"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({...formData, description: text})}
                            placeholder="Enter description"
                            placeholderTextColor="#aaa"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Location</Text>
                        <View style={styles.locationContainer}>
                            <TextInput
                                style={[styles.input, styles.locationInput]}
                                value={formData.location.latitude}
                                onChangeText={(text) => setFormData({
                                    ...formData,
                                    location: { ...formData.location, latitude: text }
                                })}
                                placeholder="Latitude"
                                keyboardType="numeric"
                                placeholderTextColor="#aaa"
                            />
                            <TextInput
                                style={[styles.input, styles.locationInput]}
                                value={formData.location.longitude}
                                onChangeText={(text) => setFormData({
                                    ...formData,
                                    location: { ...formData.location, longitude: text }
                                })}
                                placeholder="Longitude"
                                keyboardType="numeric"
                                placeholderTextColor="#aaa"
                            />
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]} 
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, styles.updateButton, loading && styles.disabledButton]}
                            onPress={handleUpdate}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Updating...' : 'Update'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxHeight: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    locationInput: {
        flex: 0.48,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginLeft: 12,
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    updateButton: {
        backgroundColor: '#4A90E2',
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EditBuildingModal;