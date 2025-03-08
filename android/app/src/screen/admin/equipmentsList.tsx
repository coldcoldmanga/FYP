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
import { getEquipment, deleteEquipment } from '../../service/equipmentServices';
import EditEquipmentModal from '../../component/admin/tab/editEquipmentModal';
import EquipmentDetail from '../../component/admin/tab/equipmentDetail';

const EquipmentsList = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [equipments, setEquipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEquipment, setSelectedEquipment] = useState<any | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isEquipmentDetailVisible, setIsEquipmentDetailVisible] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            loadEquipments();
        }
    }, [isFocused]);

    const loadEquipments = async () => {
        setLoading(true);
        try {
            const data = await getEquipment();
            setEquipments(data);
        } catch (error) {
            console.error('Error loading equipment:', error);
            Alert.alert('Error', 'Failed to load equipment');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (equipmentId: string) => {
        setSelectedEquipment(equipments.find(equipment => equipment.id === equipmentId));
        setIsEditModalVisible(true);
    };

    const handleModalClose = () => {
        setIsEditModalVisible(false);
        setSelectedEquipment(null);
    };

    const handleViewDetails = (equipment: any) => {
        setSelectedEquipment(equipment);
        setIsEquipmentDetailVisible(true);
    };

    const handleDetailClose = () => {
        setIsEquipmentDetailVisible(false);
        setSelectedEquipment(null);
    };

    const handleDelete = (equipmentId: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this equipment?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteEquipment(equipmentId);
                            loadEquipments();
                            Alert.alert('Success', 'Equipment deleted successfully');
                        } catch (error) {
                            console.error('Error deleting equipment:', error);
                            Alert.alert('Error', 'Failed to delete equipment');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.equipmentCard} onPress={() => handleViewDetails(item)}>
            <View style={styles.equipmentInfo}>
                <Text style={styles.equipmentName}>{item.equipment_name}</Text>
                <View style={styles.detailsRow}>
                    {item.equipment_type && (
                        <Text style={styles.equipmentType}>{item.equipment_type}</Text>
                    )}
                    {item.facility_name && (
                        <Text style={styles.facilityName}>in {item.facility_name}</Text>
                    )}
                </View>
                {item.status && (
                    <View style={[styles.statusBadge, 
                        { backgroundColor: item.status === 'Active' ? '#e8f5e9' : '#ffebee' }
                    ]}>
                        <Text style={[styles.statusText, 
                            { color: item.status === 'Active' ? '#2e7d32' : '#c62828' }
                        ]}>
                            {item.status}
                        </Text>
                    </View>
                )}
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
                <Text style={styles.headerTitle}>Equipment</Text>
            </View>

            <FlatList
                data={equipments}
                renderItem={renderItem}
                keyExtractor={(item) => item.equipment_id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    loading ? null : <Text style={styles.emptyText}>No equipment found</Text>
                )}
            />

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('AddEquipment')}
            >
                <Icon name="add" size={24} color="#FFF" />
            </TouchableOpacity>

            <EditEquipmentModal
                visible={isEditModalVisible}
                equipment={selectedEquipment}
                onClose={handleModalClose}
                onUpdate={loadEquipments}
            />

            <EquipmentDetail
                visible={isEquipmentDetailVisible}
                equipment={selectedEquipment}
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
    equipmentCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
    },
    equipmentInfo: {
        flex: 1,
    },
    equipmentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    equipmentType: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    facilityName: {
        fontSize: 14,
        color: '#4A90E2',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
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

export default EquipmentsList;