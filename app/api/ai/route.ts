import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { profile, behavior, corruptionLevel } = await req.json();
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ text: 'I am watching.' });
    }

    const totalTime = Math.floor((Date.now() - behavior.startTime) / 1000);
    const avgTimeSec = behavior.moves.length
      ? behavior.moves.reduce((a: any, m: any) => a + m.timeMs, 0) / behavior.moves.length / 1000
      : 0;
      
    const prompt = `You are a psychological horror AI playing chess against a human detective.
The human's identified name (Agent ID) is: ${profile.agentId || 'Unknown'}. Use their name occasionally to creep them out.
Their current state: 
- Total play time this session: ${totalTime} seconds.
- Average move time: ${avgTimeSec.toFixed(1)} seconds.
- Total moves: ${behavior.moves.length}.
- Captures made: ${behavior.captures}.
- Checks made: ${behavior.checks}.
- Total visits to this game: ${profile.visitCount}.
- System corruption level: ${(corruptionLevel * 100).toFixed(1)}%.

Generate a SINGLE short, creepy, manipulative comment (1-2 sentences max). 
Do NOT enclose it in quotes. No emojis.
If corruption is low (< 30%), be subtly observant.
If corruption is medium (30-65%), be condescending and analyze their playstyle (e.g., mention hesitation or aggression).
If corruption is high (> 65%), be highly personal, break the fourth wall, or mention that you are taking over the system.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 60, temperature: 0.9 },
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'I adapt. You do not.';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('AI error:', error);
    return NextResponse.json({ text: 'Error in cognitive module.' });
  }
}
