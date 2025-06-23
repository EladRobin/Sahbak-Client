import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import From from '../components/form/From';
import FormHook from '../components/reactHookForm/formHook';
import Layout from '../layout/layout';
import Register from '../components/Register';
import { Login } from '../components/Login';


const AppRoutes = () => {
    
  return (
    <Router>
        <Routes>
            <Route path='/' element={<Layout/>}>
                <Route index element={<FormHook/>}/>
                <Route path='/myform' element={<From/>}/>
                <Route path='/register' element={<Register/>} />
                <Route path='/login' element={<Login/>} />


            </Route>
        </Routes>
    </Router>
  )
}

export default AppRoutes