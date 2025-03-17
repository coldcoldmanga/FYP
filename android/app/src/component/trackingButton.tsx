import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTracking, addTracking, deleteTracking } from '../service/trackingService';

interface TrackingButtonProps {
    reportID: string;
}

const TrackingButton = ({reportID}: TrackingButtonProps) => {

    const [isTracking, setIsTracking] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(()=> {
        checkTrackingStatus();
    }, [reportID]);

    const checkTrackingStatus = async () =>  {
        try{
            setLoading(true);
            const userEmail = await AsyncStorage.getItem('userEmail');
            if(userEmail){
                const userID = userEmail.split('@')[0];
                const isTracking = await getTracking(userID, reportID);
                setIsTracking(isTracking);
                setLoading(false);
            }

        }catch(error){
            console.error('Error checking tracking status: ', error);
            Alert.alert('Error', 'Failed to check tracking status');
        }finally{
            setLoading(false);
        }
    };

    const handleTracking = async () => {
        try {
            setLoading(true);
            console.log('handleTracking');
            const userEmail = await AsyncStorage.getItem('userEmail');
            if(userEmail){
                const userID = userEmail.split('@')[0];
                if(isTracking){
                    Alert.alert('Stop Tracking', 'Are you sure you want to stop tracking this report?', [
                        {text: 'Cancel', style: 'cancel'},
                        {text: 'Stop', style: 'destructive', onPress: async () => {
                            await deleteTracking(userID, reportID);
                            setIsTracking(false);
                            Alert.alert('Tracking Stopped', `You are no longer tracking report ${reportID}`);
                        }}
                    ])
                }
                else{
                    const response = await addTracking(userID, reportID);
                    if(response){
                        setIsTracking(true);
                        Alert.alert('Tracking Started', `You are now tracking report ${reportID}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error handling tracking: ', error);
            Alert.alert('Error', 'Failed to update tracking status');
        } finally {
            setLoading(false);
        }
        
    };

    
  return (
    <TouchableOpacity
      style={[
        styles.trackingButton,
        isTracking ? styles.trackingActiveButton : {}
      ]}
      onPress={handleTracking}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Icon
            name={isTracking ? "notifications-active" : "notifications-none"}
            size={18}
            color="#fff"
          />
          <Text style={styles.trackingButtonText}>
            {isTracking ? "Stop Tracking" : "Track Report"}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2847',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  trackingActiveButton: {
    backgroundColor: '#ff6b6b',
  },
  trackingButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 14,
  },
});


export default TrackingButton;