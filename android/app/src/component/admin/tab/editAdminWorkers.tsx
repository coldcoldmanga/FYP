import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { updateAdmin, updateWorker } from '../../../service/userServices';

interface EditWorkerModalProps {
    visible: boolean;
    worker: any;
    onClose: () => void;
    onUpdate: () => void;
}

const EditWorkerModal = ({ visible, worker, onClose, onUpdate }: EditWorkerModalProps) => {
    const [fullname, setFullname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [status, setStatus] = useState('Active');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [specialization, setSpecialization] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (worker) {
            setFullname(worker.fullname || '');
            setPhoneNumber(worker.phone_number || '');
            setStatus(worker.status || 'Active');
            setIsSuperAdmin(worker.super_admin || false);
            
            if (worker.specialize && Array.isArray(worker.specialize)) {
                setSpecialization(worker.specialize.join(', '));
            } else {
                setSpecialization('');
            }
        }
    }, [worker]);

    const handleUpdate = async () => {
        if (!fullname || !phoneNumber) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            if (worker.user_type === 'Admin') {
                const adminData = {
                    user_id: worker.id,
                    fullname,
                    phone_number: phoneNumber,
                    status,
                    super_admin: isSuperAdmin,
                    updated_at: new Date()
                };
                await updateAdmin(adminData);
            } else if (worker.user_type === 'Maintenance Worker') {
                let workerData: {
                    user_id: string;
                    fullname: string;
                    phone_number: string;
                    status: string;
                    specialize?: string[];
                    updated_at: Date;
                } = {
                    user_id: worker.id,
                    fullname,
                    phone_number: phoneNumber,
                    status,
                    updated_at: new Date()
                };

                
                if (specialization) {
                    const specializationArray = specialization.split(',').map(s => s.trim());
                    workerData.specialize = specializationArray;
                }

                await updateWorker(workerData);
            }

            Alert.alert('Success', `${worker.user_type} updated successfully`);
            onUpdate();
            onClose();
        } catch (error) {
            console.error(`Error updating ${worker.user_type}:`, error);
            Alert.alert('Error', `Failed to update ${worker.user_type}`);
        } finally {
            setLoading(false);
        }
    };

    if (!worker) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.modalTitle}>Edit {worker.user_type}</Text>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={fullname}
                                onChangeText={setFullname}
                                placeholder="Enter full name"
                                placeholderTextColor="#aaa"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.disabledInput}>{worker.email || 'N/A'}</Text>
                            <Text style={styles.helperText}>Email cannot be changed</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Phone Number *</Text>
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                                placeholderTextColor="#aaa"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Status</Text>
                            <View style={styles.statusContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.statusButton,
                                        status === 'Active' && styles.statusButtonActive
                                    ]}
                                    onPress={() => setStatus('Active')}
                                >
                                    <Text 
                                        style={[
                                            styles.statusText,
                                            status === 'Active' && styles.statusTextActive
                                        ]}
                                    >
                                        Active
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.statusButton,
                                        status === 'Inactive' && styles.statusButtonInactive
                                    ]}
                                    onPress={() => setStatus('Inactive')}
                                >
                                    <Text 
                                        style={[
                                            styles.statusText,
                                            status === 'Inactive' && styles.statusTextInactive
                                        ]}
                                    >
                                        Inactive
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {worker.user_type === 'Admin' && (
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

                        {worker.user_type === 'Maintenance Worker' && (
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
                    </ScrollView>
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
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 45,
        color: '#333',
    },
    disabledInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f5f5f5',
        color: '#666',
        minHeight: 45,
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    statusContainer: {
        flexDirection: 'row',
    },
    statusButton: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
        minHeight: 45,
    },
    statusButtonActive: {
        borderColor: '#2e7d32',
        backgroundColor: '#e8f5e9',
    },
    statusButtonInactive: {
        borderColor: '#c62828',
        backgroundColor: '#ffebee',
    },
    statusText: {
        color: '#666',
        fontWeight: '500',
    },
    statusTextActive: {
        color: '#2e7d32',
    },
    statusTextInactive: {
        color: '#c62828',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 45,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
        marginBottom: 20,
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
    scrollView: {
        width: '100%',
        flexGrow: 1,
    },
    closeButton: {
        padding: 8,
    },
});

export default EditWorkerModal;