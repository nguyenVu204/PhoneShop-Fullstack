import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

export default function AdminRoute() {
  const { user, token } = useAuthStore();

  // 1. Nếu chưa đăng nhập -> Đá về Login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu đăng nhập rồi nhưng không phải Admin -> Đá về trang chủ
  if (user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  // 3. Nếu đúng là Admin -> Cho phép hiển thị nội dung bên trong (Outlet)
  return <Outlet />;
}