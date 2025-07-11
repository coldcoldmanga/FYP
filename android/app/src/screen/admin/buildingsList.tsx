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
    RefreshControl
} from 'react-native';
import { NavigationProp, useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getBuilding, deleteBuilding } from '../../service/buildingServices';
import EditBuildingModal from '../../component/admin/tab/editBuildingModal';
import BuildingDetail from '../../component/admin/tab/buildingDetail';
import { cacheManager } from '../../util/cacheHelper';

type Building = {
    building_id: string;
    [key: string]: any;
}

const BuildingsList = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState<any | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isBuildingDetailVisible, setIsBuildingDetailVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            loadBuildings();
        }
    }, [isFocused]);

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
            setFilteredBuildings(data);
        } catch (error) {
            console.error('Error loading buildings:', error);
            Alert.alert('Error', 'Failed to load buildings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const refreshBuildings = () => {
        setRefreshing(true);
        // Invalidate the buildings cache
        cacheManager.invalidate('admin_buildings_list');
        loadBuildings();
    };

    const handleSearch = (buildingName: string) => {
        setSearchQuery(buildingName);
        if (buildingName) {
            const filtered = buildings.filter((building) => 
                building.building_name.toLowerCase().includes(buildingName.toLowerCase())
            );
            setFilteredBuildings(filtered);
        } else {
            setFilteredBuildings(buildings);
        }
    }

    const handleEdit = (buildingId: string) => {
        setSelectedBuilding(buildings.find(building => building.building_id === buildingId));
        setIsEditModalVisible(true);
    };

    const handleModalClose = () => {
        setIsEditModalVisible(false);
        setSelectedBuilding(null);
    };

    const handleViewDetails = (building: any) => {
        setSelectedBuilding(building);
        setIsBuildingDetailVisible(true);
    };

    const handleDetailClose = () => {
        setIsBuildingDetailVisible(false);
        setSelectedBuilding(null);
    };

    const handleDelete = (buildingId: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this building?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteBuilding(buildingId);
                            // Invalidate the buildings cache after deletion
                            cacheManager.invalidate('admin_buildings_list');
                            loadBuildings(); // Reload the list
                            Alert.alert('Success', 'Building deleted successfully');
                        } catch (error) {
                            console.error('Error deleting building:', error);
                            Alert.alert('Error', 'Failed to delete building');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            onPress={() => handleViewDetails(item)}
            style={styles.buildingCard}
        >
            <View style={styles.buildingInfo}>
                <Text style={styles.buildingName}>{item.building_name}</Text>
                {item.building_id && (
                    <Text style={styles.buildingCode}>{item.building_id}</Text>
                )}
            </View>
            <View style={styles.actions}>
                <TouchableOpacity 
                    onPress={(e) => {
                        e.stopPropagation(); 
                        handleEdit(item.building_id);
                    }}
                    style={styles.actionButton}
                >
                    <Icon name="edit" size={24} color="#4A90E2" />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent triggering the card's onPress
                        handleDelete(item.building_id);
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
                <Text style={styles.headerTitle}>Buildings</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput  
                    placeholder="Search building by building name"
                    placeholderTextColor="#666666"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            <FlatList
                data={filteredBuildings}
                renderItem={renderItem}
                keyExtractor={(item) => item.building_id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refreshBuildings}
                        colors={['#4A90E2']}
                    />
                }
                ListEmptyComponent={() => (
                    loading ? null : <Text style={styles.emptyText}>No buildings found</Text>
                )}
            />

            <View style={styles.bottomSpacer}/>

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('AddBuilding')}
            >
                <Icon name="add" size={24} color="#FFF" />
            </TouchableOpacity>

            <EditBuildingModal
                visible={isEditModalVisible}
                building={selectedBuilding}
                onClose={handleModalClose}
                onUpdate={() => {
                    // Invalidate the buildings cache after update
                    cacheManager.invalidate('admin_buildings_list');
                    loadBuildings();
                }}
            />

            <BuildingDetail
                visible={isBuildingDetailVisible}
                building={selectedBuilding}
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
    bottomSpacer: {
        height: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    listContainer: {
        padding: 16,
    },
    buildingCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
    },
    buildingInfo: {
        flex: 1,
    },
    buildingName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    buildingCode: {
        fontSize: 14,
        color: '#666',
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
});

export default BuildingsList;