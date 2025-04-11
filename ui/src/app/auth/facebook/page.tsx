'use client';

import { useRouter } from 'next/navigation';
import { FacebookAuth } from '@/components/FacebookAuth';

export default function FacebookAuthPage() {
  const router = useRouter();

  const handleLogin = (response: any) => {
    console.log('Login successful:', response);
    // 存储访问令牌和页面访问令牌
    localStorage.setItem('fbAccessToken', response.authResponse.accessToken);
    if (response.pages && response.pages.length > 0) {
      localStorage.setItem('fbPageAccessToken', response.pages[0].access_token);
      localStorage.setItem('fbPageId', response.pages[0].id);
    }
    // 重定向回主页
    router.push('/');
  };

  const handleError = (error: any) => {
    console.error('Login failed:', error);
    // 这里可以添加错误提示
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1d]">
      <div className="bg-[#1a1a1d] p-8 rounded-lg border border-[#2a2a2e] shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Connect Your Facebook Page</h1>
        <div className="mb-6">
          <p className="text-zinc-400 text-center">
            Connect your Facebook Page to enable automatic post scheduling and management.
          </p>
        </div>
        <FacebookAuth onLogin={handleLogin} onError={handleError} />
      </div>
    </div>
  );
} 