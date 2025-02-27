import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from '../screen/signup';
import Login from '../screen/login';
import UserHome from '../screen/user/home';
import AdminHome from '../screen/admin/home';
import WorkerHome from '../screen/worker/home';
import ForgotPassword from '../screen/forgotPassword';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='SignUp'>
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
