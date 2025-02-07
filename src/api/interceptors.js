// 请求拦截器
export const requestInterceptor = (config) => {
    let loginResult = JSON.parse(localStorage.getItem("loginResult"));
    if (loginResult) {
        const token = loginResult.access_token;
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

// 响应拦截器
export const responseInterceptor = {
    success: response => {
        if (response.status === 200) {
            return Promise.resolve(response.data);
        }
        return Promise.reject(response.data);
    },
    error: error => {
        console.error("API错误:", error);
        return Promise.reject(error);
    }
}; 