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
import { Picker } from '@react-native-picker/picker';
import { updateFacility } from '../../../service/facilityServices';

interface FacilityDetailModalProps {
    visible: boolean;
    facility: {
        id: string;
        facility_name: string;
        facility_type?: string;
        description?: string;
        status?: string;
        building_name?: string;
    } | null;
    onClose: () => void;
    onUpdate: () => void;
}

const EditFacilityModal = ({ visible, facility, onClose, onUpdate }: FacilityDetailModalProps) => {
    const [formData, setFormData] = useState({
        facility_name: '',
        facility_type: '',
        description: '',
        status: 'Active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (facility) {
            setFormData({
                facility_name: facility.facility_name || '',
                facility_type: facility.facility_type || '',
                description: facility.description || '',
                status: facility.status || 'Active'
            });
        }
    }, [facility]);

    const handleUpdate = async () => {
        if (!facility?.id || !formData.facility_name.trim()) {
            Alert.alert('Error', 'Facility name is required');
            return;
        }

        setLoading(true);
        try {
            await updateFacility(facility.id, {
                ...formData,
                updated_at: new Date()
            });
            Alert.alert('Success', 'Facility updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating facility:', error);
            Alert.alert('Error', 'Failed to update facility');
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
                    <Text style={styles.modalTitle}>Edit Facility</Text>

                    {facility?.building_name && (
                        <Text style={styles.buildingName}>
                            in {facility.building_name}
                        </Text>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Facility Name*</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.facility_name}
                            onChangeText={(text) => setFormData({...formData, facility_name: text})}
                            placeholder="Enter facility name"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Facility Type</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.facility_type}
                            onChangeText={(text) => setFormData({...formData, facility_type: text})}
                            placeholder="Enter facility type"
                        />
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

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.status}
                                onValueChange={(value) => setFormData({...formData, status: value})}
                                style={styles.picker}
                            >
                                <Picker.Item label="Active" value="Active" />
                                <Picker.Item label="Inactive" value="Inactive" />
                                <Picker.Item label="Maintenance" value="Maintenance" />
                            </Picker>
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
        marginBottom: 8,
        color: '#333',
    },
    buildingName: {
        fontSize: 14,
        color: '#4A90E2',
        marginBottom: 20,
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
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
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

export default EditFacilityModal;