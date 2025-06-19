import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Dimensions } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Map from '../../map';
import Notification from '../../notification';

const HomeTab = ({navigation}: {navigation: NavigationProp<any>}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [submittedSearch, setSubmittedSearch] = useState('');
    const [showNotification, setShowNotification] = useState(false);

    const handleSearch = () => {
        setSubmittedSearch(searchQuery.trim());
    };

    const handleClear = () => {
        setSearchQuery('');
        setSubmittedSearch('');
    };

    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.container}>
            <Map searchText={submittedSearch} />
           
            <View style={styles.topContainer}>
                <View style={styles.searchBarContainer}>
                    <TouchableOpacity onPress={handleSearch} style={{marginLeft:8,padding:6}}>
                        <Icon name="search" size={24} color="#1a2847" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search buildings"
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={handleClear} style={{padding:4}}>
                            <Icon name="close" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
                
               
                <TouchableOpacity style={styles.notificationButton} onPress={() => setShowNotification(true)}>
                    <Icon name="notifications" size={24} color="#1a2847" />
                </TouchableOpacity>
            </View>

            <Notification 
                visible={showNotification} 
                onClose={() => setShowNotification(false)} 
            />

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
        borderColor: '#1a2847',
    },
});

export default HomeTab;