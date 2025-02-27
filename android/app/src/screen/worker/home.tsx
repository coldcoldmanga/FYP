import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { logout } from '../../services/authServices';
import { NavigationProp } from '@react-navigation/native';

const WorkerHome = ({navigation}: {navigation: NavigationProp<any>}) => {
    const handleLogout = async () => {
        try{
            await logout();
            navigation.reset({
                index: 0,
                routes: [{name: 'SignUp'}]
            })
        }catch(error){
            console.error('Logout Error: ', error);
        }
    }

    return (
        <View style={styles.container}>
            <Text>Maintenance Worker Home</Text>

            <TouchableOpacity onPress={() => handleLogout()}>
                <Text style={styles.linkText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    )
}

export default WorkerHome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: {
        color: '#1a2847',
        marginTop: 10,
        textDecorationLine: 'underline',
      },
});