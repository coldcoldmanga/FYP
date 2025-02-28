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
import { isLoggedIn } from '../services/authServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {

    const [initialRoute, setInitialRoute] = useState('Login');
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const checkLoginStatus = async () => {
            const loggedIn = await isLoggedIn();
            if(loggedIn){
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
                <Stack.Screen name='SignUp' component={SignUp} />
                <Stack.Screen name='Login' component={Login} />
                <Stack.Screen name='UserHome' component={UserHome} />
                <Stack.Screen name='AdminHome' component={AdminHome} />
                <Stack.Screen name='WorkerHome' component={WorkerHome} />
                <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigator;
