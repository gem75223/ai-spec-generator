import api from './api';

const getProfile = () => {
    return api.get('/members/me');
};

const updateProfile = (data) => {
    return api.put('/members/me', data);
};

const changePassword = (oldPassword, newPassword) => {
    return api.post('/members/change-password', {
        oldPassword,
        newPassword
    });
};

const MemberService = {
    getProfile,
    updateProfile,
    changePassword,
};

export default MemberService;
