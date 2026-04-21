import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';


/**
 * WebDAV 代理 API
 * 解决浏览器直接访问 WebDAV 服务器的 CORS 问题
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, url, username, password, body: requestBody, headers: customHeaders } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: '缺少 URL 参数' },
        { status: 400 }
      );
    }

    // 构建请求头
    const headers: Record<string, string> = {
      ...customHeaders,
    };

    // 添加基本认证
    if (username && password) {
      const credentials = `${username}:${password}`;
      const auth = btoa(credentials);
      headers['Authorization'] = `Basic ${auth}`;
      console.log('[WebDAV Proxy] Auth header:', headers['Authorization']);
      console.log('[WebDAV Proxy] Credentials length:', credentials.length);
    }

    // 根据方法添加适当的 Content-Type 和请求体
    let finalBody = requestBody;
    if (method === 'PUT' && requestBody) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
    } else if (method === 'PROPFIND') {
      headers['Content-Type'] = 'text/xml; charset=utf-8';
      // PROPFIND 需要 XML 请求体
      finalBody = requestBody || '<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><resourcetype/><getlastmodified/><getcontentlength/></prop></propfind>';
    }

    console.log(`[WebDAV Proxy] ${method} ${url}`);
    console.log('[WebDAV Proxy] Headers:', JSON.stringify(headers, null, 2));

    // 发送请求到 WebDAV 服务器
    const response = await fetch(url, {
      method: method || 'GET',
      headers,
      body: finalBody,
    });

    // 读取响应内容
    const responseBody = await response.text();

    // 返回给客户端
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      headers: Object.fromEntries(response.headers.entries()),
    });
  } catch (error) {
    console.error('WebDAV proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '代理请求失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 支持 OPTIONS 请求（预检）
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
