import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';
import chowImage from '../assets/chowcow.png';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        gender: '',
        birthday: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [successful, setSuccessful] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setMessage('');
        setSuccessful(false);
        setLoading(true);

        // Simple validation
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            setMessage('請填寫所有必填欄位。');
            setLoading(false);
            return;
        }

        AuthService.register(
            formData.name,
            formData.email,
            formData.phone,
            formData.password,
            formData.gender,
            formData.birthday
        ).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setLoading(false);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setMessage(resMessage);
                setSuccessful(false);
                setLoading(false);
            }
        );
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center font-sans">
            {/* Background with warm overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${chowImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[2px]"></div>
            </div>

            {/* Register Card */}
            <div className="relative z-10 w-full max-w-2xl p-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 transform transition-all border border-stone-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-stone-800 mb-3">建立帳號</h1>
                        <p className="text-stone-500 text-lg">立即加入我們！</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1">姓名 <span className="text-orange-500">*</span></label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    required
                                    placeholder="您的姓名"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phone" className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1">電話 <span className="text-orange-500">*</span></label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    required
                                    placeholder="您的電話"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1">電子郵件 <span className="text-orange-500">*</span></label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                required
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1">密碼 <span className="text-orange-500">*</span></label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                required
                                placeholder="設定密碼"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label htmlFor="gender" className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1">性別</label>
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
                                >
                                    <option value="">請選擇</option>
                                    <option value="M">男</option>
                                    <option value="F">女</option>
                                    <option value="O">其他</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="birthday" className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1">生日</label>
                                <input
                                    type="date"
                                    id="birthday"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                        </div>

                        <button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl py-3.5 text-lg shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-0.5 mt-4"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                    註冊中...
                                </span>
                            ) : '註冊帳號'}
                        </button>

                        <div className="text-center pt-4">
                            <p className="text-stone-500">
                                已經有帳號了嗎？{' '}
                                <Link to="/login" className="text-orange-600 hover:text-orange-700 font-bold ml-1">
                                    登入
                                </Link>
                            </p>
                        </div>
                    </form>

                    {message && (
                        <div className={`mt-6 p-4 rounded-xl text-center font-medium border ${successful ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;
