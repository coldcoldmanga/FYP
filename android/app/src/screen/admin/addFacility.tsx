import React from "react"   ;
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

const AddFacility = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text>Add Facility</Text>
            </View>
        </SafeAreaView>
    );
};

export default AddFacility;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
