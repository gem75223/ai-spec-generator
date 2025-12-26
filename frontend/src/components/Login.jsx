import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';
import chowImage from '../assets/chowcow.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        AuthService.login(username, password).then(
            () => {
                navigate('/dashboard');
                window.location.reload();
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setLoading(false);
                setMessage(resMessage);
            }
        );
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-end font-sans">
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

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-6 mr-12">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 transform transition-all border border-stone-100">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-stone-800 mb-3">歡迎回來</h1>
                        <p className="text-stone-500 text-lg">很高興再次見到您！</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="username"
                                className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1"
                            >
                                使用者名稱
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="請輸入帳號"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1"
                            >
                                密碼
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="請輸入密碼"
                            />
                            <div className="text-right pt-1">
                                <Link to="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                    忘記密碼？
                                </Link>
                            </div>
                        </div>

                        <button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl py-3.5 text-lg shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    登入中...
                                </span>
                            ) : '登入'}
                        </button>

                        <div className="text-center pt-4">
                            <p className="text-stone-500">
                                還沒有帳號嗎？{' '}
                                <Link to="/register" className="text-orange-600 hover:text-orange-700 font-bold ml-1">
                                    立即註冊
                                </Link>
                            </p>
                        </div>
                    </form>

                    {message && (
                        <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium text-center border border-red-100">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
