import { useState } from 'react';
import AdminSidebar from '../AdminComponents/AdminSidebar';
import './AdminHomeScreen.css';
import AdminCardsCharts from '../AdminComponents/AdminCardsCharts';
import Header from '../components/Header';
const AdminHomeScreen = () => {
    return (  
        <>
        <Header/>
        <div className='d-flex'>
            
        <AdminSidebar />
            <AdminCardsCharts />
        </div>
        </>
    );
};

export default AdminHomeScreen;