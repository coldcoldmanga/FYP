import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FacilityTab = () => {
    const navigation = useNavigation<NavigationProp<any>>();

    const navigateToBuildings = () => {
        navigation.navigate('BuildingsList');
    };

    const navigateToFacilities = () => {
        navigation.navigate('FacilitiesList');
    };

    const navigateToEquipment = () => {
        navigation.navigate('EquipmentsList');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.pageTitle}>Facility Management</Text>
                
                {/* Buildings Block */}
                <TouchableOpacity 
                    style={styles.navBlock}
                    onPress={navigateToBuildings}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="apartment" size={40} color="#1a2847" />
                    </View>
                    <View style={styles.blockTextContainer}>
                        <Text style={styles.blockTitle}>Buildings</Text>
                        <Text style={styles.blockDescription}>
                            Manage all buildings and their details
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#1a2847" />
                </TouchableOpacity>
                
                {/* Facilities Block */}
                <TouchableOpacity 
                    style={styles.navBlock}
                    onPress={navigateToFacilities}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="meeting-room" size={40} color="#1a2847" />
                    </View>
                    <View style={styles.blockTextContainer}>
                        <Text style={styles.blockTitle}>Facilities</Text>
                        <Text style={styles.blockDescription}>
                            Manage all facilities within buildings
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#1a2847" />
                </TouchableOpacity>
                
                {/* Equipment Block */}
                {/* <TouchableOpacity 
                    style={styles.navBlock}
                    onPress={navigateToEquipment}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="build" size={40} color="#1a2847" />
                    </View>
                    <View style={styles.blockTextContainer}>
                        <Text style={styles.blockTitle}>Equipment</Text>
                        <Text style={styles.blockDescription}>
                            Manage all equipment within facilities
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#1a2847" />
                </TouchableOpacity> */}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a2847',
        marginBottom: 24,
        textAlign: 'center',
    },
    navBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
    },
    iconContainer: {
        backgroundColor: '#f0f4f9',
        borderRadius: 12,
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    blockTextContainer: {
        flex: 1,
    },
    blockTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a2847',
        marginBottom: 4,
    },
    blockDescription: {
        fontSize: 14,
        color: '#666',
    },
});

export default FacilityTab;