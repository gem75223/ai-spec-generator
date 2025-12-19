import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/auth.service';
import chowImage from '../assets/chowcow.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [successful, setSuccessful] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        if (!email) {
            setMessage('請輸入您的電子郵件');
            setLoading(false);
            return;
        }

        AuthService.forgotPassword(email).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setLoading(false);
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

            {/* Card */}
            <div className="relative z-10 w-full max-w-md p-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 transform transition-all border border-stone-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-stone-800 mb-3">忘記密碼？</h1>
                        <p className="text-stone-500 text-lg">輸入您的 Email 以重設密碼。</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1">電子郵件 <span className="text-orange-500">*</span></label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                required
                                placeholder="name@example.com"
                            />
                        </div>

                        <button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl py-3.5 text-lg shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                    發送重設連結...
                                </span>
                            ) : '發送重設連結'}
                        </button>

                        <div className="text-center pt-4">
                            <p className="text-stone-500">
                                想起密碼了嗎？{' '}
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

export default ForgotPassword;
