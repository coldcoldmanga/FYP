import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminHome = () => {
    return (
        <View style={styles.container}>
            <Text>Admin Home</Text>
        </View>
    )
}

export default AdminHome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});