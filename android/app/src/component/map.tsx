import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { PoiClickEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
const Map = () => {

    const INITIAL_REGION = {
        latitude: 2.2490057879268996,  
        longitude: 102.27706624157103,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
    };
    const [loading, setLoading] = useState(true);
    const [selectedPoi, setSelectedPoi] = useState<any>(null);
    const [region, setRegion] = useState({
        latitude: 2.2490057879268996,  
        longitude: 102.27706624157103,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
    });

    useEffect(() => {
        // Set the initial region when the component mounts
        setRegion(INITIAL_REGION);
        setLoading(false);
    }, []);

    const handlePoiClick = (event: PoiClickEvent) => {
        const poi = event.nativeEvent;
        setSelectedPoi(poi);
    }

    const handleRegionChange = (newRegion: any) => {
        setRegion(newRegion); // Update region as the user interacts with the map
    }

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
            />


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
});

export default Map;



