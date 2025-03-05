import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getReport } from '../service/firestoreServices';
import { Alert } from 'react-native';
import ReportDetail from './reportDetail';

const ReportsTab = () => {
    const [reports, setReports] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [viewReportDetail, setViewReportDetail] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const fetchedReports = await getReport();
            setReports(fetchedReports);
            setError(null);
        } catch (error) {
            setError('Failed to load reports');
            Alert.alert('Error', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleReportPress = (report: any) => {
        setSelectedReport(report);
        setViewReportDetail(true);
    };

    // Format date helper
    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Unknown date';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                {/* Reports List */}
                {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1a2847" />
                    <Text style={styles.messageText}>Loading reports...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Icon name="error-outline" size={48} color="#c62828" />
                    <Text style={styles.messageText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchReports}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : reports.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Icon name="inbox" size={48} color="#9e9e9e" />
                    <Text style={styles.messageText}>No reports found</Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.reportsList}
                    contentContainerStyle={styles.reportsListContent}
                    showsVerticalScrollIndicator={false}
                >
                    {reports.map((report) => (
                        <TouchableOpacity key={report.id} style={styles.reportCard} onPress={() => handleReportPress(report)}>
                            <View style={styles.reportHeader}>
                                <View style={styles.reportIcon}>
                                    <Icon name="report-problem" size={24} color="#1a2847" />
                                </View>
                                <View style={styles.reportContent}>
                                    <Text style={styles.reportTitle}>{report.fault_id || 'Unknown Issue'}</Text>
                                    <View style={styles.locationContainer}>
                                        <Icon name="location-on" size={16} color="#666" />
                                        <Text style={styles.reportLocation}>{report.facility_id || 'Unknown Location'}</Text>
                                    </View>
                                </View>
                            </View>
                            
                            {report.description && (
                                <Text style={styles.reportDescription} numberOfLines={2}>
                                    {report.description}
                                </Text>
                            )}
                            
                            <View style={styles.reportFooter}>
                                <View style={styles.badgeContainer}>
                                    {report.priority && (
                                        <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
                                            <Text style={styles.badgeText}>{report.priority}</Text>
                                        </View>
                                    )}
                                    {report.status && (
                                        <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}>
                                            <Text style={styles.badgeText}>{report.status}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.reportDate}>
                                    {formatDate(report.submitted_at)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
            
            {selectedReport && (
                <ReportDetail
                    report={selectedReport}
                    visible={viewReportDetail}
                    onClose={() => setViewReportDetail(false)}
                />
            )}

        </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        paddingTop: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    messageText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#1a2847',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
    reportsList: {
        flex: 1,
    },
    reportsListContent: {
        paddingHorizontal: 16,
        paddingBottom: 100, // Extra padding for bottom nav
    },
    reportCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    reportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reportIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a2847',
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reportLocation: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    reportDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 12,
        lineHeight: 20,
    },
    reportFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        marginRight: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1a2847',
    },
    reportDate: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
});

export default ReportsTab;