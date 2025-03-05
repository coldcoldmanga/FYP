import React, { useState } from 'react';
import AppNavigator from './android/app/src/navigation/appNavigator';
import ProfileTab from './android/app/src/component/profileTab';
import { logout } from './android/app/src/service/authServices';
import AdminHome from './android/app/src/screen/admin/home';

const App = () => {
  return (
    <AppNavigator />
  )
};

export default App;