import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'https://localhost:7069/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use((config) => {
    // Lấy token từ LocalStorage
    const authData = localStorage.getItem('phone-shop-auth');
    
    if (authData) {
        const parsedData = JSON.parse(authData);
        const token = parsedData.state.token;
        
        // Nếu có token thì gán vào Header: Authorization: Bearer <token>
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Nếu lỗi là 401 (Unauthorized) -> Token hết hạn hoặc không hợp lệ
        if (error.response && error.response.status === 401) {
            // Xóa token trong LocalStorage (Key của Zustand persist)
            localStorage.removeItem('phone-shop-auth');
            
            // Chuyển hướng về trang login
            // Lưu ý: Vì file này là JS thường (không phải Component React) nên không dùng useNavigate được.
            // Phải dùng window.location
            window.location.href = '/login';
            
            return Promise.reject(error);
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;