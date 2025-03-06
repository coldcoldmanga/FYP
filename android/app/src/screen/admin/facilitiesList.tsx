import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    FlatList,
    TouchableOpacity,
    Alert
} from 'react-native';
import { NavigationProp, useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFacility, deleteFacility } from '../../service/facilityServices';
import EditFacilityModal from '../../component/admin/tab/editFacilityModal';
import FacilityDetail from '../../component/admin/tab/facilityDetail';

const FacilitiesList = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isFacilityDetailVisible, setIsFacilityDetailVisible] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            loadFacilities();
        }
    }, [isFocused]);

    const loadFacilities = async () => {
        try {
            const data = await getFacility();
            setFacilities(data);
        } catch (error) {
            console.error('Error loading facilities:', error);
            Alert.alert('Error', 'Failed to load facilities');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (facilityId: string) => {
        setSelectedFacility(facilities.find(facility => facility.id === facilityId));
        setIsEditModalVisible(true);
    };

    const handleModalClose = () => {
        setIsEditModalVisible(false);
        setSelectedFacility(null);
    };

    const handleViewDetails = (facility: any) => {
        setSelectedFacility(facility);
        setIsFacilityDetailVisible(true);
    };

    const handleDetailClose = () => {
        setIsFacilityDetailVisible(false);
        setSelectedFacility(null);
    };

    const handleDelete = (facilityId: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this facility?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteFacility(facilityId);
                            loadFacilities();
                            Alert.alert('Success', 'Facility deleted successfully');
                        } catch (error) {
                            console.error('Error deleting facility:', error);
                            Alert.alert('Error', 'Failed to delete facility');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            onPress={() => handleViewDetails(item)}
            style={styles.facilityCard}
        >
            <View style={styles.facilityInfo}>
                <Text style={styles.facilityName}>{item.facility_name}</Text>
                <View style={styles.detailsRow}>
                    {item.facility_type && (
                        <Text style={styles.facilityType}>{item.facility_type}</Text>
                    )}
                    {item.building_name && (
                        <Text style={styles.buildingName}>in {item.building_name}</Text>
                    )}
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity 
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent triggering the card's onPress
                        handleEdit(item.id);
                    }}
                    style={styles.actionButton}
                >
                    <Icon name="edit" size={24} color="#4A90E2" />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent triggering the card's onPress
                        handleDelete(item.id);
                    }}
                    style={styles.actionButton}
                >
                    <Icon name="delete" size={24} color="#FF4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Facilities</Text>
            </View>

            <FlatList
                data={facilities}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    loading ? null : <Text style={styles.emptyText}>No facilities found</Text>
                )}
            />

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('AddFacility')}
            >
                <Icon name="add" size={24} color="#FFF" />
            </TouchableOpacity>

            <EditFacilityModal
                visible={isEditModalVisible}
                facility={selectedFacility}
                onClose={handleModalClose}
                onUpdate={loadFacilities}
            />

            <FacilityDetail
                visible={isFacilityDetailVisible}
                facility={selectedFacility}
                onClose={handleDetailClose}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    facilityCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
    },
    facilityInfo: {
        flex: 1,
    },
    facilityName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    facilityType: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    buildingName: {
        fontSize: 14,
        color: '#4A90E2',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
        marginLeft: 8,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#4A90E2',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        marginTop: 24,
    },
});

export default FacilitiesList;