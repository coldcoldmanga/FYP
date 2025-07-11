import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl
} from 'react-native';
import { NavigationProp, useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getWorker, updateAdmin, deleteAdmin, updateWorker, deleteWorker } from '../../service/userServices';
import { getFirestore, collection, query, where, getDocs } from '@react-native-firebase/firestore';
import { firebaseApp } from '../../config/firebase';
import WorkerDetail from '../../component/admin/tab/adminWorkerDetails';
import EditWorkerModal from '../../component/admin/tab/editAdminWorkers';

const firestore = getFirestore(firebaseApp);

const AdminWorkerList = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
    const [isWorkerDetailVisible, setIsWorkerDetailVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            loadStaff();
        }
    }, [isFocused]);

    const getAdmins = async () => {
        try {
            const adminQuery = query(
                collection(firestore, 'user'), 
                where('user_type', '==', 'Admin')
            );
            const adminSnapshot = await getDocs(adminQuery);
            return adminSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error('Get Admin Error:', error);
            throw error;
        }
    };

    const loadStaff = async () => {
        setLoading(true);
        try {
            const maintenanceWorkers = await getWorker();
            
            const adminUsers = await getAdmins();
            
            const allStaff = [...maintenanceWorkers, ...adminUsers];
            
            setWorkers(allStaff);
        } catch (error) {
            console.error('Error loading staff:', error);
            Alert.alert('Error', 'Failed to load staff members');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const refreshStaff = () => {
        setRefreshing(true);
        loadStaff();
    };

    const handleViewDetails = (worker: any) => {
        setSelectedWorker(worker);
        setIsWorkerDetailVisible(true);
    };

    const handleDetailClose = () => {
        setIsWorkerDetailVisible(false);
        setSelectedWorker(null);
    };

    const handleEdit = (worker: any) => {
        let specializations = [];
        
        if (worker.specialize && Array.isArray(worker.specialize)) {
            specializations = worker.specialize.map((spec: string) => spec.trim()).filter(Boolean);
        }
        
        const workerData = {
            ...worker,
            id: worker.id,
            fullname: worker.fullname || '',
            email: worker.email || '',
            phone_number: worker.phone_number || '',
            user_type: worker.user_type || '',
            status: worker.status || 'Active',
            super_admin: worker.super_admin || false,
            specialize: specializations
        };
        setSelectedWorker(workerData);
        setIsEditModalVisible(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalVisible(false);
        setSelectedWorker(null);
    };

    const handleDelete = (worker: any) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete this ${worker.user_type}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (worker.user_type === 'Admin') {
                                await deleteAdmin(worker.id);
                            } else if (worker.user_type === 'Maintenance Worker') {
                                await deleteWorker(worker.id);
                            }
                            loadStaff(); // Reload the list
                            Alert.alert('Success', `${worker.user_type} deleted successfully`);
                        } catch (error) {
                            console.error(`Error deleting ${worker.user_type}:`, error);
                            Alert.alert('Error', `Failed to delete ${worker.user_type}`);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.workerCard} onPress={() => handleViewDetails(item)}>
            <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{item.fullname}</Text>
                <View style={styles.detailsRow}>
                    <Text style={styles.workerType}>{item.user_type}:</Text>
                    <Text style={styles.workerEmail}>{item.email}</Text>
                </View>
                
                <View style={styles.tagsContainer}>
                    {item.status && (
                        <View style={[styles.statusBadge, 
                            { backgroundColor: item.status.toLowerCase() === 'active' ? '#e8f5e9' : '#ffebee' }
                        ]}>
                            <Text style={[styles.statusText, 
                                { color: item.status.toLowerCase() === 'active' ? '#2e7d32' : '#c62828' }
                            ]}>
                                {item.status}
                            </Text>
                        </View>
                    )}
                </View>
                
                {item.user_type === 'Admin' && item.super_admin && (
                    <View style={styles.superAdminBadge}>
                        <Text style={styles.superAdminText}>Super Admin</Text>
                    </View>
                )}
                
                {item.user_type === 'Maintenance Worker' && item.specialize && item.specialize.length > 0 && (
                    <View style={styles.specializationContainer}>
                        {item.specialize.map((spec: string, index: number) => (
                            <View key={index} style={styles.specializationBadge}>
                                <Text style={styles.specializationText}>{spec.trim()}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
            <View style={styles.actions}>
                <TouchableOpacity 
                    onPress={(e) => {
                        e.stopPropagation(); 
                        handleEdit(item);
                    }}
                    style={styles.actionButton}
                >
                    <Icon name="edit" size={24} color="#4A90E2" />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={(e) => {
                        e.stopPropagation(); 
                        handleDelete(item);
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
                <Text style={styles.headerTitle}>Staff Management</Text>
            </View>

            <FlatList
                data={workers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refreshStaff}
                        colors={['#4A90E2']}
                    />
                }
                ListEmptyComponent={() => (
                    loading ? null : <Text style={styles.emptyText}>No staff members found</Text>
                )}
            />

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('AddAdminWorker')}
            >
                <Icon name="add" size={24} color="#FFF" />
            </TouchableOpacity>

            <WorkerDetail
                visible={isWorkerDetailVisible}
                worker={selectedWorker}
                onClose={handleDetailClose}
            />

            <EditWorkerModal
                visible={isEditModalVisible}
                worker={selectedWorker}
                onClose={handleEditModalClose}
                onUpdate={loadStaff}
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
    workerCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
    },
    workerInfo: {
        flex: 1,
    },
    workerName: {
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
    workerType: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    workerEmail: {
        fontSize: 14,
        color: '#4A90E2',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    superAdminBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#fce4ec',
        marginTop: 4,
    },
    superAdminText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#c2185b',
    },
    specializationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginTop: 0,
    },
    specializationBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#4A90E2',
        borderRadius: 8,
        marginRight: 6,
        marginBottom: 6,
        backgroundColor: '#e3f2fd',
        alignItems: 'center',
    },
    specializationText: {
        color: '#4A90E2',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
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
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        marginTop: 24,
    },
    tagsContainer: {
        marginBottom: 8,
    },
});

export default AdminWorkerList;