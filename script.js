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
  const AVATAR_BOT = 'https://avatars.githubusercontent.com/u/8170782?s=200&v=4';
  const AVATAR_USER = '../img/discordlogo.png';

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

  window.appendNativeChatMessage = function (role, text) {
    const feed = document.getElementById('chat-messages-feed');
    if (!feed) return;

    const row = document.createElement('div');
    const isBot = role === 'bot';
    row.className = 'chat-message-row ' + (isBot ? 'bot-row' : 'user-row');

    const avatarUrl = isBot ? AVATAR_BOT : AVATAR_USER;
    const authorName = isBot ? 'Bombie' : 'คุณ';
    const tagHtml = isBot ? '<span class="chat-tag-bot">BOT</span>' : '';
    const bubbleClass = isBot ? 'chat-bubble-bot' : 'chat-bubble-user';
    const timeStr = formatCurrentTime();

    // จัดการข้อความ line breaks
    const safeText = escapeHtml(text).replace(/\n/g, '<br>');

    row.innerHTML =
      '<div class="chat-avatar-mini">' +
        '<img src="' + avatarUrl + '" alt="' + authorName + '">' +
      '</div>' +
      '<div style="max-width: 85%;">' +
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

  // ระบบตรวจสอบว่าคำถามควรส่งไปหา Gemini หรือไม่ (Smart Intent Router)
  function shouldRouteToGemini(userText, queryResult) {
    if (!queryResult) return true;

    const intentName = queryResult.intent?.displayName || '';
    const confidence = Number(queryResult.intentDetectionConfidence) || 0;
    const text = userText.trim();

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

  // ฟังก์ชันเรียก Gemini AI (รองรับทั้ง Vercel Serverless / Local Node Server / Localhost Preview)
  async function callGeminiFallback(userText) {
    // 1. ลองเรียก /api/chat ก่อนเสมอ (สำหรับ Production บน Vercel หรือ local dev server)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.available && data.reply) {
          console.log('%c[Bombie Brain]%c 🚀 ตอบด้วย Gemini 1.5 Flash (via /api/chat)', 'color:#5865F2;font-weight:bold;', 'color:#10b981;');
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
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + localKey,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{
                    text: 'คุณคือ Bombie (บอมบี้) บอทผู้ช่วยประจำเซิร์ฟเวอร์ Discord "กลุ่มหมักปุ๋ย"\n' +
                          'บุคลิกและสไตล์การพูด:\n' +
                          '- ชิวๆ กวนๆ เป็นกันเอง สุภาพปนกวนตีนนิดๆ\n' +
                          '- มักพูดลงท้ายด้วย "ครับพี่", "ครับผม", "น้า"\n' +
                          '- ห้ามตอบเป็นทางการเหมือนหุ่นยนต์ ให้ตอบเหมือนเพื่อนคุยในกลุ่ม Discord\n' +
                          '- ตอบสั้น กระชับ 1-3 ประโยค\n' +
                          'ข้อมูลและ Lore ของกลุ่มหมักปุ๋ย:\n' +
                          '1. ที่มาชื่อกลุ่ม: เกิดจากการโหวตกันในกลุ่ม ฟีลเหมือนเอาวัตถุดิบ เศษขยะ หรือสิ่งปฏิกูลมารวมกันหมักหมมไว้ นานวันเข้าดันกลายเป็นปุ๋ยที่มีประโยชน์เฉยเลย\n' +
                          '2. แอดมิน: ชื่อ Barombombie (ยศ CEO ผู้รับจบทุกงานในเซิร์ฟเวอร์)\n' +
                          '3. สมาชิก: เรียกว่า "ท่านสมาชิกทั้งหลาย"\n' +
                          '4. สภาพเซิร์ฟเวอร์: เมื่อก่อนคุยทั้งวันทั้งคืน แต่ตอนนี้ "ร้างแล้วครับ 555" พยายามชวนคนเข้ามากู้ชีพเซิร์ฟ\n' +
                          '5. ลิงก์ Discord: https://discord.gg/zXkMQqmtnw\n' +
                          '6. กฎหลัก 7 ข้อ: ไม่ Toxic, ไม่สแปม, ให้เกียรติกัน, ห้าม 18+ หรือผิดกฎหมาย'
                  }]
                },
                contents: [{ role: 'user', parts: [{ text: userText }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 200 }
              })
            }
          );

          if (directRes.ok) {
            const directData = await directRes.json();
            const rep = directData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (rep) {
              console.log('%c[Bombie Brain]%c 🚀 ตอบด้วย Gemini 1.5 Flash (Direct Local API)', 'color:#5865F2;font-weight:bold;', 'color:#10b981;');
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

  let isSubmitting = false;

  window.sendNativeChatMessage = async function (rawText) {
    const text = (rawText || '').trim();
    if (!text || isSubmitting) return;

    isSubmitting = true;
    const input = document.getElementById('chat-native-input');
    const sendBtn = document.getElementById('chat-native-send-btn');
    if (input) input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    // 1. แสดงกล่องข้อความของผู้ใช้
    appendNativeChatMessage('user', text);

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

        // ตรวจสอบว่าคำถามนี้ควรส่งต่อให้ Gemini AI หรือไม่
        shouldCallAI = shouldRouteToGemini(text, data.queryResult);
        console.log(
          '%c[Bombie Brain]%c Intent: [' + intentName + '] (conf=' + confidence.toFixed(2) + ') => ' +
          (shouldCallAI ? '🚀 ส่งต่อ Gemini AI' : '⚡ ใช้คำตอบ Dialogflow'),
          'color:#5865F2;font-weight:bold;',
          'color:' + (shouldCallAI ? '#f59e0b;' : '#10b981;')
        );
      } else {
        shouldCallAI = true;
      }

      // ด่านที่ 2: ถ้าเข้าเงื่อนไขส่งต่อ ให้เรียกใช้สมอง Gemini AI
      if (shouldCallAI || !botReply || botReply.trim() === '') {
        const aiResult = await callGeminiFallback(text);
        if (aiResult && aiResult.success && aiResult.reply) {
          botReply = aiResult.reply;
        }
      }

      showNativeChatTyping(false);

      if (!botReply || botReply.trim() === '') {
        botReply = 'ห้ะ ผมยังไม่เข้าใจที่พิมพ์มาอะครับ ขอเวลาไปเรียนรู้เพิ่มก่อนนะพี่';
      }

      appendNativeChatMessage('bot', botReply);

    } catch (err) {
      console.warn('Dialogflow chat request error:', err);
      // ลองถาม Gemini AI ดูก่อนถ้า Dialogflow ล่ม
      const aiResult = await callGeminiFallback(text);
      showNativeChatTyping(false);

      if (aiResult && aiResult.success && aiResult.reply) {
        appendNativeChatMessage('bot', aiResult.reply);
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
    // เลื่อนลงไปที่กล่องแชตถ้าจำเป็น
    const chatCard = document.getElementById('live-chat-card');
    if (chatCard && window.innerWidth <= 768) {
      chatCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    sendNativeChatMessage(text);
  };

  window.clearChatHistory = function () {
    const feed = document.getElementById('chat-messages-feed');
    if (!feed) return;
    feed.innerHTML =
      '<div class="chat-message-row bot-row animate-fadeIn">' +
        '<div class="chat-avatar-mini">' +
          '<img src="' + AVATAR_BOT + '" alt="Bombie">' +
        '</div>' +
        '<div style="max-width: 85%;">' +
          '<div class="chat-meta">' +
            '<span class="chat-author">Bombie</span>' +
            '<span class="chat-tag-bot">BOT</span>' +
            '<span class="chat-time">ตอนนี้</span>' +
          '</div>' +
          '<div class="chat-bubble-bot">' +
            'สวัสดีครับ! เริ่มการสนทนาใหม่แล้ว มีอะไรให้ช่วย หรืออยากคุยเล่น ถามมาได้เลยครับ!' +
          '</div>' +
        '</div>' +
      '</div>';
    showToast('ล้างประวัติการสนทนาแล้ว');
  };

  // Backward-compatibility alias
  window.openChatMessenger = function () {
    const input = document.getElementById('chat-native-input');
    if (input) input.focus();
  };
})();
