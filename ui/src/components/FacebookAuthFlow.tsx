import React, { useState } from 'react';
import { FacebookAuth } from './FacebookAuth';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface FacebookPage {
  access_token: string;
  category: string;
  name: string;
  id: string;
  tasks: string[];
}

interface FacebookAuthFlowProps {
  onComplete: (selectedPages: FacebookPage[]) => void;
  onCancel: () => void;
}

export function FacebookAuthFlow({ onComplete, onCancel }: FacebookAuthFlowProps) {
  const [step, setStep] = useState<'initial' | 'connecting' | 'selectPage'>('initial');
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handlePageToggle = (pageId: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedPages(newSelected);
  };

  const handleLogin = (response: { pages: FacebookPage[] }) => {
    setPages(response.pages);
    setStep('selectPage');
    setError(null);
  };

  const handleError = (error: Error) => {
    setError(error.message);
    setStep('initial');
  };

  const handleComplete = () => {
    const selectedPagesList = pages.filter(page => selectedPages.has(page.id));
    onComplete(selectedPagesList);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[500px] p-6 bg-white rounded-lg shadow-xl">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {step === 'initial' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">连接 Facebook 账号</h2>
            <p className="text-gray-600 mb-6">
              授权 MA-1 访问您的 Facebook 页面，以便帮助您管理和发布内容
            </p>
            <FacebookAuth
              onLogin={handleLogin}
              onError={handleError}
            />
            <Button
              variant="outline"
              className="mt-4"
              onClick={onCancel}
            >
              取消
            </Button>
          </div>
        )}

        {step === 'selectPage' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">选择要管理的页面</h2>
            <p className="text-gray-600 mb-4">
              请选择您想要通过 MA-1 管理的 Facebook 页面
            </p>
            <div className="max-h-[300px] overflow-y-auto">
              {pages.map(page => (
                <div
                  key={page.id}
                  className={`p-4 mb-2 border rounded cursor-pointer transition-colors ${
                    selectedPages.has(page.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handlePageToggle(page.id)}
                >
                  <h3 className="font-semibold">{page.name}</h3>
                  <p className="text-sm text-gray-500">{page.category}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={onCancel}
              >
                取消
              </Button>
              <Button
                onClick={handleComplete}
                disabled={selectedPages.size === 0}
              >
                完成
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 