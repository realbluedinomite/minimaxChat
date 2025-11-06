import { NextResponse } from 'next/server';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const apiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY;
    const groupId = process.env.NEXT_PUBLIC_MINIMAX_GROUP_ID;

    if (!apiKey || !groupId) {
      throw new Error('Missing MiniMax API key or group ID');
    }

    const response = await fetch('https://api.minimax.chat/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'abab5.5-chat',
        messages: messages.map((msg: Message) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
        top_p: 1,
        max_tokens: 1024,
        group_id: groupId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('MiniMax API error:', error);
      throw new Error(`MiniMax API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
