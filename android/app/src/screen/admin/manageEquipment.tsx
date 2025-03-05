import React from "react"   ;
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

const ManageEquipment = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text>Manage Equipment</Text>
            </View>
        </SafeAreaView>
    );
};

export default ManageEquipment;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
