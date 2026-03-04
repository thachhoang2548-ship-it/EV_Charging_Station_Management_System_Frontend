import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice.js';
import { toast } from 'react-toastify';

/**
 * Component này bắt OAuth callback token từ URL query params
 * và xử lý đăng nhập bất kể đang ở route nào
 */
const OAuthHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Chỉ chạy khi có query params trong URL
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const needPhone = urlParams.get('needPhone');
    
    if (token) {
      console.log('🔐 [OAuthHandler] Detected OAuth token in URL');
      console.log('🔑 Token:', token.substring(0, 30) + '...');
      console.log('📱 Need phone:', needPhone);
      
      try {
        // Decode JWT để lấy thông tin user
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📦 Token payload:', payload);
        
        // Lấy role từ token
        let role = null;
        if (payload.role) {
          role = payload.role;
        } else if (payload.scope) {
          role = payload.scope;
        } else if (payload.authorities && payload.authorities.length > 0) {
          role = payload.authorities[0].authority || payload.authorities[0];
        } else {
          console.warn('⚠️ No role found in token, defaulting to DRIVER');
          role = 'DRIVER';
        }
        
        // Remove ROLE_ prefix nếu có
        if (role && typeof role === 'string') {
          role = role.replace('ROLE_', '');
        }
        
        console.log('👤 User role:', role);
        
        // Lưu token và role vào localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('role', role);
        
        // Lấy thông tin user từ token
        const userDetails = {
          name: payload.fullName || payload.name || payload.sub || 'User',
          email: payload.email || payload.sub,
          phone: null,
          gender: null
        };
        
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        
        // Dispatch Redux action để update store
        dispatch(loginSuccess({
          accessToken: token,
          role: role,
          userDetails: userDetails
        }));
        
        console.log('✅ Redux state updated via OAuthHandler');
        console.log('🔍 Saved to localStorage:', { role, accessToken: token.substring(0, 20) });
        
        // Show success message
        toast.success('Đăng nhập Google thành công!', {
          position: 'top-center',
          autoClose: 2000
        });
        
        // Xóa token khỏi URL
        window.history.replaceState({}, document.title, location.pathname);
        
        // Navigate dựa vào role
        
          console.log('🚀 Navigating to role-based page:', role);
          
          if (role?.toUpperCase().includes('ADMIN')) {
            window.location.href = '/admin';
          } else if (role?.toUpperCase().includes('STAFF')) {
            window.location.href = '/staff';
          } else {
            window.location.href = '/driver';
          }
        
      } catch (error) {
        console.error('❌ Error parsing OAuth token:', error);
        toast.error('Lỗi xử lý token đăng nhập từ Google');
        
        // Xóa token lỗi khỏi URL và redirect về login
        window.history.replaceState({}, document.title, '/login');
        navigate('/login');
      }
    }
  }, [location.search, navigate, dispatch, location.pathname]);

  // Render children bình thường
  return children;
};

export default OAuthHandler;
