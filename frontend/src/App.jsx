import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Activate from './components/Activate';
import Login from './components/Login';

function App() {
  return (
    <Router>
        <ToastContainer /> {/* ده عشان إشعارات الـ success والـ error */}
        <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/activate/:uid/:token" element={<Activate />} />
            <Route path="/login" element={<Login />} />{/* في المستقبل هنضيف باقي الصفحات هنا */}
        </Routes>
    </Router>
  );
}

export default App;
