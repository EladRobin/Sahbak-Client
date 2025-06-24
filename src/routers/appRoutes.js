import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import From from '../components/form/From';
import FormHook from '../components/reactHookForm/formHook';
import Layout from '../layout/layout';
import Register from '../components/Register';
import { Login } from '../components/Login';
import ResetPassword from '../components/ResetPassword';
import SetNewPassword from '../components/SetNewPassword';

import Profile from '../components/Profile';



const AppRoutes = () => {
    
  return (
    <Router>
        <Routes>
            <Route path='/' element={<Layout/>}>
                <Route index element={<FormHook/>}/>
                <Route path='/myform' element={<From/>}/>
                <Route path='/register' element={<Register/>} />
                <Route path='/login' element={<Login/>} />
                <Route path='/reset-password' element={<ResetPassword/>} />
                <Route path='/set-new-password/:token' element={<SetNewPassword />} />
                <Route path='/profile' element={<Profile />} />

            </Route>
        </Routes>
    </Router>
  )
}

export default AppRoutes