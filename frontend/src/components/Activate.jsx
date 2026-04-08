import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';


const Activate = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const activateAccount = async () => {
            try {
                await api.post('/auth/users/activation/', { uid, token });
                toast.success('تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول');
                navigate('/login');
            } catch (err) {
                toast.error('رابط التفعيل غير صالح أو انتهت صلاحيته');
            }
        };
        activateAccount();
    }, [uid, token]);

    return <div>جاري تفعيل حسابك...</div>;
};

export default Activate;
