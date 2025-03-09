import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getReportMedia } from '../../../service/attachmentServices';
import { formatDate } from '../../../util/formatDate';

interface ReportDetailProps {
    report: any;
    visible: boolean;
    onClose: () => void;
}

const ReportDetail = ({ report, visible, onClose }: ReportDetailProps) => {
    const [attachments, setAttachments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(visible){
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

    const navigation = useNavigation<NavigationProp<any>>();

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
                                            {attachment.type === 'image' ? (
                                                <Image 
                                                    source={{ uri: attachment.url }} 
                                                    style={styles.image}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <Video
                                                    source={{ uri: attachment.url }}
                                                    style={styles.image}
                                                    resizeMode="cover"
                                                />
                                            )}
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