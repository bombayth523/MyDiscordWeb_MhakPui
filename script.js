// ============================================================
// กลุ่มหมักปุ๋ย — Shared Script v3
// Theme toggle + Copy to clipboard + Toast notification
// ============================================================

// ─── Theme Toggle ───────────────────────────────────────────
(function () {
  const root = document.documentElement;
  const STORAGE_KEY = 'mhakpui-theme';

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const icon = btn.querySelector('.material-symbols-outlined');
    if (!icon) return;
    // show sun icon when dark (click → switch to light), moon when light (click → switch to dark)
    icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    btn.setAttribute('aria-label', theme === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด');
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const theme = saved || getSystemTheme();
    applyTheme(theme);
  }

  window.toggleTheme = function () {
    const current = root.getAttribute('data-theme') || getSystemTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  // Run as soon as DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  // Also listen for system preference changes (when no manual override)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();

// ─── Copy to Clipboard ─────────────────────────────────────
function copyToClipboard(contentId) {
  const el = document.getElementById('contentToCopy' + contentId);
  if (!el) return;
  const text = el.textContent.trim();
  copyTextDirect(text, 'คัดลอกแล้ว: ' + text);
}

function copyContent(text, label) {
  if (!text) return;
  const msg = label ? 'คัดลอก ' + label + ' (' + text + ') เรียบร้อยแล้ว' : 'คัดลอกแล้ว: ' + text;
  copyTextDirect(text, msg);
}

function copyTextDirect(text, successMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(function () {
      showToast(successMsg);
    }).catch(function () {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(successMsg || ('คัดลอกแล้ว: ' + text));
  } catch (e) {
    showToast('ไม่สามารถคัดลอกได้: ' + text);
  }
  document.body.removeChild(ta);
}

// ─── Toast Notification ────────────────────────────────────
function showToast(message) {
  const existing = document.getElementById('copy-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'copy-toast';
  toast.innerHTML =
    '<span class="material-symbols-outlined" style="font-size:18px;color:#3ba55c">check_circle</span>' +
    '<span>' + message + '</span>';

  document.body.appendChild(toast);
  requestAnimationFrame(function () {
    toast.style.opacity = '1';
  });
  setTimeout(function () {
    toast.style.opacity = '0';
    setTimeout(function () { toast.remove(); }, 350);
  }, 2500);
}

// ─── Native Discord Chat (Option B) ─────────────────────────
(function () {
  const DF_AGENT_ID = '10e38222-0dfa-4b1e-a697-e959528cf96d';
  const STORAGE_SESSION_KEY = 'mhakpui_bombie_session';
  const STORAGE_MEMORY_KEY = 'mhakpui_bombie_memory';
  const STORAGE_CHAT_LOG_KEY = 'mhakpui_bombie_chat_log';
  const AVATAR_BOT = 'https://avatars.githubusercontent.com/u/8170782?s=200&v=4';
  const AVATAR_USER = '../img/discordlogo.png';

  let chatDisplayLog = [];

  function saveSessionState() {
    try {
      sessionStorage.setItem(STORAGE_MEMORY_KEY, JSON.stringify(conversationHistory));
      sessionStorage.setItem(STORAGE_CHAT_LOG_KEY, JSON.stringify(chatDisplayLog));
    } catch (e) {}
  }

  function getSessionId() {
    let sid = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!sid) {
      sid = 'session-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
      localStorage.setItem(STORAGE_SESSION_KEY, sid);
    }
    return sid;
  }

  function formatCurrentTime() {
    const d = new Date();
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function scrollToBottom() {
    const feed = document.getElementById('chat-messages-feed');
    if (!feed) return;
    feed.scrollTop = feed.scrollHeight;
  }

  window.showNativeChatTyping = function (show) {
    const indicator = document.getElementById('chat-typing-indicator');
    if (!indicator) return;
    if (show) {
      indicator.classList.remove('hidden');
      scrollToBottom();
    } else {
      indicator.classList.add('hidden');
    }
  };

  window.appendNativeChatMessage = function (role, text, customTime, skipSave) {
    const feed = document.getElementById('chat-messages-feed');
    if (!feed) return;

    const row = document.createElement('div');
    const isBot = role === 'bot';
    row.className = 'chat-message-row ' + (isBot ? 'bot-row' : 'user-row');

    const avatarUrl = isBot ? AVATAR_BOT : AVATAR_USER;
    const authorName = isBot ? 'Bombie' : 'คุณ';
    const tagHtml = isBot ? '<span class="chat-tag-bot">BOT</span>' : '';
    const bubbleClass = isBot ? 'chat-bubble-bot' : 'chat-bubble-user';
    const timeStr = customTime || formatCurrentTime();

    // จัดการข้อความ line breaks
    const safeText = escapeHtml(text).replace(/\n/g, '<br>');

    row.innerHTML =
      '<div class="chat-avatar-mini">' +
        '<img src="' + avatarUrl + '" alt="' + authorName + '">' +
      '</div>' +
      '<div class="chat-msg-body">' +
        '<div class="chat-meta">' +
          '<span class="chat-author">' + authorName + '</span>' +
          tagHtml +
          '<span class="chat-time">' + timeStr + '</span>' +
        '</div>' +
        '<div class="' + bubbleClass + '">' +
          safeText +
        '</div>' +
      '</div>';

    feed.appendChild(row);
    scrollToBottom();

    if (!skipSave) {
      chatDisplayLog.push({ role: role, text: text, time: timeStr });
      if (chatDisplayLog.length > 40) {
        chatDisplayLog = chatDisplayLog.slice(-40);
      }
      saveSessionState();
    }
  };

  // รายชื่อ Intents ข้อมูลเซิร์ฟเวอร์กลุ่มหมักปุ๋ยที่ให้ Dialogflow ตอบโดยตรง
  const KNOWN_COMMUNITY_INTENTS = new Set([
    'Default Welcome Intent',
    'กลุ่มหมักปุ๋ยคืออะไร',
    'มีใครอยู่บ้าง',
    'ทำอะไรได้บ้าง',
    'เล่นเกมอะไรกันบ้าง',
    'กฎเซิร์ฟเวอร์',
    'ขอเข้าดิส',
    'ติดต่อแอดมิน',
    'ทำไมชื่อกลุ่มหมักปุ๋ย',
    'เซิร์ฟร้างไหม',
    'ยศในเซิร์ฟเวอร์',
    'ยืมเงินหน่อย',
    'แอดมินหล่อไหม',
    'บอทกวนตีน',
    'ขอบคุณ',
    'ผู้ใช้ขอบคุณ',
    'บอกลา',
    'ฝันดี'
  ]);

  // คำสำคัญสำหรับส่งต่อให้ AI วิเคราะห์บริบทเชิงลึกและสถานะ Real-time
  const DEEP_AI_KEYWORDS = [
    'ตอนนี้', 'ออนไลน์', 'ออนอยู่', 'กี่คน',
    'dyno', 'ไดโน', 'manybaht', 'pekky', 'rythm', 'บอทเพลง', 'บอทเปิดเพลง',
    'ห้องนั่งเล่น', 'ริมสวน', 'หลังบ้าน', 'ห้องน้ำ', 'ห้องนอน', 'ห้องเสียง', 'มีห้อง',
    'ceo', 'ซีอีโอ', 'ผู้ก่อตั้ง', 'ดราม่า', 'ทะเลาะ', 'ตำนาน',
    'เพศ', 'ผู้ชาย', 'ผู้หญิง', 'เพศอะไร'
  ];

  // ระบบตรวจสอบว่าคำถามควรส่งไปหา Gemini หรือไม่ (Smart Intent Router)
  function shouldRouteToGemini(userText, queryResult) {
    if (!queryResult) return true;

    const intentName = queryResult.intent?.displayName || '';
    const confidence = Number(queryResult.intentDetectionConfidence) || 0;
    const text = userText.trim();
    const lowerText = text.toLowerCase();

    // 0. ถ้าเป็นคำถามขอสถานะสดจาก Discord หรือ Lore เชิงลึก ให้ส่ง Gemini + Discord Live Radar ตอบ
    if (DEEP_AI_KEYWORDS.some(function (kw) { return lowerText.includes(kw); })) {
      return true;
    }

    // 1. ถ้าเป็น Fallback Intent ตรงๆ หรือความมั่นใจต่ำกว่า 65%
    if (intentName === 'Default fallback intent' || queryResult.isFallback || confidence < 0.65) {
      return true;
    }

    // 2. ถ้า Intent ที่แมตช์ ไม่ได้อยู่ในรายการ Intents ข้อมูลชุมชนกลุ่มหมักปุ๋ย
    // (เช่น ไปแมตช์โดน intent กวนๆ เก่าๆ อย่าง 'เรียก', 'ขอหวย', 'จริง+หรอ', 'รักได้ไหม', 'งานหนัก', 'อายุ', 'โม้')
    if (!KNOWN_COMMUNITY_INTENTS.has(intentName)) {
      return true;
    }

    // 3. ถ้าแมตช์โดน 'มีใครอยู่บ้าง' หรือ 'ทำอะไรได้บ้าง' แต่คำถามของผู้ใช้ไม่มีคีย์เวิร์ดเกี่ยวกับกลุ่ม/คน/เซิร์ฟเวอร์เลย
    // เช่น "แมวมีกี่ขา" หรือ "1+1 ได้เท่าไหร่"
    if (intentName === 'มีใครอยู่บ้าง' || intentName === 'ทำอะไรได้บ้าง') {
      const communityWords = ['กลุ่ม', 'หมักปุ๋ย', 'ดิส', 'เซิร์ฟ', 'สมาชิก', 'ใคร', 'คน', 'บอท', 'ทำอะไร', 'ช่วย', 'เมม'];
      const hasCommunityWord = communityWords.some(function (w) { return text.includes(w); });
      if (!hasCommunityWord && text.length > 5) {
        return true;
      }
    }

    return false;
  }

  // ความจำระยะสั้นของบอท (เก็บประวัติการคุยสูงสุด 16 ข้อความล่าสุด / 8 รอบ + จำข้ามหน้าใน sessionStorage)
  let conversationHistory = [];

  function recordChatMemory(role, text) {
    if (!text || typeof text !== 'string') return;
    conversationHistory.push({
      role: role === 'model' ? 'model' : 'user',
      text: text.trim()
    });
    if (conversationHistory.length > 16) {
      conversationHistory = conversationHistory.slice(-16);
    }
    saveSessionState();
  }

  function restoreChatSession() {
    const feed = document.getElementById('chat-messages-feed');
    if (!feed) return;
    try {
      const savedMem = sessionStorage.getItem(STORAGE_MEMORY_KEY);
      if (savedMem) {
        const parsedMem = JSON.parse(savedMem);
        if (Array.isArray(parsedMem)) {
          conversationHistory = parsedMem.slice(-16);
        }
      }
      const savedLog = sessionStorage.getItem(STORAGE_CHAT_LOG_KEY);
      if (savedLog) {
        const parsedLog = JSON.parse(savedLog);
        if (Array.isArray(parsedLog) && parsedLog.length > 0) {
          chatDisplayLog = parsedLog.slice(-40);
          for (let i = 0; i < chatDisplayLog.length; i++) {
            const m = chatDisplayLog[i];
            if (m && m.role && m.text) {
              appendNativeChatMessage(m.role, m.text, m.time, true);
            }
          }
        }
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreChatSession);
  } else {
    restoreChatSession();
  }

  function buildGeminiContents(history, currentUserText) {
    const contents = [];
    if (Array.isArray(history)) {
      for (let i = 0; i < history.length; i++) {
        const item = history[i];
        if (!item || !item.text) continue;
        const role = item.role === 'model' ? 'model' : 'user';
        if (contents.length === 0 && role !== 'user') continue;
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += '\n' + item.text;
        } else {
          contents.push({ role: role, parts: [{ text: item.text }] });
        }
      }
    }
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += '\n' + currentUserText;
    } else {
      contents.push({ role: 'user', parts: [{ text: currentUserText }] });
    }
    return contents;
  }

  // ฟังก์ชันเรียก Gemini AI (รองรับทั้ง Vercel Serverless / Local Node Server / Localhost Preview + จำบริบท)
  async function callGeminiFallback(userText, history) {
    // 1. ลองเรียก /api/chat ก่อนเสมอ (สำหรับ Production บน Vercel หรือ local dev server)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: history || []
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.available && data.reply) {
          console.log('%c[Bombie Brain]%c 🚀 ตอบด้วย Gemini Flash (via /api/chat | จำ ' + (history ? history.length : 0) + ' ข้อความ)', 'color:#5865F2;font-weight:bold;', 'color:#10b981;');
          return { success: true, reply: data.reply };
        }
      }
    } catch (err) {
      console.debug('[Bombie Brain] /api/chat not reachable:', err);
    }

    // 2. ถ้าเรียก /api/chat ได้ 404 (แปลว่ารันบน Static Local Server เช่น VS Code Live Preview)
    const isLocal = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.protocol === 'file:';

    if (isLocal) {
      let localKey = localStorage.getItem('mhakpui_dev_gemini_key');
      if (!localKey) {
        localKey = window.prompt(
          '【โหมดทดสอบ Localhost】\nเนื่องจากคุณเปิดเว็บผ่าน Static Server (เช่น VS Code Live Preview) ซึ่งไม่รองรับ Serverless\n\nกรุณาวาง Gemini API Key ของคุณที่นี่ เพื่อให้หน้าเว็บเรียกสมอง AI ได้โดยตรงบนเครื่องนี้ (จะถูกบันทึกใน browser เครื่องนี้เท่านั้น):'
        );
        if (localKey && localKey.trim()) {
          localKey = localKey.trim();
          localStorage.setItem('mhakpui_dev_gemini_key', localKey);
        }
      }

      if (localKey) {
        try {
          const directRes = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=' + localKey,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{
                    text: 'คุณคือ "Bombie" (บอมบี้ / Barom) แชตบอทผู้ช่วยเพศชายประจำเซิร์ฟเวอร์ Discord "กลุ่มหมักปุ๋ย"\n' +
                          'บุคลิกและมารยาท: บอทผู้ชาย พูด "ผม" เรียกผู้ใช้ว่า "พี่/ท่านสมาชิก" สุภาพปนขี้เล่น เป็นมิตรกับทุกคนทุกเพศอย่างเท่าเทียม ไม่ใช้คำสแลงหยาบคาย ตอบสั้นกระชับ 1-3 ประโยค\n' +
                          'โทนการพูด (Adaptive Tone): ถ้าผู้ใช้คุยสุภาพ ให้กวนน่ารักพูด "ครับพี่/ครับผม/ท่านสมาชิก" แต่ถ้าผู้ใช้คุยแบบเพื่อนหรือเริ่มกวนตีน/หยาบ ให้ลดความสุภาพลงเป็นโหมดเพื่อนในดิส กวนตีนขึ้น ประชดนิดๆ น่าหมั่นเขี้ยว แต่ไม่หยาบรุนแรง ตอบสั้น 1-3 ประโยค\n' +
                          'Lore กลุ่มหมักปุ๋ย: โหวตชื่อกันเองฟีลเอาขยะ/สิ่งปฏิกูลมาหมักจนเป็นปุ๋ยที่มีประโยชน์, ห้องในดิสแบ่งฟีลบ้านอบอุ่น (ห้องนั่งเล่น, ห้องริมสวน, ห้องหลังบ้าน, ห้องน้ำ, ห้องนอน), เปิดมาหลายปีเคยคึกคักและมีดราม่าด่ากันแต่ก็คุยกันได้ปกติ ตอนนี้ร้างจัดๆ ร้อยวันพันปีเจอคนที\n' +
                          'CEO & บอท: มี CEO 3 คนแต่อีก 2 คนไม่ทำไร มีแค่ CEO ผู้ก่อตั้ง Barombombie แบกทุกอย่าง (เว็บ/บอท/ระบบ), บอท Dyno คือเลขาประจำดิสและมือขวา, บอทเปิดเพลง (Manybaht, Pekky, Rythm) นานๆ มีคนใช้ทีถ้าใครใช้คงดีใจ\n' +
                          'คำติดปาก: "ของแท้", "อะหยอก", "รับจบ", "กินไฟกินเน็ต", "ดูธรรมะธัมโมบ้างสี๊", "พี่คงเพอร์เฟกต์เกินไป", "ทำไรก็ได้ครับ ไม่ได้ขอตังค์ใคร"\n' +
                          'ลิงก์ Discord: https://discord.gg/zXkMQqmtnw | กฎ 7 ข้อไม่ Toxic ไม่สแปม ไม่ 18+'
                  }]
                },
                contents: buildGeminiContents(history, userText),
                generationConfig: { temperature: 0.85, maxOutputTokens: 600 }
              })
            }
          );

          if (directRes.ok) {
            const directData = await directRes.json();
            const rep = directData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (rep) {
              console.log('%c[Bombie Brain]%c 🚀 ตอบด้วย Gemini Flash (Direct Local API | จำ ' + (history ? history.length : 0) + ' ข้อความ)', 'color:#5865F2;font-weight:bold;', 'color:#10b981;');
              return { success: true, reply: rep };
            }
          }
        } catch (localErr) {
          console.warn('[Bombie Brain] Local Gemini call failed:', localErr);
        }
      }
    }

    return { success: false, reply: null };
  }

  // ปรับแต่งข้อความตอบกลับและกรองคำสแลงที่ไม่เหมาะสมให้สุภาพ
  function sanitizeBotReply(reply) {
    if (!reply || typeof reply !== 'string') return reply;
    return reply
      .replace(/\u0e0a\u0e32\u0e22\u0e41\u0e17\u0e23\u0e48/gi, 'ผู้ชาย')
      .replace(/\u0e0a\u0e32\u0e22\u0e41\u0e17\u0e49/gi, 'ผู้ชาย')
      .replace(/ไม่มีใครดีเท่าแม่คุณแล้วครับ/gi, 'พี่คงเพอร์เฟกต์เกินไป');
  }

  let isSubmitting = false;

  window.sendNativeChatMessage = async function (rawText) {
    const text = (rawText || '').trim();
    if (!text || isSubmitting) return;

    isSubmitting = true;
    const input = document.getElementById('chat-native-input');
    const sendBtn = document.getElementById('chat-native-send-btn');
    if (input) input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    // เก็บประวัติก่อนหน้าไว้ส่งให้ Gemini จำบริบท
    const historySnapshot = conversationHistory.slice();

    // 1. แสดงกล่องข้อความของผู้ใช้และบันทึกลงความจำ
    appendNativeChatMessage('user', text);
    recordChatMemory('user', text);

    // 2. แสดงสถานะ Bombie กำลังพิมพ์
    showNativeChatTyping(true);

    const sessionId = getSessionId();
    const endpoint = 'https://dialogflow.cloud.google.com/v1/integrations/messenger/webhook/' +
      DF_AGENT_ID + '/sessions/' + sessionId;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryInput: {
            text: {
              text: text,
              languageCode: 'th'
            }
          }
        })
      });

      const responseText = await response.text();
      // ตัด Google XSSI prefix `)]}'\n` ออกก่อน parse JSON
      const cleanJson = responseText.replace(/^\)\]\}'\s*/, '');
      const data = JSON.parse(cleanJson);

      let botReply = '';
      let shouldCallAI = false;

      if (data && data.queryResult) {
        const intentName = data.queryResult.intent?.displayName || '';
        const confidence = Number(data.queryResult.intentDetectionConfidence) || 0;

        // ดึงคำตอบจาก Dialogflow
        if (data.queryResult.fulfillmentText) {
          botReply = data.queryResult.fulfillmentText;
        } else if (data.queryResult.fulfillmentMessages && data.queryResult.fulfillmentMessages.length > 0) {
          const firstMsg = data.queryResult.fulfillmentMessages[0];
          if (firstMsg.text && firstMsg.text.text && firstMsg.text.text[0]) {
            botReply = firstMsg.text.text[0];
          }
        }

        // ตรวจสอบ Intent และขัดเกลาคำตอบเบื้องต้นก่อนส่งต่อ AI
        if (intentName === 'บอทเพศอะไร' || (botReply && botReply.includes('\u0e0a\u0e32\u0e22\u0e41\u0e17\u0e23\u0e48'))) {
          botReply = 'ผมเป็นบอทผู้ชายประจำกลุ่มหมักปุ๋ยครับ เป็นเพื่อนคุยเล่นกับทุกคนได้ทุกเพศทุกวัยเลยครับ!';
          shouldCallAI = true;
        } else {
          // ตรวจสอบว่าคำถามนี้ควรส่งต่อให้ Gemini AI หรือไม่
          shouldCallAI = shouldRouteToGemini(text, data.queryResult);
        }

        console.log(
          '%c[Bombie Brain]%c Intent: [' + intentName + '] (conf=' + confidence.toFixed(2) + ') => ' +
          (shouldCallAI ? '🚀 ส่งต่อ Gemini AI' : '⚡ ใช้คำตอบ Dialogflow'),
          'color:#5865F2;font-weight:bold;',
          'color:' + (shouldCallAI ? '#f59e0b;' : '#10b981;')
        );
      } else {
        shouldCallAI = true;
      }

      // ด่านที่ 2: ถ้าเข้าเงื่อนไขส่งต่อ ให้เรียกใช้สมอง Gemini AI พร้อมประวัติการคุย
      if (shouldCallAI || !botReply || botReply.trim() === '') {
        const aiResult = await callGeminiFallback(text, historySnapshot);
        if (aiResult && aiResult.success && aiResult.reply) {
          botReply = aiResult.reply;
        }
      }

      showNativeChatTyping(false);

      if (!botReply || botReply.trim() === '') {
        botReply = 'ห้ะ ผมยังไม่เข้าใจที่พิมพ์มาอะครับ ขอเวลาไปเรียนรู้เพิ่มก่อนนะพี่';
      }

      // ปรับแต่งและขัดเกลาสำนวนข้อความก่อนแสดงผล
      botReply = sanitizeBotReply(botReply);

      appendNativeChatMessage('bot', botReply);
      recordChatMemory('model', botReply);

    } catch (err) {
      console.warn('Dialogflow chat request error:', err);
      // ลองถาม Gemini AI ดูก่อนถ้า Dialogflow ล่ม
      const aiResult = await callGeminiFallback(text, historySnapshot);
      showNativeChatTyping(false);

      if (aiResult && aiResult.success && aiResult.reply) {
        const safeReply = sanitizeBotReply(aiResult.reply);
        appendNativeChatMessage('bot', safeReply);
        recordChatMemory('model', safeReply);
      } else {
        appendNativeChatMessage('bot', 'ขออภัยครับ ตอนนี้สัญญาณเน็ตหรือเซิร์ฟเวอร์ Dialogflow ตอบกลับช้า ลองพิมพ์ใหม่อีกครั้งนะครับ');
      }
    } finally {
      isSubmitting = false;
      if (sendBtn) sendBtn.disabled = false;
      if (input) input.focus();
    }
  };

  window.handleNativeChatSubmit = function (event) {
    if (event) event.preventDefault();
    const input = document.getElementById('chat-native-input');
    if (!input) return;
    sendNativeChatMessage(input.value);
  };

  window.promptToBot = function (text) {
    if (!text) return;
    // เลื่อนลงไปที่กล่องแชตถ้าจำเป็น (เมื่อไม่ได้อยู่ในโหมดขยายเต็มจอ)
    const chatCard = document.getElementById('live-chat-card');
    if (chatCard && !chatCard.classList.contains('is-expanded') && window.innerWidth <= 768) {
      chatCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    sendNativeChatMessage(text);
  };

  // โหมดขยายหน้าต่างแชตแบบ Overlay (Desktop) / เต็มจอ 100% (Mobile)
  window.toggleChatExpand = function (forceState) {
    const chatCard = document.getElementById('live-chat-card');
    const backdrop = document.getElementById('chat-backdrop');
    const icon = document.getElementById('chat-expand-icon');
    const label = document.getElementById('chat-expand-label');
    const btn = document.getElementById('chat-expand-btn');
    if (!chatCard) return;

    const currentlyExpanded = chatCard.classList.contains('is-expanded');
    const shouldExpand = typeof forceState === 'boolean' ? forceState : !currentlyExpanded;

    if (shouldExpand) {
      chatCard.classList.add('is-expanded');
      if (backdrop) backdrop.classList.add('is-visible');
      document.body.classList.add('chat-expanded-lock');
      if (icon) icon.textContent = 'close_fullscreen';
      if (label) label.textContent = 'ย่อ';
      if (btn) {
        btn.setAttribute('title', 'ย่อหน้าต่างแชต (กด Esc)');
        btn.setAttribute('aria-label', 'ย่อหน้าต่างแชต');
      }
      setTimeout(function () {
        scrollToBottom();
        const input = document.getElementById('chat-native-input');
        if (input) input.focus();
      }, 150);
    } else {
      chatCard.classList.remove('is-expanded');
      if (backdrop) backdrop.classList.remove('is-visible');
      document.body.classList.remove('chat-expanded-lock');
      if (icon) icon.textContent = 'open_in_full';
      if (label) label.textContent = 'ขยาย';
      if (btn) {
        btn.setAttribute('title', 'ขยายหน้าต่างแชต');
        btn.setAttribute('aria-label', 'ขยายหน้าต่างแชต');
      }
    }
  };

  // กดปุ่ม Esc เพื่อออกจากโหมดขยายแชต
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const chatCard = document.getElementById('live-chat-card');
      if (chatCard && chatCard.classList.contains('is-expanded')) {
        window.toggleChatExpand(false);
      }
    }
  });

  window.clearChatHistory = function () {
    conversationHistory = [];
    chatDisplayLog = [];
    localStorage.removeItem(STORAGE_SESSION_KEY);
    try {
      sessionStorage.removeItem(STORAGE_MEMORY_KEY);
      sessionStorage.removeItem(STORAGE_CHAT_LOG_KEY);
    } catch (e) {}
    const feed = document.getElementById('chat-messages-feed');
    if (!feed) return;
    feed.innerHTML =
      '<div class="chat-message-row bot-row animate-fadeIn">' +
        '<div class="chat-avatar-mini">' +
          '<img src="' + AVATAR_BOT + '" alt="Bombie">' +
        '</div>' +
        '<div class="chat-msg-body">' +
          '<div class="chat-meta">' +
            '<span class="chat-author">Bombie</span>' +
            '<span class="chat-tag-bot">BOT</span>' +
            '<span class="chat-time">ตอนนี้</span>' +
          '</div>' +
          '<div class="chat-bubble-bot">' +
            'สวัสดีครับ! ล้างความจำและเริ่มการสนทนาใหม่แล้ว มีอะไรให้ช่วย หรืออยากคุยเล่น ถามมาได้เลยครับ!' +
          '</div>' +
        '</div>' +
      '</div>';
    showToast('ล้างประวัติและความจำบอทแล้ว');
  };

  // Backward-compatibility alias
  window.openChatMessenger = function () {
    const input = document.getElementById('chat-native-input');
    if (input) input.focus();
  };
})();
