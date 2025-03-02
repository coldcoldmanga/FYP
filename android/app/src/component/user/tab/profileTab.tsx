import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from '../../../services/authServices';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const ProfileTab = () => {
    const navigation = useNavigation<NavigationProp<any>>();

    const handleLogout = async () => {
        try {
            await logout();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            });
        } catch (error) {
            console.error('Logout Error: ', error);
        }
    };

    // Sample user data
    const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        studentId: '2024123456',
        building: 'Building A',
        room: 'Room 301'
    };

    const menuItems = [
        {
            icon: 'person-outline',
            title: 'Personal Information',
            subtitle: 'Update your personal details',
            action: () => console.log('Personal Info pressed')
        },
        {
            icon: 'notifications-none',
            title: 'Notifications',
            subtitle: 'Manage your notification preferences',
            action: () => console.log('Notifications pressed')
        },
        {
            icon: 'security',
            title: 'Security',
            subtitle: 'Password and security settings',
            action: () => console.log('Security pressed')
        },
        {
            icon: 'help-outline',
            title: 'Help & Support',
            subtitle: 'Get help or contact support',
            action: () => console.log('Help pressed')
        }
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/100' }}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity style={styles.editImageButton}>
                        <Icon name="camera-alt" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
            </View>

            {/* User Info Cards */}
            <View style={styles.infoContainer}>
                <View style={styles.infoCard}>
                    <Icon name="badge" size={20} color="#1a2847" />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Student ID</Text>
                        <Text style={styles.infoValue}>{userData.studentId}</Text>
                    </View>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.menuItem}
                        onPress={item.action}
                    >
                        <Icon name={item.icon} size={24} color="#1a2847" />
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Icon name="logout" size={20} color="#FF3B30" />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editImageButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#1a2847',
        padding: 8,
        borderRadius: 20,
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1a2847',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
    },
    infoContainer: {
        padding: 16,
        gap: 12,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    infoContent: {
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
    },
    infoValue: {
        fontSize: 16,
        color: '#1a2847',
        fontWeight: '500',
    },
    menuContainer: {
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    menuContent: {
        flex: 1,
        marginLeft: 16,
    },
    menuTitle: {
        fontSize: 16,
        color: '#1a2847',
        fontWeight: '500',
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 32,
        paddingVertical: 12,
        marginHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#FFF0F0',
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '500',
    },
});

export default ProfileTab;