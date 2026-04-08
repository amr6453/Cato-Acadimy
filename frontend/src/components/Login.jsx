import React, { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await api.post('/auth/jwt/create/', { email, password });
        toast.success('تم تسجيل الدخول بنجاح!');
        navigate('/dashboard');
    } catch (err) {
        toast.error('خطأ في البيانات');
    }
};

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>تسجيل الدخول</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="الإيميل" onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="كلمة السر" onChange={e => setPassword(e.target.value)} />
                <button type="submit">دخول</button>
            </form>
        </div>
    );
};

export default Login;
