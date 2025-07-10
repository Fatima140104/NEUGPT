import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "@/lib/auth";
import { useChatSession } from "@/providers/ChatSessionContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AuthSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchSessions } = useChatSession();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        
        if (!token) {
          setStatus('error');
          setErrorMessage('Không tìm thấy token đăng nhập');
          return;
        }

        setToken(token);
        
        await fetchSessions();
        
        setStatus('success');
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
        
      } catch (error) {
        console.error("Auth error:", error);
        setStatus('error');
        setErrorMessage('Có lỗi xảy ra trong quá trình đăng nhập');
      }
    };

    processAuth();
  }, [location, navigate, fetchSessions]);

  if (status === 'processing') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner loadingTitle="Đang xử lý đăng nhập..." />
          <p className="mt-4 text-muted-foreground">
            Vui lòng chờ trong giây lát...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Đăng nhập thành công!
          </h2>
          <p className="text-muted-foreground">
            Đang chuyển hướng về trang chính...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Đăng nhập thất bại
          </h2>
          <p className="text-muted-foreground mb-4">
            {errorMessage}
          </p>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Quay lại trang chính
          </button>
        </div>
      </div>
    );
  }

  return null;
} 