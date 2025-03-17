import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Dimensions } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Map from '../../map';
import Notification from '../../notification';

const HomeTab = ({navigation}: {navigation: NavigationProp<any>}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotification, setShowNotification] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.container}>
            {/* Map View */}
            <Map />
            
            {/* Search Bar and Notification Container */}
            <View style={styles.topContainer}>
                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search locations (e.g. Building A, Room 301)"
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                
                {/* Notification Icon */}
                <TouchableOpacity style={styles.notificationButton} onPress={() => setShowNotification(true)}>
                    <Icon name="notifications" size={24} color="#1a2847" />
                </TouchableOpacity>
            </View>

            <Notification 
                visible={showNotification} 
                onClose={() => setShowNotification(false)} 
            />

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('SubmitReport')}>
                <Icon name="add" size={24} color="#FFF" />
            </TouchableOpacity>

            
        </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    topContainer: {
        position: 'absolute',
        top: 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
    notificationButton: {
        width: 45,
        height: 45,
        backgroundColor: '#FFF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 90,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1a2847',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1a2847', // Same as background color for seamless look
    },
});

export default HomeTab;