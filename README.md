# กลุ่มหมักปุ๋ย — Community Discord Hub

เว็บไซต์ศูนย์รวมข้อมูล ช่องทางการติดต่อ และการเชื่อมต่อคอมมูนิตี้สำหรับกลุ่ม **"กลุ่มหมักปุ๋ย"** (barombombie community)

---

## ฟีเจอร์เด่น (Features)

* **โมเดิร์นดีไซน์ (Modern UI & UX)**: ออกแบบด้วยสไตล์ Discord & Google Stitch โทนสีเรียบหรู พร้อมเอฟเฟกต์ Glassmorphism, Grid Pattern Background และ Card Hover Animations
* **ระบบธีม 3 รูปแบบ (Theme System)**:
  * **Auto**: ตรวจจับและปรับตามการตั้งค่าเครื่องของผู้ใช้ (`prefers-color-scheme`) อัตโนมัติในครั้งแรกที่เข้าใช้งาน
  * **Dark / Light Toggle**: ปุ่มสลับโหมดมืด-สว่างบน Header พร้อมบันทึกการตั้งค่าลงใน `localStorage`
  * **Zero FOUC**: มีสคริปต์ตรวจสอบธีมตั้งแต่ระดับ `<head>` เพื่อป้องกันหน้าจอกะพริบหรือเปลี่ยนสีช้าขณะโหลดหน้าเว็บ
* **รองรับทุกขนาดหน้าจอ (Zero Horizontal Overflow)**: ปรับแต่ง Responsive Layout อย่างประณีตสำหรับหน้าจอทุกประเภท:
  * สมาร์ตโฟน (Mobile 320px – 640px): ซ่อน Announcement Bar บนหัวเว็บเพื่อความกะทัดรัด, ปรับ Padding ไม่ให้เบียด, ไม่มีอาการหน้าเว็บลอยหรือขอบขวาเกิน
  * แท็บเล็ต (Tablet 640px – 1024px)
  * หน้าจอคอมพิวเตอร์ (Desktop 1024px+)
* **Live Discord Widget**: แสดงสถานะจำนวนสมาชิกที่กำลังออนไลน์แบบเรียลไทม์ พร้อมปุ่มเข้าร่วมเซิร์ฟเวอร์
* **แชตบอท Dialogflow แบบ Inline**: หน้า `chatbot/` ฝัง Widget แชตจริงของ Bombie เข้ามาในการ์ดหน้าเว็บโดยตรง ไม่ต้องมีปุ่มลอยตัวมุมจอ พร้อมระบบคำถามด่วน (Quick Prompts) ที่มี Debounce ป้องกันการส่งข้อความซ้ำซ้อน
* **One-Click Clipboard Copy**: คัดลอก Discord Username หรืออีเมลติดต่อได้ในคลิกเดียว พร้อม Toast Notification แจ้งเตือนสวยงาม

---

## โครงสร้างหน้าเว็บ (Project Structure)

```text
MyDiscordWeb_MhakPui/
├── index.html          # หน้าหลัก: Hero, Live Discord Widget, เมนูแนะนำ, และช่องทางติดต่อด่วน
├── rules/
│   └── index.html      # หน้ากฎและข้อตกลงของเซิร์ฟเวอร์ 7 ข้อ พร้อมนโยบายข้อมูลส่วนบุคคล (PDPA)
├── chatbot/
│   └── index.html      # หน้าแชตบอท Bombie: ทำความเข้าใจบอท และหน้าต่างแชตจริง (Live Native Discord UI)
├── contact/
│   └── index.html      # หน้าติดต่อแอดมิน: การ์ด Discord DM และอีเมล พร้อมข้อมูลการตอบกลับ
├── api/
│   └── chat.js         # Hybrid Fallback API: เชื่อมต่อ Google Gemini 1.5 Flash (Free Tier)
├── .env.example        # ตัวอย่างไฟล์ Environment สำหรับเก็บ GEMINI_API_KEY แบบปลอดภัย
├── vercel.json         # การตั้งค่าสำหรับ Deploy บน Vercel ฟรี 100%
├── style.css           # สไตล์ชีตหลัก (Pure CSS + CSS Custom Properties รองรับ Dark/Light/Responsive)
├── script.js           # สคริปต์รวม: Theme Toggle, Clipboard Copy, Native Discord Chat, Hybrid Fallback
└── img/                # ไฟล์รูปภาพและไอคอนประจำโปรเจกต์
    ├── discordlogo.png
    ├── email.png
    ├── copy.png
    └── gmaillogo.png
```

---

## เครดิตเครื่องมือ AI (Credits & Collaborators)

* **Google Stitch**: ผู้ช่วย AI ในการสร้างสรรค์ไอเดีย ออกแบบโครงสร้างภาพรวม และวาง Prototype UI/UX สไตล์โมเดิร์น
* **Google Gemini (Google DeepMind)**: วางระบบ Logic, แก้ไขปัญหา Responsive, ออกแบบ Theme Switching, และตรวจสอบความเรียบร้อย
* **Claude Sonnet (Anthropic)**: ผู้ช่วย AI ในการร่วมเขียนโค้ด ปรับแต่งสไตล์ชีต และวางโครงสร้าง Multi-page
* **Dialogflow (Google Cloud)**: ระบบประมวลผลการสนทนาสำหรับบอทประจำกลุ่ม (Bombie Bot)
* **ทรัพยากรการออกแบบ**:
  * **Icons**: [Google Material Symbols Outlined](https://fonts.google.com/icons)
  * **Fonts**: Prompt, Plus Jakarta Sans และ JetBrains Mono จาก [Google Fonts](https://fonts.google.com/)
* **Discord Community**: [https://discord.gg/zXkMQqmtnw](https://discord.gg/zXkMQqmtnw)
* **ลิขสิทธิ์**: © 2026 กลุ่มหมักปุ๋ย (barombombie community). All rights reserved.
