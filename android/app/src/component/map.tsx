import React, { useState } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView, { PoiClickEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
const Map = () => {

    const [selectedPoi, setSelectedPoi] = useState<any>(null);

    const handlePoiClick = (event: PoiClickEvent) => {
        const poi = event.nativeEvent;
        console.log(poi);
        setSelectedPoi(poi);
    }
    return (
            <View>
                <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                mapType='hybrid'
                initialRegion={{
                    latitude: 2.2490057879268996,  
                    longitude: 102.27706624157103,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
                }}
                zoomEnabled={true}           // Enable pinch to zoom
                zoomTapEnabled={true}        // Enable double tap to zoom
                scrollEnabled={true}         // Enable pan/drag to move
                rotateEnabled={true}         // Enable two-finger rotate
                pitchEnabled={true}          // Enable two-finger tilt
                toolbarEnabled={true}        // Show toolbar (Android only)
                moveOnMarkerPress={true}     // Center map when marker is pressed
                showsUserLocation={true}     // Show user's location
                showsMyLocationButton={true} // Show 'center on user' button
                showsCompass={true}          // Show compass when map is rotated
                showsScale={true}            // Show scale bar
                showsBuildings={true}        // Show 3D buildings
                showsTraffic={true}
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
});

export default Map;



