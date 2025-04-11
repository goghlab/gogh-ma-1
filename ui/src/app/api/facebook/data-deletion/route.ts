import { NextResponse } from 'next/server';
import crypto from 'crypto';

function parseSignedRequest(signedRequest: string, appSecret: string) {
  const [encodedSig, payload] = signedRequest.split('.');

  // Decode the signature and data
  const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));

  // Verify the signature
  const expectedSig = crypto.createHmac('sha256', appSecret).update(payload).digest();

  if (sig.length !== expectedSig.length || !crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error('Invalid signature');
  }

  return data;
}

// 实际执行数据删除的函数
async function deleteUserData(userId: string): Promise<void> {
  try {
    // TODO: 实现实际的数据删除逻辑
    // 1. 删除用户的 Facebook 页面连接
    // await db.facebookConnections.deleteMany({ userId });
    
    // 2. 删除访问令牌
    // await db.accessTokens.deleteMany({ userId });
    
    // 3. 删除营销活动数据
    // await db.campaigns.deleteMany({ userId });
    
    // 4. 删除分析数据
    // await db.analytics.deleteMany({ userId });
    
    console.log(`Started deletion process for user ${userId}`);
  } catch (error) {
    console.error(`Error deleting data for user ${userId}:`, error);
    throw error;
  }
}

// GET endpoint for Facebook verification
export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // 确保返回格式完全符合 Facebook 要求
  const response = {
    url: `${baseUrl}/data-deletion/status`,
    confirmation_code: "MA1_CONFIRMATION"
  };

  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

// POST endpoint for handling deletion requests
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { signed_request } = data;

    if (!signed_request) {
      return new Response(JSON.stringify({ error: 'Missing signed_request parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    try {
      const appSecret = process.env.FACEBOOK_APP_SECRET;
      if (!appSecret) {
        throw new Error('Facebook app secret is not configured');
      }

      const parsedRequest = parseSignedRequest(signed_request, appSecret);
      const userId = parsedRequest.user_id;
      
      // 生成唯一的确认码
      const confirmationCode = `MA1_${Date.now()}_${userId}`;
      
      // 启动数据删除流程
      await deleteUserData(userId);

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      // 返回符合 Facebook 要求的格式
      const response = {
        url: `${baseUrl}/data-deletion/status?code=${confirmationCode}`,
        confirmation_code: confirmationCode
      };

      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    } catch (error) {
      console.error('Error processing signed request:', error);
      return new Response(JSON.stringify({ error: 'Invalid signed request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
} 