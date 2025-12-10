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
            setMessage('Invalid or missing token.');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
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

            {/* Card */}
            <div className="relative z-10 w-full max-w-[784px] p-4 flex items-center justify-end">
                <div className="bg-[#313338] rounded-[5px] shadow-lg p-8 w-full max-w-[480px] text-[#dbdee1] transform transition-all duration-200">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-[#b5bac1] text-[16px]">Enter a new password.</p>
                    </div>

                    {!token ? (
                        <div className="text-[#fa777c] text-center font-bold">
                            Missing Reset Token. Please use the link from your email.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="newPassword" className="block text-[12px] font-bold text-[#b5bac1] uppercase tracking-wider">New Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-[#1e1f22] border-none rounded-[3px] p-2.5 text-white h-[40px] focus:outline-none focus:ring-0 transition-all font-normal"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-[12px] font-bold text-[#b5bac1] uppercase tracking-wider">Confirm Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-[#1e1f22] border-none rounded-[3px] p-2.5 text-white h-[40px] focus:outline-none focus:ring-0 transition-all font-normal"
                                    required
                                />
                            </div>

                            <button
                                className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium rounded-[3px] h-[44px] transition-colors duration-200 mt-6 text-[16px]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    </div>
                                ) : 'Change Password'}
                            </button>
                        </form>
                    )}

                    {message && (
                        <div className={`mt-4 text-xs font-semibold uppercase text-center ${successful ? 'text-green-400' : 'text-[#fa777c]'}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
