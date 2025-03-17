import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Callout, Marker, PoiClickEvent, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkIsReporter, getReport } from '../service/reportServices';
import { useIsFocused } from '@react-navigation/native';
import getPriorityColor from '../util/priorityStyling';
import TrackingButton from './trackingButton';

interface BuildingGroup {
    buildingId: string;
    reports: any[];
    latitude: number;
    longitude: number;
}

const Map = () => {

    const INITIAL_REGION = {
        latitude: 2.2490057879268996,  
        longitude: 102.27706624157103,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
    };
    const [loading, setLoading] = useState(true);
    const [selectedPoi, setSelectedPoi] = useState<any>(null);
    const [region, setRegion] = useState<Region>(INITIAL_REGION);
    const [reports, setReports] = useState<any[]>([]);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [isStudent, setIsStudent] = useState(false);
    const [isReporter, setIsReporter] = useState(false);
    const isFocused = useIsFocused();
    
    const [buildingGroups, setBuildingGroups] = useState<BuildingGroup[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingGroup | null>(null);
    
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

    const checkUserType = async () => {
        try {
            const userType = await AsyncStorage.getItem('userType');
            if(userType){
                if(userType === 'Student'){
                    setIsStudent(true);
                }
            }
        } catch (error) {
            console.error('Error checking user type: ', error);
        }
    }

    const checkIsReporter = async (report_user_id:string) => {
        const userEmail = await AsyncStorage.getItem('userEmail');
        if(userEmail){
           const userID = userEmail.split('@')[0];
           if(report_user_id === userID){
            setIsReporter(true);
           }
        }
    }

    const handlePoiClick = (event: PoiClickEvent) => {
        const poi = event.nativeEvent;
        setSelectedPoi(poi);
        setSelectedReport(null);
    }

    const handleReportPress = (report: any) => {
        setSelectedReport(report);
        checkUserType();
        checkIsReporter(report.user_id);
        setSelectedPoi(null);
    }

    const handleRegionChange = (newRegion: Region) => {
        setRegion(newRegion);
    };

    // Group reports by building
    useEffect(() => {
        const groupedByBuilding = reports.reduce((acc: { [key: string]: any[] }, report) => {
            const buildingId = report.building_id;
            if (!acc[buildingId]) {
                acc[buildingId] = [];
            }
            acc[buildingId].push(report);
            return acc;
        }, {});

        // Convert to array of building groups with location
        const buildingGroupsArray = Object.entries(groupedByBuilding).map(([buildingId, buildingReports]) => {
            // Use the location of the first report as the building location
            const firstReport = buildingReports[0];
            return {
                buildingId,
                reports: buildingReports,
                latitude: firstReport.latitude,
                longitude: firstReport.longitude
            };
        });

        setBuildingGroups(buildingGroupsArray);
    }, [reports]);

    const handleBuildingPress = (building: BuildingGroup) => {
        setSelectedBuilding(building);
        setSelectedReport(null);
        setIsStudent(false);
        setIsReporter(false);

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
                onRegionChangeComplete={handleRegionChange}
                onPoiClick={handlePoiClick}
            >
                {buildingGroups.map((building) => (
                    <Marker
                        key={`building-${building.buildingId}`}
                        coordinate={{
                            latitude: building.latitude,
                            longitude: building.longitude
                        }}
                        onPress={() => handleBuildingPress(building)}
                    >
                        <View style={[
                            styles.buildingMarker,
                            { backgroundColor: getPriorityColor(
                                building.reports.reduce((highest, report) => 
                                    getPriorityColor(report.priority) > getPriorityColor(highest) 
                                        ? report.priority 
                                        : highest
                                , 'Low')
                            )}
                        ]}>
                            <Text style={styles.buildingMarkerText}>
                                {building.reports.length}
                            </Text>
                        </View>
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
                                <View style={styles.infoRow}>
                                {(isStudent) && (!isReporter) &&  (
                                        <TrackingButton 
                                        reportID={selectedReport.report_id}
                                        />
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={selectedBuilding !== null}
                transparent={true}
                animationType='slide'
                onRequestClose={() => setSelectedBuilding(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Building {selectedBuilding?.buildingId} ({selectedBuilding?.reports.length} reports)
                            </Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setSelectedBuilding(null)}
                            >
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.reportsList}>
                            {selectedBuilding?.reports.map((report) => (
                                <TouchableOpacity 
                                    key={report.report_id}
                                    style={styles.reportItem}
                                    onPress={() => {
                                        setSelectedBuilding(null);
                                        handleReportPress(report);
                                    }}
                                >
                                    <View style={[
                                        styles.priorityIndicator,
                                        { backgroundColor: getPriorityColor(report.priority) }
                                    ]} />
                                    <View style={styles.reportItemContent}>
                                        <Text style={styles.reportItemTitle}>{report.fault_type}</Text>
                                        <Text style={styles.reportItemDesc} numberOfLines={1}>
                                            {report.description?.substring(0, 50)}
                                            {report.description?.length > 50 ? '...' : ''}
                                        </Text>
                                        <Text style={styles.reportItemStatus}>Status: {report.status}</Text>
                                    </View>
                                    <Icon name="chevron-right" size={20} color="#ccc" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    buildingMarker: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buildingMarkerText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
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
        maxHeight: '70%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
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
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    reportsList: {
        maxHeight: '80%',
    },
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    priorityIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    reportItemContent: {
        flex: 1,
        marginRight: 8,
    },
    reportItemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    reportItemDesc: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    reportItemStatus: {
        fontSize: 12,
        color: '#888',
    },
});

export default Map;



