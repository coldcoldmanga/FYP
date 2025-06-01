import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getUserPlayerID, getWorker, updateWorker } from '../../../service/userServices';
import { updateReport } from '../../../service/reportServices';
import { updateWorkerActiveTask } from '../../../service/userServices';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getReportMedia } from '../../../service/attachmentServices';
import { formatDate } from '../../../util/formatDate';
// import { updateAssignedTaskToWorker } from '../../../service/onesignalServices';
import { addNotification } from '../../../service/notificationServices';
import axios from 'axios';
interface ReportDetailProps {
    report: any;
    visible: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const ReportDetail = ({ report, visible, onClose, onUpdate }: ReportDetailProps) => {

    const [selectedWorker, setSelectedWorker] = useState(report.assigned_to);
    const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<NavigationProp<any>>();
    useEffect(() =>{
        if(visible){
            fetchWorkers();
        }
    }, [visible]);

    useEffect(() => {
        if(report){
            fetchReportMedia(report.report_id);
        }
    }, [report]);

    const fetchWorkers = async () => {
        try{
            const workers = await getWorker();
            setAvailableWorkers(workers);
        }catch(error){
            console.error('Error fetching workers:', error);
        }
    }

    const fetchReportMedia = async (report_id: string) => {
        try{
            setLoading(true);
            const fetchedAttachments = await getReportMedia(report_id);
            setAttachments(fetchedAttachments);
        }catch(error){
            console.error('Error fetching attachments:', error);
        }finally{
            setLoading(false);
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
            await updateWorkerActiveTask(selectedWorker, 'Assigned');
            await fetchWorkers();
            const playerID = await getUserPlayerID(selectedWorker);

            // Add detailed logging for debugging
            console.log('Attempting to send push notification with:', {
                playerID,
                reportID: report.report_id
            });

            try{
                const response = await axios.post(
                    "https://fyp-backend-zeta-amber.vercel.app/updateAssignedTaskToWorker", 
                    {
                        playerID: [playerID],
                        reportID: report.report_id
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        timeout: 10000 // 10 second timeout
                    }
                );
                console.log('Push notification response:', response.data);
            }catch(error){
                // More detailed error logging
                if (axios.isAxiosError(error)) {
                    console.error('Push Notification Error Details:', {
                        message: error.message,
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        config: {
                            url: error.config?.url,
                            method: error.config?.method,
                            headers: error.config?.headers,
                            data: error.config?.data
                        }
                    });
                } else {
                    console.error('Push Notification Error:', error);
                }
            }
            
            await addNotification(`You have been assigned a new report`, `The report ${report.report_id} has been assigned to you`, [selectedWorker], "");
           
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

                        {attachments.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Attachments</Text>
                                <View style={styles.imagesContainer}>
                                    {attachments.map((attachment, index) => (
                                        <TouchableOpacity 
                                            key={index} 
                                            style={styles.imageWrapper}
                                            onPress={() => {
                                                // Optional: Navigate to full-screen image viewer
                                            }}
                                        >
                                            <Image 
                                                source={{ uri: attachment.url }} 
                                                style={styles.image}
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

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

                        {report.status === 'Completed' && (
                            <View style={styles.section}>
                                <TouchableOpacity 
                                    style={styles.feedbackLink} 
                                    onPress={() => navigation.navigate('Feedback', { reportId: report.report_id, faultType: report.fault_type })}
                                >
                                    <Icon name="rate-review" size={16} color="#1a2847" />
                                    <Text style={styles.feedbackLinkText}>View feedback & ratings</Text>
                                    <Icon name="chevron-right" size={16} color="#1a2847" />
                                </TouchableOpacity>
                            </View>
                        )}
                        
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
    feedbackLink: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    feedbackLinkText: {
        color: '#1a2847',
        fontSize: 14,
        fontWeight: '500',
        marginHorizontal: 8,
        textDecorationLine: 'underline',
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    imageWrapper: {
        width: '30%',
        aspectRatio: 1,
        margin: '1.5%',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
});

export default ReportDetail;