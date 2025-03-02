import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface BottomNavBarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const BottomNavBar = ({ activeTab, setActiveTab}: BottomNavBarProps) => {

    return (
<View style={styles.bottomNav}>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => setActiveTab('Home')}
                    >
                        <Icon
                            name = "home"
                            size = {24}
                            color = {activeTab === 'Home' ? '#4A90E2' : '#666'}
                        />
                        <Text 
                        style={[styles.navText, 
                        activeTab === 'Home' && 
                        styles.activeNavText]}>
                            Home
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.navItem} 
                        onPress={() => setActiveTab('Report')}
                    >
                        <Icon 
                            name="document-text" 
                            size={24} 
                            color={activeTab === 'Report' ? '#4A90E2' : '#666'} 
                        />
                        <Text style={[
                            styles.navText, 
                            activeTab === 'Report' && styles.activeNavText
                        ]}>Reports</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.navItem} 
                        onPress={() => setActiveTab('Profile')}
                    >
                        <Icon 
                            name="person" 
                            size={24} 
                            color={activeTab === 'Profile' ? '#4A90E2' : '#666'} 
                        />
                        <Text style={[
                            styles.navText, 
                            activeTab === 'Profile' && styles.activeNavText
                        ]}>Profile</Text>
                    </TouchableOpacity>
                    
                </View>
    );
};

export default BottomNavBar;

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#FFF',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 20,
        left: 20,
        right: 20,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        paddingBottom: Platform.OS === 'ios' ? 10 : 0,
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
