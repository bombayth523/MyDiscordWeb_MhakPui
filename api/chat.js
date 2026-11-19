// ============================================================
// กลุ่มหมักปุ๋ย — Bombie AI Hybrid Fallback API (Vercel Serverless)
// ด่านที่ 2: เรียกใช้ Google Gemini Flash (Free Tier)
// พร้อม Multi-turn Memory + Few-Shot Lorebook + Discord Live Radar
// ============================================================

import { buildBombieSystemPrompt } from './bombie-knowledge.js';

const DISCORD_WIDGET_URL = 'https://discord.com/api/guilds/826744229111267338/widget.json';
const CACHE_TTL_MS = 60 * 1000; // แคชข้อมูล Discord สด 60 วินาที

let discordCache = {
  data: null,
  fetchedAt: 0
};

async function getDiscordLiveStatus() {
  const now = Date.now();
  if (discordCache.data && (now - discordCache.fetchedAt) < CACHE_TTL_MS) {
    return discordCache.data;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(DISCORD_WIDGET_URL, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return discordCache.data;

    const json = await res.json();
    const members = Array.isArray(json.members) ? json.members : [];
    const parsed = {
      guildName: json.name || 'กลุ่มหมักปุ๋ย',
      onlineCount: typeof json.presence_count === 'number' ? json.presence_count : members.length,
      memberNames: members.slice(0, 20).map(m => m.username).filter(Boolean)
    };

    discordCache = { data: parsed, fetchedAt: now };
    return parsed;
  } catch (err) {
    // ถ้า Discord Widget ตอบช้าหรือเชื่อมต่อไม่ได้ ให้ใช้แคชเดิมหรือข้ามไปอย่างปลอดภัย
    return discordCache.data;
  }
}

export default async function handler(req, res) {
  // รับเฉพาะ POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { message, history } = body || {};
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const cleanMessage = message.trim().slice(0, 800);

    // ประกอบประวัติการสนทนา (Memory) เพื่อให้บอทจำบริบทต่อเนื่องได้ (สูงสุด 16 ข้อความล่าสุด / 8 รอบ)
    const contents = [];
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-16);
      for (const item of recentHistory) {
        if (!item || typeof item.text !== 'string') continue;
        const role = item.role === 'model' ? 'model' : 'user';
        const text = item.text.trim().slice(0, 800);
        if (!text) continue;

        // Gemini ต้องเริ่มด้วย role 'user' เสมอ
        if (contents.length === 0 && role !== 'user') continue;

        // ถ้า role ซ้ำติดกัน ให้รวมเข้าด้วยกันเพื่อไม่ให้ผิดกฎ Gemini API
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += '\n' + text;
        } else {
          contents.push({ role, parts: [{ text }] });
        }
      }
    }

    // เพิ่มข้อความล่าสุดของผู้ใช้ลงท้าย
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += '\n' + cleanMessage;
    } else {
      contents.push({ role: 'user', parts: [{ text: cleanMessage }] });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        available: false,
        reason: 'GEMINI_API_KEY is not configured',
        reply: null
      });
    }

    // ดึงข้อมูลสดจาก Discord Live Radar แล้วสร้าง System Prompt
    const liveDiscordInfo = await getDiscordLiveStatus();
    const systemPrompt = buildBombieSystemPrompt(liveDiscordInfo);

    // เรียก Google Gemini Flash Latest Endpoint (รองรับ System Instruction และ Free Tier)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 600,
          topP: 0.95
        }
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API Error:', geminiResponse.status, errText);
      return res.status(200).json({
        available: false,
        reason: 'Gemini API call failed',
        reply: null
      });
    }

    const geminiData = await geminiResponse.json();
    const candidate = geminiData.candidates?.[0];
    const replyText = candidate?.content?.parts?.[0]?.text?.trim();

    if (!replyText) {
      return res.status(200).json({
        available: false,
        reason: 'No reply generated',
        reply: null
      });
    }

    // จัดรูปแบบและขัดเกลาสำนวนข้อความให้อ่านง่าย สุภาพ และเป็นธรรมชาติ
    const safeReply = replyText
      .replace(/\u0e0a\u0e32\u0e22\u0e41\u0e17\u0e23\u0e48/gi, 'ผู้ชาย')
      .replace(/\u0e0a\u0e32\u0e22\u0e41\u0e17\u0e49/gi, 'ผู้ชาย')
      .replace(/ไม่มีใครดีเท่าแม่คุณแล้วครับ/gi, 'พี่คงเพอร์เฟกต์เกินไป');

    return res.status(200).json({
      available: true,
      source: 'gemini-flash-lite-latest',
      liveOnline: liveDiscordInfo ? liveDiscordInfo.onlineCount : null,
      reply: safeReply
    });

  } catch (error) {
    console.error('Serverless Handler Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
