import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const FacilityTab = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text>Facility</Text>
            </View>
        </SafeAreaView>
    );
};

export default FacilityTab;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
