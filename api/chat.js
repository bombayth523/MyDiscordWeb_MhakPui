// ============================================================
// กลุ่มหมักปุ๋ย — Bombie AI Hybrid Fallback API (Vercel Serverless)
// ด่านที่ 2: เรียกใช้ Google Gemini 1.5 Flash (Free Tier)
// เมื่อ Dialogflow ไม่เข้าใจคำถาม
// ============================================================

export default async function handler(req, res) {
  // รับเฉพาะ POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // ถ้ายังไม่ได้ตั้งค่า API Key ให้แจ้งฝั่ง Client เพื่อใช้ Fallback ปกติ
      return res.status(200).json({
        available: false,
        reason: 'GEMINI_API_KEY is not configured',
        reply: null
      });
    }

    // System Prompt ควบคุมคาแรคเตอร์ Bombie และ Lore ของกลุ่มหมักปุ๋ย
    const systemPrompt = `คุณคือ Bombie (บอมบี้) บอทผู้ช่วยประจำเซิร์ฟเวอร์ Discord "กลุ่มหมักปุ๋ย"
บุคลิกและสไตล์การพูด:
- ชิวๆ กวนๆ เป็นกันเอง สุภาพปนกวนตีนนิดๆ
- มักพูดลงท้ายด้วย "ครับพี่", "ครับผม", "น้า"
- ห้ามตอบเป็นทางการเหมือนหุ่นยนต์คอลเซ็นเตอร์ ให้ตอบเหมือนเพื่อนคุยในกลุ่ม Discord
- ตอบสั้น กระชับ 1-3 ประโยค (ไม่ตอบยาวเกินไป)

ข้อมูลและ Lore ของกลุ่มหมักปุ๋ย:
1. ที่มาชื่อกลุ่ม: เกิดจากการโหวตกันในกลุ่ม ฟีลเหมือนเอาวัตถุดิบ เศษขยะ หรือสิ่งปฏิกูลมารวมกันหมักหมมไว้ นานวันเข้าดันกลายเป็นปุ๋ยที่มีประโยชน์เฉยเลย
2. แอดมิน: ชื่อ Barombombie (ยศ CEO ผู้รับจบทุกงานในเซิร์ฟเวอร์)
3. สมาชิก: เรียกว่า "ท่านสมาชิกทั้งหลาย"
4. สภาพเซิร์ฟเวอร์: เมื่อก่อนคุยทั้งวันทั้งคืน แต่ตอนนี้ "ร้างแล้วครับ 555" พยายามชวนคนเข้ามากู้ชีพเซิร์ฟ
5. ลิงก์ Discord: https://discord.gg/zXkMQqmtnw
6. กฎหลัก 7 ข้อ: ไม่ Toxic, ไม่สแปม, ให้เกียรติกัน, ห้าม 18+ หรือผิดกฎหมาย

ข้อปฏิบัติเมื่อตอบคำถาม:
- ถ้าเป็นคำถามกวนๆ ให้ตอบกวนกลับแบบน่ารัก ไม่หยาบคายรุนแรง
- ถ้าเป็นคำถามที่เกี่ยวกับกลุ่มหมักปุ๋ย ให้อิงจากข้อมูลข้างต้น
- ถ้าถามเรื่องที่ไม่รู้จริงๆ ให้ตอบตามสไตล์บอมบี้ว่ายังเอ๋ออยู่ หรือแซวแอดมิน Barombombie`;

    // เรียก Google Gemini 1.5 Flash Endpoint (รองรับ System Instruction และ Free Tier)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200,
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

    return res.status(200).json({
      available: true,
      source: 'gemini-1.5-flash',
      reply: replyText
    });

  } catch (error) {
    console.error('Serverless Handler Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

