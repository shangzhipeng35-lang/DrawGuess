import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: '没有提供图像数据' }, { status: 400 });
    }

    // 默认使用 NVIDIA API，也支持 SiliconFlow 作为备选
    const apiKey = process.env.NVIDIA_API_KEY || process.env.SILICONFLOW_API_KEY;
    const apiBase = process.env.NVIDIA_API_BASE || 'https://integrate.api.nvidia.com/v1';
    const model = process.env.DRAWING_MODEL || 'meta/llama-3.2-11b-vision-instruct';

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key 未配置' }, { status: 500 });
    }

    // 统一 base64 处理
    const base64Image = image.includes(',') ? image.split(',')[1] : image;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请看这幅手绘图像，猜测画的是什么物品或概念。请用一个简洁的中文词汇或短语回答，比如"苹果"、"房子"、"太阳"等。如果不确定，请给出最可能的答案。只返回猜测，不要解释。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 50,
        temperature: 0.3
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI API 错误:', response.status, errorData);
      return NextResponse.json(
        { error: `AI API 错误 (${response.status}): ${errorData.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const guess = data.choices?.[0]?.message?.content?.trim() || '无法识别';

    return NextResponse.json({ guess });

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'AI响应超时，请稍后重试' }, { status: 504 });
    }
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
