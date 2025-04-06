import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { updateReport } from '../../../service/reportServices';
import { getUserPlayerID, getUserTracking, updateWorker } from '../../../service/userServices';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getReportMedia } from '../../../service/attachmentServices';
import { formatDate } from '../../../util/formatDate';
// import { updateReportStatusToAdmin, updateReportStatusToUser } from '../../../service/onesignalServices';
import { addNotification } from '../../../service/notificationServices';
import { getUserTrackingList } from '../../../service/trackingService';
import axios from 'axios';
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
    const [attachments, setAttachments] = useState<any[]>([]);
    const navigation = useNavigation<NavigationProp<any>>();

    // useEffect(()=>{
    //     setStatus(report.status);
    //     setProgress(report.progress);
    //     setAttachments(report.attachments);
    // }, [report])

    useEffect(() => {
        if(visible){
            setStatus(report.status);
            setProgress(report.progress);
            fetchReportMedia(report.report_id);
        }
    }, [visible]);

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

    const handleUpdateReport = async () => {
        try {
            setLoading(true);
            await updateReport(report.report_id, {
                status: status,
                progress: progress,
                updated_at: new Date()
            });

            const reportUserPlayerID = await getUserPlayerID(report.user_id);
            const trackingUserPlayerID = await getUserTracking(report.report_id);
            let targetUserIDs = [report.user_id];
            const userIDs = await getUserTrackingList(report.report_id);
            if(userIDs.length > 0){
                targetUserIDs = [...targetUserIDs, ...userIDs];
            }

            let playerID = [reportUserPlayerID];        
            if(trackingUserPlayerID.length > 0){
                for(const userID of trackingUserPlayerID){
                    playerID.push(userID);
                }
            }
            //push notification to admin and user
            await axios.post("http://172.25.96.1/updateReportStatusToAdmin", {
                reportID: report.report_id,
                status: status,
                workerID: report.assigned_to
            })

            await axios.post("http://172.25.96.1/updateReportStatusToUser",{
                reportID: report.report_id,
                status: status,
                playerID: playerID
            })


            // await updateReportStatusToAdmin(report.report_id, status, report.assigned_to) to be removed later
            // await updateReportStatusToUser(report.report_id, status, playerID) to be removed later

            //update the notification of admin and user in firestore
            await addNotification(`Report ${report.report_id} Updated`, `The report ${report.report_id} has been updated to ${status} by ${report.assigned_to}`, [], "Admin");
            await addNotification(`Report ${report.report_id} Updated`, `The report ${report.report_id} has been updated to ${status}`, targetUserIDs, "");
            

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
            onRequestClose={() => {
                onClose();
                setStatus("");
                setProgress("");
            }}
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

                        {/* Status Update Dropdown */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Update Status</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={report.status}
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
                            disabled={loading || (status === report.status && progress === report.progress) || (status === "" && progress === "") }
                        >
                            <Text style={styles.updateButtonText}>
                                {loading ? 'Updating...' : 'Update Report'}
                            </Text>
                        </TouchableOpacity>

                        {report.status === 'Completed' && (
                            <View style={styles.section}>
                                <TouchableOpacity 
                                    style={styles.feedbackLink} 
                                    onPress={() => navigation.navigate('Feedback', { reportId: report.report_id })}
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