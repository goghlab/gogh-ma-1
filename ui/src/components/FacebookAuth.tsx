import React, { useEffect, useState } from 'react';
import { Facebook } from 'lucide-react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookLoginResponse {
  authResponse: {
    accessToken: string;
    expiresIn: string;
    reauthorize_required_in: string;
    signedRequest: string;
    userID: string;
  };
  status: string;
}

interface FacebookPage {
  access_token: string;
  category: string;
  name: string;
  id: string;
  tasks: string[];
}

interface FacebookAuthProps {
  onLogin: (response: { authResponse: FacebookLoginResponse['authResponse']; pages: FacebookPage[] }) => void;
  onError: (error: Error) => void;
}

export function FacebookAuth({ onLogin, onError }: FacebookAuthProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    // 加载 Facebook SDK
    const loadFacebookSDK = () => {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      window.fbAsyncInit = () => {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v19.0'
        });
        setIsSDKLoaded(true);
      };
    };

    loadFacebookSDK();
  }, []);

  const handleLogin = async () => {
    if (!isSDKLoaded) return;

    try {
      // 请求登录和权限
      const loginResponse = await new Promise<FacebookLoginResponse>((resolve, reject) => {
        window.FB.login((response: any) => {
          if (response.authResponse) {
            resolve(response);
          } else {
            reject(new Error('User cancelled login or did not fully authorize.'));
          }
        }, {
          scope: 'pages_manage_posts,pages_read_engagement,publish_video'
        });
      });

      // 获取用户管理的页面
      window.FB.api('/me/accounts', (pagesResponse: { data: FacebookPage[] }) => {
        if (pagesResponse && pagesResponse.data) {
          onLogin({
            authResponse: loginResponse.authResponse,
            pages: pagesResponse.data
          });
        } else {
          onError(new Error('Failed to fetch pages'));
        }
      });
    } catch (error) {
      console.error('Facebook login error:', error);
      onError(error as Error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleLogin}
        disabled={!isSDKLoaded}
        className={`flex items-center space-x-2 px-6 py-3 bg-[#1877F2] text-white rounded-lg transition-all duration-200 ${
          !isSDKLoaded ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#166FE5]'
        }`}
      >
        <Facebook className="w-5 h-5" />
        <span>Connect Facebook Page</span>
      </button>
      {!isSDKLoaded && (
        <p className="text-sm text-zinc-400">Loading Facebook SDK...</p>
      )}
    </div>
  );
} 