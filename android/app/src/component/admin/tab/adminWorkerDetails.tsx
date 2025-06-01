import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface WorkerDetailProps {
    worker: any;
    visible: boolean;
    onClose: () => void;
}

const WorkerDetail = ({ worker, visible, onClose }: WorkerDetailProps) => {
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
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Staff Details</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Full Name</Text>
                            <Text style={styles.sectionContent}>{worker?.fullname || 'Not specified'}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Email</Text>
                            <Text style={styles.sectionContent}>{worker?.email || 'Not specified'}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Phone Number</Text>
                            <Text style={styles.sectionContent}>{worker?.phone_number || 'Not specified'}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>User Type</Text>
                            <View style={styles.typeContainer}>
                                <Text style={styles.sectionContent}>{worker?.user_type || 'Not specified'}</Text>
                                {worker?.user_type === 'Admin' && worker?.super_admin && (
                                    <View style={styles.superAdminBadge}>
                                        <Text style={styles.superAdminText}>Super Admin</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {worker?.user_type === 'Maintenance Worker' && worker?.specialize && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Specializations</Text>
                                <View style={styles.specializationContainer}>
                                    {worker.specialize.map((spec: string, index: number) => (
                                        <View key={index} style={styles.specializationBadge}>
                                            <Text style={styles.specializationText}>{spec}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {worker?.user_type === 'Maintenance Worker' && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Active Tasks</Text>
                                <Text style={styles.sectionContent}>{worker?.active_task !== undefined ? worker.active_task : 'Not available'}</Text>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Status</Text>
                            <View style={[
                                styles.statusBadge, 
                                { backgroundColor: worker?.status === 'Active' ? '#e8f5e9' : '#ffebee' }
                            ]}>
                                <Text style={[
                                    styles.statusText, 
                                    { color: worker?.status === 'Active' ? '#2e7d32' : '#c62828' }
                                ]}>
                                    {worker?.status || 'Unknown'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Created At</Text>
                            <Text style={styles.sectionContent}>{formatDate(worker?.created_at)}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Last Updated</Text>
                            <Text style={styles.sectionContent}>{formatDate(worker?.updated_at)}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Last Login</Text>
                            <Text style={styles.sectionContent}>{formatDate(worker?.last_login)}</Text>
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
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a2847',
    },
    closeButton: {
        padding: 8,
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    sectionTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    sectionContent: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    superAdminBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#fce4ec',
    },
    superAdminText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#c2185b',
    },
    specializationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    specializationBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#4A90E2',
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#e3f2fd',
    },
    specializationText: {
        color: '#4A90E2',
        fontSize: 14,
        fontWeight: '500',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default WorkerDetail;