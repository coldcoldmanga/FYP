import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { logout } from '../../services/authServices';
import { NavigationProp } from '@react-navigation/native';
import HomeTab from '../../component/worker/tab/homeTab';
import ProfileTab from '../../component/user/tab/profileTab';
import ReportTab from '../../component/user/tab/reportTab';
import BottomNavBar from '../../component/bottomNavBar';

const WorkerHome = ({navigation}: {navigation: NavigationProp<any>}) => {

    const [ activeTab, setActiveTab] = useState('Home');

    const renderTabContent = () => {
        switch(activeTab){
            case 'Home':
                return <HomeTab navigation={navigation} />;
            case 'Profile':
                return <ProfileTab />;
            case 'Report':
                return <ReportTab />;
            default:
                return <HomeTab navigation={navigation} />;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    {renderTabContent()}
                </View>

                <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

            </View>
        </SafeAreaView>
    )
}

export default WorkerHome;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    content: {
        flex: 1,
    },
    bottomNav: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#FFF',
        borderTopWidth: 0,
        borderTopColor: '#E5E5E5',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 20,
        left: 20,
        right: 20,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
    },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 0,
        paddingBottom: Platform.OS === 'android' ? 0 : 20,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        fontSize: 12,
        marginTop: 4,
        color: '#666',
    },
    activeNavText: {
        color: '#4A90E2',
    },
});