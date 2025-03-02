import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define types for report status and priority
type Status = 'In Progress' | 'Pending' | 'Completed';
type Priority = 'High Priority' | 'Medium Priority' | 'Low Priority';

interface Report {
    id: string;
    title: string;
    location: string;
    priority: Priority;
    status: Status;
}

const ReportsTab = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // Sample data
    const reports: Report[] = [
        {
            id: '1',
            title: 'Broken AC Unit - Floor 3',
            location: 'Building A',
            priority: 'High Priority',
            status: 'In Progress'
        },
        {
            id: '2',
            title: 'Water Leakage - Pantry',
            location: 'Building B',
            priority: 'Medium Priority',
            status: 'Pending'
        },
        {
            id: '3',
            title: 'Faulty Light Fixtures',
            location: 'Building A',
            priority: 'Low Priority',
            status: 'Pending'
        },
    ];

    // Status badge component
    const StatusBadge = ({ status }: { status: Status }) => {
        const getStatusColor = () => {
            switch (status) {
                case 'In Progress':
                    return '#E3F2FD';
                case 'Pending':
                    return '#FFF9C4';
                case 'Completed':
                    return '#E8F5E9';
                default:
                    return '#E0E0E0';
            }
        };

        return (
            <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
                <Text style={[styles.badgeText, { color: '#1a2847' }]}>{status}</Text>
            </View>
        );
    };

    // Priority badge component
    const PriorityBadge = ({ priority }: { priority: Priority }) => {
        const getPriorityColor = () => {
            switch (priority) {
                case 'High Priority':
                    return '#FFEBEE';
                case 'Medium Priority':
                    return '#FFF3E0';
                case 'Low Priority':
                    return '#F1F8E9';
                default:
                    return '#E0E0E0';
            }
        };

        return (
            <View style={[styles.badge, { backgroundColor: getPriorityColor() }]}>
                <Text style={[styles.badgeText, { color: '#1a2847' }]}>{priority}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Reports List */}
            <ScrollView style={styles.reportsList}>
                {reports.map((report) => (
                    <TouchableOpacity key={report.id} style={styles.reportCard}>
                        <View style={styles.reportIcon}>
                            <Icon name="error-outline" size={24} color="#666" />
                        </View>
                        <View style={styles.reportContent}>
                            <Text style={styles.reportTitle}>{report.title}</Text>
                            <Text style={styles.reportLocation}>{report.location}</Text>
                            <View style={styles.badgeContainer}>
                                <PriorityBadge priority={report.priority} />
                                <StatusBadge status={report.status} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        height: 40,
    },
    reportsList: {
        flex: 1,
    },
    reportCard: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
    },
    reportIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1a2847',
        marginBottom: 4,
    },
    reportLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default ReportsTab;