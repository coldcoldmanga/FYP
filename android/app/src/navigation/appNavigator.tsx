import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import ForgotPassword from '../screen/forgotPassword';
import SignUp from '../screen/signup';
import Login from '../screen/login';
import UserHome from '../screen/user/home';
import AdminHome from '../screen/admin/home';
import WorkerHome from '../screen/worker/home';
import SubmitReport from '../screen/user/submit_report';
import EditProfile from '../screen/editProfile';
import AddBuilding from '../screen/admin/addBuilding';
import AddAdminWorker from '../screen/admin/addAdminWorker';
import AddFacility from '../screen/admin/addFacility';
import BuildingsList from '../screen/admin/buildingsList';
import FacilitiesList from '../screen/admin/facilitiesList';
import AdminWorkerList from '../screen/admin/adminWorkerList';
import Feedback from '../screen/feedback';
import AddFeedback from '../screen/user/addFeedback';
import EditFeedback from '../screen/user/editFeedback';
import SummarizeHistory from '../screen/summary_history';
import Help from '../screen/help';
import { isLoggedIn, isSessionExpired } from '../service/authServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {

    const [initialRoute, setInitialRoute] = useState('Login');
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const checkLoginStatus = async () => {
            const loggedIn = await isLoggedIn();

            if(loggedIn){
                const isExpired = await isSessionExpired();
                if(isExpired){
                    await AsyncStorage.removeItem('userEmail');
                    await AsyncStorage.removeItem('isLoggedIn');
                    await AsyncStorage.removeItem('userType');
                    Alert.alert('Session Expired', 'Please login again');
                    setInitialRoute('Login');
                }
                else{
                    const userType = await AsyncStorage.getItem('userType');
                    switch(userType){
                        case 'Student':
                        case 'Staff':
                            setInitialRoute('UserHome');
                            break;
                        case 'Maintenance Worker':
                            setInitialRoute('WorkerHome');
                            break;
                        default:
                            setInitialRoute('AdminHome');
                            break;
                    }
                }

                }
                else{

                    setInitialRoute('Login');
                    
            }
            setLoading(false);
        }
        checkLoginStatus();
    }, []);

    if(loading){
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRoute}>
                <Stack.Screen name='SignUp' component={SignUp} options={{headerShown: false}} />
                <Stack.Screen name='Login' component={Login} options={{headerShown: false}} />
                <Stack.Screen name='UserHome' component={UserHome} options={{headerShown: false}} />
                <Stack.Screen name='AdminHome' component={AdminHome} options={{headerShown: false}} />
                <Stack.Screen name='WorkerHome' component={WorkerHome} options={{headerShown: false}} />
                <Stack.Screen name='ForgotPassword' component={ForgotPassword} options={{headerShown: false}} />
                <Stack.Screen name='SubmitReport' component={SubmitReport} options={{headerShown: false}} />
                <Stack.Screen name='EditProfile' component={EditProfile} options={{headerShown: false}} />
                <Stack.Screen name='AddBuilding' component={AddBuilding} options={{headerShown: false}} />
                <Stack.Screen name='AddAdminWorker' component={AddAdminWorker} options={{headerShown: false}} />
                <Stack.Screen name='AddFacility' component={AddFacility} options={{headerShown: false}} />
                <Stack.Screen name='BuildingsList' component={BuildingsList} options={{headerShown: false}} />
                <Stack.Screen name='FacilitiesList' component={FacilitiesList} options={{headerShown: false}} />
                <Stack.Screen name='EquipmentsList' component={AdminWorkerList} options={{headerShown: false}} />
                <Stack.Screen name='Feedback' component={Feedback} options={{headerShown: false}} />
                <Stack.Screen name='AddFeedback' component={AddFeedback} options={{headerShown: false}} />
                <Stack.Screen name='EditFeedback' component={EditFeedback} options={{headerShown: false}} />
                <Stack.Screen name='Summary History' component={SummarizeHistory} />
                <Stack.Screen name='Help' component={Help} options={{headerShown: false}} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigator;
