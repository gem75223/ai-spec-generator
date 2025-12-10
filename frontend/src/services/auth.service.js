import api from './api';

const register = (name, email, phone, password, gender, birthday) => {
    return api.post('/auth/signup', {
        name,
        email,
        phone,
        password,
        gender,
        birthday
    });
};

const login = (username, password) => {
    return api.post('/auth/signin', {
        username,
        password,
    })
        .then((response) => {
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const forgotPassword = (email) => {
    return api.post('/auth/forgot-password', {
        email
    });
};

const resetPassword = (token, newPassword) => {
    return api.post('/auth/reset-password', {
        token,
        newPassword
    });
};

const AuthService = {
    register,
    login,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword,
};

export default AuthService;
