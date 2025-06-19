import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const Help = () => {
    const navigation = useNavigation<NavigationProp<any>>();

    const handlePhoneCall = () => {
        Linking.openURL('tel:06-252-3447');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:fmd_melaka@mmu.edu.my');
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#1a2847" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{width: 24}} /> {/* Empty view for alignment */}
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* FMD Logo/Icon */}
                <View style={styles.logoContainer}>
                    <Icon name="apartment" size={60} color="#1a2847" />
                    <Text style={styles.logoText}>Facilities Management Division (FMD)</Text>
                    <Text style={styles.logoSubText}>Melaka Campus</Text>
                </View>

                <Text style={styles.sectionTitle}>Contact Information</Text>

                {/* Phone Number Card */}
                <TouchableOpacity style={styles.contactCard} onPress={handlePhoneCall}>
                    <View style={styles.contactIconContainer}>
                        <Icon name="phone" size={28} color="#1a2847" />
                    </View>
                    <View style={styles.contactTextContainer}>
                        <Text style={styles.contactLabel}>Phone Number</Text>
                        <Text style={styles.contactValue}>06-252-3447 / 3448</Text>
                        <Text style={styles.contactNote}>Tap to call</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#ccc" />
                </TouchableOpacity>

                {/* Email Card */}
                <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
                    <View style={styles.contactIconContainer}>
                        <Icon name="email" size={28} color="#1a2847" />
                    </View>
                    <View style={styles.contactTextContainer}>
                        <Text style={styles.contactLabel}>Email Address</Text>
                        <Text style={styles.contactValue}>fmd_melaka@mmu.edu.my</Text>
                        <Text style={styles.contactNote}>Tap to send an email</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#ccc" />
                </TouchableOpacity>

                {/* Office Hours */}
                <View style={styles.contactCard}>
                    <View style={styles.contactIconContainer}>
                        <Icon name="schedule" size={28} color="#1a2847" />
                    </View>
                    <View style={styles.contactTextContainer}>
                        <Text style={styles.contactLabel}>Office Hours</Text>
                        <Text style={styles.contactValue}>Monday - Friday</Text>
                        <Text style={styles.contactValue}>8:30 AM - 5:30 PM</Text>
                    </View>
                </View>

                {/* Additional Information */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>About FMD</Text>
                    <Text style={styles.infoText}>
                        The Facilities Management Division (FMD) is responsible for maintaining
                        campus infrastructure, facilities and equipment. Report any maintenance
                        issues through this app for prompt attention.
                    </Text>
                </View>

                {/* App Info */}
                <View style={styles.footerContainer}>
                    <Text style={styles.appVersion}>FixIT Facility Maintenance App v1.0.0</Text>
                    <Text style={styles.copyright}>© 2023 MMU</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a2847',
    },
    content: {
        padding: 16,
    },
    logoContainer: {
        alignItems: 'center',
        marginVertical: 24,
    },
    logoText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a2847',
        marginTop: 12,
        textAlign: 'center',
    },
    logoSubText: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a2847',
        marginBottom: 16,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    contactIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactTextContainer: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 14,
        color: '#666',
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1a2847',
        marginTop: 2,
    },
    contactNote: {
        fontSize: 12,
        color: '#1a2847',
        opacity: 0.7,
        marginTop: 2,
    },
    infoContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        marginBottom: 24,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a2847',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 32,
    },
    appVersion: {
        fontSize: 12,
        color: '#999',
    },
    copyright: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
});

export default Help; 