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
import { updateEquipment } from '../../../service/equipmentServices';

interface EquipmentDetailModalProps {
    visible: boolean;
    equipment: {
        id: string;
        equipment_name: string;
        equipment_type?: string;
        description?: string;
        status?: string;
    } | null;
    onClose: () => void;
    onUpdate: () => void;
}

const EditEquipmentModal = ({ visible, equipment, onClose, onUpdate }: EquipmentDetailModalProps) => {
    const [formData, setFormData] = useState({
        equipment_name: '',
        equipment_type: '',
        description: '',
        status: 'Active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (equipment) {
            setFormData({
                equipment_name: equipment.equipment_name || '',
                equipment_type: equipment.equipment_type || '',
                description: equipment.description || '',
                status: equipment.status || 'Active'
            });
        }
    }, [equipment]);

    const handleUpdate = async () => {
        if (!equipment?.id || !formData.equipment_name.trim()) {
            Alert.alert('Error', 'Equipment name is required');
            return;
        }

        setLoading(true);
        try {
            await updateEquipment(equipment.id, {
                ...formData,
                updated_at: new Date()
            });
            Alert.alert('Success', 'Equipment updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating equipment:', error);
            Alert.alert('Error', 'Failed to update equipment');
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
                    <Text style={styles.modalTitle}>Edit Equipment</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Equipment Name*</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.equipment_name}
                            onChangeText={(text) => setFormData({...formData, equipment_name: text})}
                            placeholder="Enter equipment name"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Equipment Type</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.equipment_type}
                            onChangeText={(text) => setFormData({...formData, equipment_type: text})}
                            placeholder="Enter equipment type"
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

export default EditEquipmentModal;