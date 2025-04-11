'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function DeletionStatus() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Data Deletion Status</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        {id ? (
          <>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-lg font-semibold">Deletion Request ID</p>
              <p className="text-gray-600 font-mono">{id}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Deletion Status</h2>
              <p className="text-green-600">✓ Deletion request received</p>
              <p className="text-gray-600">• Deletion process initiated</p>
              <p className="text-gray-600">• Data will be completely removed within 14 days</p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl text-gray-600">Please provide a valid deletion request ID</p>
          </div>
        )}
        
        <div className="bg-gray-50 p-4 rounded-md mt-6">
          <h2 className="text-xl font-semibold mb-3">Data Being Deleted</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Facebook page connections</li>
            <li>Access tokens</li>
            <li>Campaign data</li>
            <li>Analytics and engagement data</li>
          </ul>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            For questions about your deletion request, contact us at:
            <a href="mailto:privacy@ma1.com" className="text-blue-500 hover:underline ml-1">
              privacy@ma1.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 