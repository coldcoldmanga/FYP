import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { updateReport } from '../../../service/firestoreServices';
import { updateWorker } from '../../../service/userServices';

interface ReportDetailProps {
    report: any;
    visible: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const ReportDetail = ({ report, visible, onClose, onUpdate}: ReportDetailProps) => {
    
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(report.progress);
    const [status, setStatus] = useState(report.status);


    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Not specified';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleUpdateReport = async () => {
        try {
            setLoading(true);
            await updateReport(report.id, {
                status: status,
                progress: progress,
                updated_at: new Date()
            });

            if(status === 'Completed'){
                await updateWorker(report.assigned_to, status);
            }

            Alert.alert('Success', 'Report updated successfully', [
                {text: 'OK', onPress: () => {
                    onUpdate();
                    onClose();
                }}
            ]);

        } catch (error) {
            console.error('Error updating report:', error);
            Alert.alert('Error', 'Failed to update report');
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
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close" size={24} color="#666" />
                    </TouchableOpacity>

                    <ScrollView>
                        <Text style={styles.title}>{report.fault_id}</Text>

                        {report.updated_at && (
                            <Text style={styles.lastUpdated}>
                                Last updated: {formatDate(report.updated_at)}
                            </Text>
                        )}
                        
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Location</Text>
                            <Text style={styles.sectionContent}>{`${report.building_id} - ${report.facility_id}`}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.sectionContent}>{report.description}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Submitted At</Text>
                            <Text style={styles.sectionContent}>{formatDate(report.submitted_at)}</Text>
                        </View>

                        {/* Status Update Dropdown */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Update Status</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={status}
                                    onValueChange={(itemValue) => setStatus(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Assigned" value="Assigned" />
                                    <Picker.Item label="In Progress" value="In Progress" />
                                    <Picker.Item label="Completed" value="Completed" />
                                </Picker>
                            </View>
                        </View>

                        {/* Progress Update Input */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Progress Notes</Text>
                            <TextInput
                                style={styles.progressInput}
                                value={progress}
                                onChangeText={(text) => setProgress(text)}
                                placeholder="Enter progress details..."
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Update Button */}
                        <TouchableOpacity 
                            style={[
                                styles.updateButton,
                                (loading || (status === report.status && progress === report.progress)) && 
                                styles.updateButtonDisabled
                            ]}
                            onPress={handleUpdateReport}
                            disabled={loading || (status === report.status && progress === report.progress)}
                        >
                            <Text style={styles.updateButtonText}>
                                {loading ? 'Updating...' : 'Update Report'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 8,
    },
    lastUpdated: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: -16,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1a2847',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 16,
        color: '#333',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginTop: 4,
    },
    picker: {
        height: 50,
    },
    progressInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        minHeight: 100,
    },
    updateButton: {
        backgroundColor: '#1a2847',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    updateButtonDisabled: {
        backgroundColor: '#cccccc',
    },
});

export default ReportDetail;