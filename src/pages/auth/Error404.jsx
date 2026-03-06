import { useState, useEffect } from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import paths from '../../path/paths.jsx';
import { selectRole } from '../../redux/slices/authSlice.js';
import classed from '../../assets/css/Main.module.css';

export default function Error404() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const role = useSelector(selectRole); 

  const handleNav = () => {
    if (role === 'ADMIN') {
      console.log("Navigating to admin dashboard");
      navigate(paths.adminDashboard);
    } else if (role === 'STAFF') {
      navigate(paths.staffDashboard);
    } else {
      navigate(paths.home);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const parallaxX = (mousePosition.x - window.innerWidth / 2) / 50;
  const parallaxY = (mousePosition.y - window.innerHeight / 2) / 50;

  return (
    <div className={classed.modalOverlay}>
      <div className={classed.formContainer}>
      {/* Background animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #166534 100%)',
            top: '10%',
            left: '10%',
            transform: `translate(${parallaxX}px, ${parallaxY}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #166534 100%)',
            bottom: '10%',
            right: '10%',
            transform: `translate(${-parallaxX}px, ${-parallaxY}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full opacity-20"
          style={{
            background: '#16a34a',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.8s ease-out forwards;
        }
      `}</style>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
        {/* Main heading with 3D effect */}
        <div className="mb-8 sm:mb-10 relative animate-scale-in">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight select-none"
            style={{
              color: '#16a34a',
              textShadow: '0 10px 40px rgba(22, 163, 74, 0.35)',
              transform: `perspective(1000px) rotateX(${parallaxY * 0.3}deg) rotateY(${parallaxX * 0.3}deg)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            TRANG HIỆN<br />KHÔNG KHẢ DỤNG
          </h1>
          <div 
            className="absolute inset-0 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight select-none opacity-10 pointer-events-none"
            style={{
              color: '#16a34a',
              filter: 'blur(15px)',
              transform: 'scale(1.05)'
            }}
          >
            TRANG HIỆN<br />KHÔNG KHẢ DỤNG
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 sm:space-y-5 animate-slide-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 px-2 sm:px-4 leading-snug">
            Rất tiếc, chúng tôi không thể tìm thấy<br className="hidden sm:block" /> trang bạn đang tìm kiếm.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed">
            Bạn vui lòng quay lại trang trước hoặc trở về trang chủ để tiếp tục khám phá.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8 sm:mt-10 animate-slide-in px-2 sm:px-4" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <button
            onClick={handleNav}
            className="group px-7 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-white text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2.5"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #166534 100%)',
              boxShadow: '0 10px 30px rgba(22, 163, 74, 0.3)'
            }}
          >
            <Home className="w-6 h-6 transition-transform group-hover:rotate-12" />
            Về trang chủ
          </button>

          <button
            onClick={() => navigate(-1)}
            className="group px-7 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2.5"
            style={{
              color: '#16a34a',
              border: '2px solid #16a34a',
              background: 'white'
            }}
          >
            <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
            Quay lại
          </button>
        </div>

        {/* Decorative line */}
        <div className="mt-10 sm:mt-14 flex items-center justify-center gap-4 animate-slide-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="w-2 h-2 rounded-full" style={{ background: '#16a34a' }}></div>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
      </div>
    </div>
    </div>
    
  );
}