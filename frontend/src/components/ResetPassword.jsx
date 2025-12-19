import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthService from '../services/auth.service';
import chowImage from '../assets/chowcow.png';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [successful, setSuccessful] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        if (!token) {
            setMessage('無效或缺少 Token。');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('兩次輸入的密碼不一致。');
            setLoading(false);
            return;
        }

        AuthService.resetPassword(token, newPassword).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setLoading(false);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
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
                        <h1 className="text-3xl font-bold text-stone-800 mb-3">重設密碼</h1>
                        <p className="text-stone-500 text-lg">請輸入您的新密碼。</p>
                    </div>

                    {!token ? (
                        <div className="text-red-500 text-center font-bold text-lg">
                            缺少重設 Token。請使用 Email 中的連結。
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="newPassword" className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1">新密碼 <span className="text-orange-500">*</span></label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    required
                                    placeholder="輸入新密碼"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-bold text-stone-600 uppercase tracking-wide ml-1">確認新密碼 <span className="text-orange-500">*</span></label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    required
                                    placeholder="再次輸入新密碼"
                                />
                            </div>

                            <button
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl py-3.5 text-lg shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                        重設中...
                                    </span>
                                ) : '變更密碼'}
                            </button>
                        </form>
                    )}

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

export default ResetPassword;
