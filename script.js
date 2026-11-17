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
      let isFallback = false;

      if (data && data.queryResult) {
        const intentName = data.queryResult.intent?.displayName || '';
        if (intentName === 'Default fallback intent') {
          isFallback = true;
        }

        if (data.queryResult.fulfillmentText) {
          botReply = data.queryResult.fulfillmentText;
        } else if (data.queryResult.fulfillmentMessages && data.queryResult.fulfillmentMessages.length > 0) {
          const firstMsg = data.queryResult.fulfillmentMessages[0];
          if (firstMsg.text && firstMsg.text.text && firstMsg.text.text[0]) {
            botReply = firstMsg.text.text[0];
          }
        }
      }

      // ด่านที่ 2: ถ้า Dialogflow ตอบไม่ได้ (ติด Fallback) ให้ลองถาม Gemini AI ผ่าน /api/chat
      if (isFallback || !botReply || botReply.trim() === '') {
        try {
          const aiResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            if (aiData && aiData.available && aiData.reply) {
              botReply = aiData.reply;
            }
          }
        } catch (e) {
          // ถ้าไม่มี backend หรือ /api/chat เรียกไม่ได้ ให้ใช้คำตอบเดิม
          console.debug('AI fallback endpoint not reachable, keeping default fallback');
        }
      }

      showNativeChatTyping(false);

      if (!botReply || botReply.trim() === '') {
        botReply = 'ห้ะ ผมยังไม่เข้าใจที่พิมพ์มาอะครับ ขอเวลาไปเรียนรู้เพิ่มก่อนนะพี่';
      }

      appendNativeChatMessage('bot', botReply);

    } catch (err) {
      console.warn('Dialogflow chat request error:', err);
      showNativeChatTyping(false);
      appendNativeChatMessage('bot', 'ขออภัยครับ ตอนนี้สัญญาณเน็ตหรือเซิร์ฟเวอร์ Dialogflow ตอบกลับช้า ลองพิมพ์ใหม่อีกครั้งนะครับ');
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
