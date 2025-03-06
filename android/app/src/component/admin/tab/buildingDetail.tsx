import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface BuildingDetailProps {
    building: any;
    visible: boolean;
    onClose: () => void;
}

const BuildingDetail = ({ building, visible, onClose }: BuildingDetailProps) => {
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
                        <Text style={styles.title}>Building Details</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Building Name</Text>
                            <Text style={styles.sectionContent}>{building?.building_name || 'Not specified'}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Building Code</Text>
                            <Text style={styles.sectionContent}>{building?.building_code || 'Not specified'}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.sectionContent}>{building?.description || 'No description available'}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Location Coordinates</Text>
                            <Text style={styles.sectionContent}>
                                {building?.location?.latitude && building?.location?.longitude 
                                    ? `${building.location.latitude}, ${building.location.longitude}`
                                    : 'Location not specified'
                                }
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Created At</Text>
                            <Text style={styles.sectionContent}>{formatDate(building?.created_at)}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Last Updated</Text>
                            <Text style={styles.sectionContent}>{formatDate(building?.updated_at)}</Text>
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
});

export default BuildingDetail;