import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    FlatList,
    TouchableOpacity,
    Alert,
    TextInput,
    Modal,
    RefreshControl
} from 'react-native';
import { NavigationProp, useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFacility, deleteFacility } from '../../service/facilityServices';
import EditFacilityModal from '../../component/admin/tab/editFacilityModal';
import FacilityDetail from '../../component/admin/tab/facilityDetail';
import { getBuilding } from '../../service/buildingServices';
import { Picker } from '@react-native-picker/picker';
import { cacheManager } from '../../util/cacheHelper';

type Building = {
    building_id: string;
    [key: string]: any;
}

const FacilitiesList = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [facilities, setFacilities] = useState<any[]>([]);
    const [filteredFacilities, setFilteredFacilities] = useState<any[]>([]);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isFacilityDetailVisible, setIsFacilityDetailVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [filteredBuilding, setFilteredBuilding] = useState<string>("");
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused && filteredBuilding == "") {
            loadBuildings();
            loadFacilities();
        }
    }, [isFocused]);
    
    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if(filteredBuilding){
            const filtered = filteredFacilities.filter((facility) => facility.facility_id.toLowerCase().includes(text.toLowerCase()));
            setFilteredFacilities(filtered);
        }else{
            const filtered = facilities.filter((facility) => facility.facility_id.toLowerCase().includes(text.toLowerCase()));
            setFilteredFacilities(filtered);
        }
    }

    const resetFilters = () => {
        setFilteredBuilding("");
        setFilteredFacilities(facilities);
        if (searchQuery) {
            const searchFiltered = facilities.filter((facility) => 
                facility.facility_id.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredFacilities(searchFiltered);
        }
    };

    const handleFilter = (buildingID: string) => {
        setFilteredBuilding(buildingID);
        setIsFilterModalVisible(false);
        
        if (buildingID) {
            const filtered = facilities.filter((facility) => 
                facility.building_id === buildingID && 
                (searchQuery ? facility.facility_id.toLowerCase().includes(searchQuery.toLowerCase()) : true)
            );
            setFilteredFacilities(filtered);
        } else {
            resetFilters();
        }
    };

    const loadFacilities = async () => {
        try {
            setLoading(true);
            
            // Define a cache key for facilities list
            const cacheKey = 'admin_facilities_list';
            
            // Use cacheManager to get data from cache or fetch from Firestore
            const data = await cacheManager.getOrFetch(cacheKey, async () => {
                console.log('Fetching facilities from Firestore...');
                return await getFacility();
            });
            
            setFacilities(data);
            setFilteredFacilities(data);
        } catch (error) {
            console.error('Error loading facilities:', error);
            Alert.alert('Error', 'Failed to load facilities');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadBuildings = async () => {
        try {
            setLoading(true);
            
            // Define a cache key for buildings list
            const cacheKey = 'admin_buildings_list';
            
            // Use cacheManager to get data from cache or fetch from Firestore
            const data = await cacheManager.getOrFetch(cacheKey, async () => {
                console.log('Fetching buildings from Firestore...');
                return await getBuilding();
            });
            
            setBuildings(data);
        } catch (error) {
            console.error('Error Loading Buildings:', error);
        } finally {
            setLoading(false);
        }
    }

    const refreshData = () => {
        setRefreshing(true);
        // Invalidate both facilities and buildings cache
        cacheManager.invalidate('admin_facilities_list');
        cacheManager.invalidate('admin_buildings_list');
        loadBuildings();
        loadFacilities();
    };

    const handleEdit = (facilityId: string) => {
        setSelectedFacility(facilities.find(facility => facility.facility_id === facilityId));
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
                            cacheManager.invalidate('admin_facilities_list');
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
                <Text style={styles.facilityName}>{item.facility_id}</Text>
                <View style={styles.detailsRow}>
                    {item.facility_type && (
                        <Text style={styles.facilityType}>{item.facility_name}</Text>
                    )}
                    {item.building_name && (
                        <Text style={styles.buildingName}>in {item.building_name}</Text>
                    )}
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity 
                    onPress={(e) => {
                        e.stopPropagation();
                        handleEdit(item.facility_id);
                    }}
                    style={styles.actionButton}
                >
                    <Icon name="edit" size={24} color="#4A90E2" />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(item.facility_id);
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

            <View style={styles.searchContainer}>
                <TextInput  
                    placeholder="Search facilities by Facility ID"
                    placeholderTextColor="#666666"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />

                <TouchableOpacity 
                    style={[
                        styles.filterButton, 
                        filteredBuilding ? styles.activeFilterButton : null
                    ]} 
                    onPress={() => setIsFilterModalVisible(true)}
                >
                    <Icon name="filter-list" size={24} color="#FFF" />
                </TouchableOpacity>
                
                {filteredBuilding ? (
                    <TouchableOpacity 
                        style={styles.resetButton}
                        onPress={resetFilters}
                    >
                        <Icon name="clear" size={20} color="#FFF" />
                    </TouchableOpacity>
                ) : null}

            </View>
           
            {filteredBuilding ? (
                <View style={styles.selectedFilterContainer}>
                    <Icon name="place" size={16} color="#4A90E2" />
                    <Text style={styles.selectedFilterText}>
                        Filtered by: {buildings.find(b => b.building_id === filteredBuilding)?.building_id || filteredBuilding}
                    </Text>
                </View>
            ) : null}  
    
            <FlatList
                data={filteredFacilities}
                renderItem={renderItem}
                keyExtractor={(item) => item.facility_id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refreshData}
                        colors={['#4A90E2']}
                    />
                }
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
                onUpdate={() => {
                    // Invalidate the facilities cache after update
                    cacheManager.invalidate('admin_facilities_list');
                    loadFacilities();
                }}
            />

            <FacilityDetail
                visible={isFacilityDetailVisible}
                facility={selectedFacility}
                onClose={handleDetailClose}
            />

            {/* Filter Modal */}
            <Modal
                visible={isFilterModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsFilterModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setIsFilterModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Filter by Building</Text>
                                    <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                                        <Icon name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>
                                <Picker 
                                    style={styles.picker} 
                                    selectedValue={filteredBuilding} 
                                    onValueChange={(value) => handleFilter(value)}
                                >
                                    <Picker.Item label="All Buildings" value="" />
                                    {buildings.map((building) => (
                                        <Picker.Item 
                                            key={building.building_id}
                                            label={building.building_id}
                                            value={building.building_id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        marginRight: 10,
    },
    filterButton: {
        padding: 10,
        backgroundColor: '#4A90E2',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
        height: 44,
    },
    picker: {
        width: '100%',
        height: 50,
        color: '#666666',
    },
    selectedFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 8,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    selectedFilterText: {
        color: '#666666',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalContent: {
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    activeFilterButton: {
        backgroundColor: '#2E7D32',
    },
    resetButton: {
        padding: 8,
        backgroundColor: '#FF5722',
        borderRadius: 15,
        marginLeft: 8,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default FacilitiesList;