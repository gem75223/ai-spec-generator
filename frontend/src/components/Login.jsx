import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="relative min-h-screen w-full flex items-center justify-end font-sans select-none px-20">
            {/* Full Screen Background Image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${chowImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-[784px] p-4 flex items-center justify-center">
                <div className="bg-[#313338] rounded-[5px] shadow-lg p-8 w-full max-w-[480px] text-[#dbdee1] transform transition-all duration-200">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
                        <p className="text-[#b5bac1] text-[16px]">We're so excited to see you again!</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="username"
                                className="block text-[12px] font-bold text-[#b5bac1] uppercase tracking-wider"
                            >
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="w-full bg-[#1e1f22] border-none rounded-[3px] p-2.5 text-white h-[40px] focus:outline-none focus:ring-0 transition-all font-normal"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-[12px] font-bold text-[#b5bac1] uppercase tracking-wider"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full bg-[#1e1f22] border-none rounded-[3px] p-2.5 text-white h-[40px] focus:outline-none focus:ring-0 transition-all font-normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="text-[14px]">
                                <a href="/forgot-password" className="text-[#00a8fc] hover:underline">Forgot your password?</a>
                            </div>
                        </div>

                        <button
                            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium rounded-[3px] h-[44px] transition-colors duration-200 mt-4 text-[16px]"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                            ) : 'Log In'}
                        </button>

                        <div className="text-[14px] text-[#949ba4] mt-4">
                            Need an account?{' '}
                            <a href="/register" className="text-[#00a8fc] hover:underline">Register</a>
                        </div>
                    </form>

                    {message && (
                        <div className="mt-4 text-[#fa777c] text-xs font-semibold uppercase text-center">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
