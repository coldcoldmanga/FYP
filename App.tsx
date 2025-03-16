import React, { useEffect } from 'react';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import AppNavigator from './android/app/src/navigation/appNavigator';
import { ONESIGNAL_APP_ID } from '@env';
import { checkPlayerID } from './android/app/src/service/onesignalServices';
const App = () => {
  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(true);
    const handleNotificationClick = (event: any) => {
      console.log('OneSignal: notification clicked:', event);
    };
    
    OneSignal.Notifications.addEventListener('click', handleNotificationClick);

    return () => {
      OneSignal.Notifications.removeEventListener('click', handleNotificationClick);
    };
  }, []); 

  return <AppNavigator />;
};

export default App;
