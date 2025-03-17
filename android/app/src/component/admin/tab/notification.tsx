import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getNotificationForAdmin } from '../../../service/notificationServices';
import { formatDate } from '../../../util/formatDate';

interface NotificationProps {
    visible: boolean;
    onClose: () => void;
}

const Notification = ({ visible, onClose }: NotificationProps) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            handleGetNotification();
        }
    }, [visible]);

    const handleGetNotification = async () => {
        try {
            setLoading(true);
            const notifications = await getNotificationForAdmin();
            setNotifications(notifications);
        } catch (error) {
            console.error('Error getting notifications:', error);
        } finally {
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
                    <View style={styles.header}>
                        <Text style={styles.title}>Notifications</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#1a2847" style={styles.loader} />
                    ) : notifications.length > 0 ? (
                        <ScrollView style={styles.notificationList}>
                            {notifications.map((notification, index) => (
                                <View key={index} style={styles.notificationItem}>
                                    <View style={styles.notificationHeader}>
                                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                                        <Text style={styles.notificationTime}>
                                            {formatDate(notification.created_at)}
                                        </Text>
                                    </View>
                                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Icon name="notifications-none" size={48} color="#666" />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                        </View>
                    )}
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
        paddingHorizontal: 20,
        paddingBottom: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a2847',
    },
    closeButton: {
        padding: 5,
    },
    notificationList: {
        marginTop: 10,
    },
    notificationItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1a2847',
        flex: 1,
    },
    notificationTime: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    loader: {
        marginTop: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

export default Notification;
