// API 基础配置
export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
export const AVATAR_BASE_URL = `${API_BASE_URL}/static/img/avatar/`;

// axios 实例基础配置
export const axiosConfig = {
    baseURL: '/api/v1',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
}; 