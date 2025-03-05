import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ReportDetailProps {
    report: any;
    visible: boolean;
    onClose: () => void;
}

const ReportDetail = ({ report, visible, onClose }: ReportDetailProps) => {
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
});

export default ReportDetail;