import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker, LatLng, PROVIDER_GOOGLE } from 'react-native-maps';
import { addBuilding } from '../../service/buildingServices';

const INITIAL_REGION = {
    latitude: 2.2490057879268996,  
                    longitude: 102.27706624157103,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
};

const AddBuilding = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
    const [mapRegion, setMapRegion] = useState(INITIAL_REGION);
    const [formData, setFormData] = useState({
        building_name: '',
        building_id: '',
        description: '',
        location: null as { latitude: number, longitude: number } | null,
        created_at: new Date(),
        updated_at: new Date()
    });

    useEffect(() => {
        // Set the initial region when the component mounts
        setMapRegion(INITIAL_REGION);
        setLoading(false);
    }, []);

    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;
        setSelectedLocation(coordinate);
        setFormData(prev => ({
            ...prev,
            location: {
                latitude: coordinate.latitude,
                longitude: coordinate.longitude
            }
        }));
    };

    const handlePoiClick = (event: any) => {
        const { coordinate, name, placeId } = event.nativeEvent;
        setSelectedLocation(coordinate);
        setFormData(prev => ({
            ...prev,
            building_name: name || prev.building_name,
            location: {
                latitude: coordinate.latitude,
                longitude: coordinate.longitude
            }
        }));
    };

    const handleSubmit = async () => {
        if (!formData.building_name.trim()) {
            Alert.alert('Error', 'Building name is required');
            return;
        }

        if (!formData.location) {
            Alert.alert('Error', 'Please select a location on the map');
            return;
        }

        try {
            await addBuilding(formData);
            Alert.alert('Success', 'Building added successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error adding building:', error);
            Alert.alert('Error', 'Failed to add building');
        } finally {
            setLoading(false);
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Building</Text>
            </View>

            <ScrollView 
                style={styles.formContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.mapContainer}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={INITIAL_REGION}
                        mapType="hybrid"
                        onPress={handleMapPress}
                        onPoiClick={handlePoiClick}
                    >
                        {selectedLocation && (
                            <Marker
                                coordinate={selectedLocation}
                                title="Selected Location"
                            />
                        )}
                    </MapView>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Building Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.building_name}
                        onChangeText={(text) => setFormData({...formData, building_name: text})}
                        placeholder="Enter building name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Building Code</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.building_id}
                        onChangeText={(text) => setFormData({...formData, building_id: text})}
                        placeholder="Enter building code"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({...formData, description: text})}
                        placeholder="Enter description"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Selected Location</Text>
                    <Text style={styles.locationText}>
                        {selectedLocation 
                            ? `Lat: ${selectedLocation.latitude.toFixed(6)}, Lng: ${selectedLocation.longitude.toFixed(6)}`
                            : 'No location selected'
                        }
                    </Text>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Adding...' : 'Add Building'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
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
    mapContainer: {
        width: '100%',
        height: 300,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    formContainer: {
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    submitButton: {
        backgroundColor: '#4A90E2',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AddBuilding;