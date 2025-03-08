import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getWorker } from '../../../service/userServices';
import { updateReport } from '../../../service/firestoreServices';
import { updateWorker } from '../../../service/userServices';
import { Picker } from '@react-native-picker/picker';
interface ReportDetailProps {
    report: any;
    visible: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const ReportDetail = ({ report, visible, onClose, onUpdate }: ReportDetailProps) => {

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

    const [selectedWorker, setSelectedWorker] = useState(report.assigned_to);
    const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() =>{
        if(visible){
            fetchWorkers();
        }
    }, [visible]);

    const fetchWorkers = async () => {
        try{
            const workers = await getWorker();
            setAvailableWorkers(workers);
        }catch(error){
            console.error('Error fetching workers:', error);
        }
    }

    const handleUpdate = async () => {
        if(!selectedWorker){
            Alert.alert('Error', 'Please select a worker');
            return;
        }

        setLoading(true);
        try{
            await updateReport(report.report_id, {assigned_to: selectedWorker, status: 'Assigned', updated_at: new Date()});
            await updateWorker(selectedWorker, 'Assigned');
            await fetchWorkers();
           
            Alert.alert('Success', 'Report updated successfully', [
                {text: 'OK', onPress: () => {
                    onUpdate();
                    onClose();
                }}
            ]);
        }catch(error){  
            console.error('Error updating report:', error);
            Alert.alert('Error', 'Failed to update report');
        }finally{
            setLoading(false);
        }
    }
    

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
                        <Text style={styles.title}>{report.fault_type}</Text>

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
                            <Text style={styles.sectionTitle}>Status</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{report.status}</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.sectionContent}>{report.description}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Submitted At</Text>
                            <Text style={styles.sectionContent}>{formatDate(report.submitted_at)}</Text>
                        </View>

                        {report.assigned_to && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Assigned To</Text>
                                <Text style={styles.sectionContent}>{report.assigned_to}</Text>
                            </View>
                        )}

                        {report.progress && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Progress</Text>
                                <Text style={styles.sectionContent}>{report.progress}</Text>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Assign Worker</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={report.assigned_to}
                                    onValueChange={(itemValue) => setSelectedWorker(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select a worker" value="" />
                                    {availableWorkers.map((worker: any) => (
                                        <Picker.Item
                                            key={worker.id}
                                            label={`${worker.fullname} (${worker.active_task || 0} active tasks)`}
                                            value={worker.email.split('@')[0]}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.updateButton, (report.status === 'Completed') ? styles.updateButtonDisabled : (loading || selectedWorker === report.assigned_to || !selectedWorker) && styles.updateButtonDisabled]}
                            onPress={handleUpdate}
                            disabled={loading || selectedWorker === report.assigned_to || !selectedWorker}
                        >
                            <Text style={styles.updateButtonText}>
                                {loading ? 'Updating...' : 'Update Assignment'}
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
    badge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#1a2847',
        fontSize: 14,
        fontWeight: '500',
    },
    lastUpdated: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: -16,
        marginBottom: 20,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        marginTop: 8,
        backgroundColor: '#FFF',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    updateButton: {
        backgroundColor: '#4A90E2',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    updateButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ReportDetail;