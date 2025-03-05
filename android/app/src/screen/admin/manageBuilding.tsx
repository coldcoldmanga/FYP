import React from "react"   ;
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

const ManageBuilding = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text>Manage Building</Text>
            </View>
        </SafeAreaView>
    );
};

export default ManageBuilding;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
