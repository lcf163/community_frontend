import axios from 'axios';
import { axiosConfig } from './config';
import { requestInterceptor, responseInterceptor } from './interceptors';

// 创建 axios 实例
const instance = axios.create(axiosConfig);

// 添加请求拦截器
instance.interceptors.request.use(
    requestInterceptor,
    error => Promise.reject(error)
);

// 添加响应拦截器
instance.interceptors.response.use(
    responseInterceptor.success,
    responseInterceptor.error
);

export default instance; 