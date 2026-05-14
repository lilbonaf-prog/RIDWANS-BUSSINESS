import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Route, Routes } from 'react-router-dom';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const url = "https://api.ridwanbusiness";

  return (
    <div>
      <ToastContainer/>
      <Navbar/>
      <hr />
      <div className="app-content">
        <Sidebar/>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/add" element={<ProtectedRoute><Add url={url}/></ProtectedRoute>} />
          <Route path="/list" element={<ProtectedRoute><List url={url}/></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders url={url}/></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
