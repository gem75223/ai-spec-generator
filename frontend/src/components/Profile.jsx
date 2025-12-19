import React, { useState, useEffect } from 'react';
import MemberService from '../services/member.service';
import { User, Lock, Save } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        birthday: ''
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('info'); // info, password

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = () => {
        MemberService.getProfile().then(
            (response) => {
                // Ensure response.data is not null
                if (response.data) {
                    setProfile(response.data);
                }
            },
            (error) => {
                console.error("Error loading profile", error);
                setMessage({ type: 'error', text: '無法載入個人資料，請稍後再試。' });
            }
        );
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        MemberService.updateProfile(profile).then(
            (response) => {
                setMessage({ type: 'success', text: response.data.message || '更新成功' });
                setLoading(false);
            },
            (error) => {
                const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                setMessage({ type: 'error', text: resMessage });
                setLoading(false);
            }
        );
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: '新密碼與確認密碼不符' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        MemberService.changePassword(passwordData.oldPassword, passwordData.newPassword).then(
            (response) => {
                setMessage({ type: 'success', text: response.data.message || '密碼修改成功' });
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setLoading(false);
            },
            (error) => {
                const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                setMessage({ type: 'error', text: resMessage });
                setLoading(false);
            }
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold mb-8 text-stone-800 tracking-tight">個人資料管理</h2>

            {message.text && (
                <div className={`p-4 mb-6 rounded-xl border flex items-center shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-lg border border-stone-100 overflow-hidden">
                <div className="flex border-b border-stone-200 bg-stone-50/50">
                    <button
                        className={`flex-1 py-5 text-center font-bold text-lg transition-all ${activeTab === 'info' ? 'bg-white text-orange-600 shadow-sm border-t-4 border-t-orange-500' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}
                        onClick={() => setActiveTab('info')}
                    >
                        <User size={20} className="inline mr-2 mb-1" /> 基本資料
                    </button>
                    <button
                        className={`flex-1 py-5 text-center font-bold text-lg transition-all ${activeTab === 'password' ? 'bg-white text-orange-600 shadow-sm border-t-4 border-t-orange-500' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}
                        onClick={() => setActiveTab('password')}
                    >
                        <Lock size={20} className="inline mr-2 mb-1" /> 修改密碼
                    </button>
                </div>

                <div className="p-8 md:p-10">
                    {activeTab === 'info' && (
                        <form onSubmit={handleProfileUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div>
                                    <label className="block text-sm font-bold text-stone-500 uppercase tracking-wide mb-2 ml-1">Email <span className="text-xs font-normal text-stone-400">(無法修改)</span></label>
                                    <input
                                        type="email"
                                        value={profile.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-100 text-stone-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-500 uppercase tracking-wide mb-2 ml-1">姓名</label>
                                    <input
                                        type="text"
                                        value={profile.name || ''}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-stone-50 focus:bg-white transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-500 uppercase tracking-wide mb-2 ml-1">電話</label>
                                    <input
                                        type="text"
                                        value={profile.phone || ''}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-stone-50 focus:bg-white transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-500 uppercase tracking-wide mb-2 ml-1">性別</label>
                                    <select
                                        value={profile.gender || ''}
                                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-stone-50 focus:bg-white transition-all appearance-none"
                                    >
                                        <option value="">請選擇</option>
                                        <option value="Male">男</option>
                                        <option value="Female">女</option>
                                        <option value="Other">其他</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-500 uppercase tracking-wide mb-2 ml-1">生日</label>
                                    <input
                                        type="date"
                                        value={profile.birthday || ''}
                                        onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-stone-50 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto md:px-12 bg-orange-500 text-white py-3.5 rounded-xl font-bold text-lg shadow-md hover:bg-orange-600 hover:shadow-orange-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center mx-auto"
                            >
                                <Save size={20} className="mr-2" /> 儲存變更
                            </button>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordChange} className="max-w-lg mx-auto">
                            <div className="space-y-6 mb-10">
                                <div>
                                    <label className="block text-sm font-bold text-stone-500 uppercase tracking-wide mb-2 ml-1">舊密碼</label>
                                    <input
                                        type="password"
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-stone-50 focus:bg-white transition-all"
                                        placeholder="輸入目前的密碼"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-500 uppercase tracking-wide mb-2 ml-1">新密碼</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-stone-50 focus:bg-white transition-all"
                                        placeholder="設定新密碼"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-500 uppercase tracking-wide mb-2 ml-1">確認新密碼</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-stone-50 focus:bg-white transition-all"
                                        placeholder="再次輸入新密碼"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-md hover:bg-green-700 hover:shadow-green-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
                            >
                                <Save size={20} className="mr-2" /> 更新密碼
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
