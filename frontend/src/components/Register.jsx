import React, { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        re_password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // بنبعت البيانات لرابط djoser بتاع الـ Backend
            await api.post('/auth/users/', formData);
            toast.success('تم التسجيل بنجاح! يرجى مراجعة إيميلك لتفعيل الحساب');
        } catch (err) {
            toast.error('حدث خطأ أثناء التسجيل، تأكد من البيانات');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>إنشاء حساب جديد</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="اسم المستخدم" onChange={e => setFormData({...formData, username: e.target.value})} />
                <input type="email" placeholder="الإيميل" onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="password" placeholder="كلمة السر" onChange={e => setFormData({...formData, password: e.target.value})} />
                <input type="password" placeholder="تأكيد كلمة السر" onChange={e => setFormData({...formData, re_password: e.target.value})} />
                <button type="submit">تسجيل</button>
            </form>
        </div>
    );
};

export default Register;
