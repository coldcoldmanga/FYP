import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Callout, Marker, PoiClickEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getReport } from '../service/reportServices';
import { useIsFocused } from '@react-navigation/native';
const Map = () => {

    const INITIAL_REGION = {
        latitude: 2.2490057879268996,  
        longitude: 102.27706624157103,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
    };
    const [loading, setLoading] = useState(true);
    const [selectedPoi, setSelectedPoi] = useState<any>(null);
    const [region, setRegion] = useState(INITIAL_REGION);
    const [reports, setReports] = useState<any[]>([]);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            // Set the initial region when the component mounts
            setRegion(INITIAL_REGION);
            loadReports();
        }
    }, [isFocused]);

    const loadReports = async () => {
        try {
            const reportData = await getReport();
            // Filter for unresolved reports
            const unresolvedReports = reportData.filter(
                (report: any) => report.status !== 'Completed'
            );
            setReports(unresolvedReports);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePoiClick = (event: PoiClickEvent) => {
        const poi = event.nativeEvent;
        setSelectedPoi(poi);
        setSelectedReport(null);
    }

    const handleReportPress = (report: any) => {
        setSelectedReport(report);
        setSelectedPoi(null);
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return '#ff0000';
            case 'High': return '#ff6347';
            case 'Medium': return '#ffa500';
            case 'Low': return '#4A90E2';
            default: return '#4A90E2';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                mapType='hybrid'
                initialRegion={region}
                onPoiClick={handlePoiClick}
            >
                {reports.map((report) => (
                    <Marker
                        key={report.report_id}
                        coordinate={{
                            latitude: report.latitude || 0,
                            longitude: report.longitude || 0
                        }}
                        onPress={() => handleReportPress(report)}
                    >
                        <View style={[
                            styles.reportMarker,
                            { backgroundColor: getPriorityColor(report.priority) }
                        ]}>
                            <Icon name="warning" size={16} color="#fff" />
                        </View>
                        <Callout tooltip>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{report.fault_type}</Text>
                                <Text style={styles.calloutText} numberOfLines={2}>
                                    {report.description?.substring(0, 50)}
                                    {report.description?.length > 50 ? '...' : ''}
                                </Text>
                                <Text style={styles.calloutStatus}>Status: {report.status}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <Modal
                visible={selectedPoi !== null}
                transparent={true}
                animationType='slide'
                onRequestClose={() => setSelectedPoi(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setSelectedPoi(null)}
                        >
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>

                        {selectedPoi && (
                            <>
                                <Text style={styles.title}>{selectedPoi.name}</Text>
                                <View style={styles.infoRow}>
                                    <Icon name="place" size={20} color="#666" />
                                        <Text style={styles.infoText}>
                                            {`${selectedPoi.coordinate.latitude.toFixed(6)}, ${selectedPoi.coordinate.longitude.toFixed(6)}`}
                                    </Text>
                                </View>
                                {selectedPoi.placeId && (
                                    <View style={styles.infoRow}>
                                        <Icon name="info" size={20} color="#666" />
                                        <Text style={styles.infoText}>
                                            Place ID: {selectedPoi.placeId}
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={selectedReport !== null}
                transparent={true}
                animationType='slide'
                onRequestClose={() => setSelectedReport(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setSelectedReport(null)}
                        >
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>

                        {selectedReport && (
                            <>
                                <Text style={styles.title}>{selectedReport.fault_type}</Text>
                                <View style={styles.statusContainer}>
                                    <Text style={[
                                        styles.statusBadge,
                                        { backgroundColor: getPriorityColor(selectedReport.priority) }
                                    ]}>
                                        {selectedReport.priority}
                                    </Text>
                                    <Text style={styles.statusBadge2}>
                                        {selectedReport.status}
                                    </Text>
                                </View>
                                
                                <View style={styles.infoRow}>
                                    <Icon name="description" size={20} color="#666" />
                                    <Text style={styles.infoText}>
                                        {selectedReport.description || 'No description provided'}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Icon name="place" size={20} color="#666" />
                                    <Text style={styles.infoText}>
                                        {`${selectedReport.building_id} - ${selectedReport.facility_id}`}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Icon name="access-time" size={20} color="#666" />
                                    <Text style={styles.infoText}>
                                        Submitted: {new Date(selectedReport.submitted_at?.toDate()).toLocaleString()}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
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
        maxHeight: '50%',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calloutContainer: {
        width: 160,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    calloutTitle: {
        fontWeight: '700',
        fontSize: 14,
        marginBottom: 4,
        color: '#1a2847',
    },
    calloutText: {
        fontSize: 12,
        marginBottom: 4,
        color: '#333',
    },
    calloutStatus: {
        fontSize: 12,
        fontWeight: '500',
        color: '#ff6347',
    },
    reportMarker: {
        backgroundColor: '#ff6347',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
    },
    statusContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginRight: 8,
    },
    statusBadge2: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#e9ecef',
        color: '#495057',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default Map;



