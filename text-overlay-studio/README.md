# 📝 Text Overlay Studio

Web Application สำหรับเพิ่มข้อความลงบนรูปภาพและวิดีโอ ด้วย Cloudinary API
ออกแบบมาสำหรับ E-commerce และ Social Media Marketing

## ✨ Features

### 🖼️ **Image Text Overlay**
- ✅ อัปโหลดรูปภาพ (JPG, PNG, WEBP)
- ✅ เพิ่มข้อความแบบ Real-time Preview
- ✅ **ข้อความโค้ง (Curved Text)** ด้วย Cloudinary Arc Distortion
- ✅ เลือกตำแหน่งด้วยการแตะบนรูป
- ✅ ปรับแต่ง Font, ขนาด, สี
- ✅ สีพื้นหลังและความโปร่งใส
- ✅ E-commerce Presets สำเร็จรูป (ป้ายลดราคา, ป้ายราคา, ลายน้ำ)
- ✅ ตำแหน่งสำเร็จรูป (มุมบนซ้าย, ตรงกลาง, ฯลฯ)

### 🎬 **Video Text Overlay**
- ✅ อัปโหลดวิดีโอ (MP4, WEBM)
- ✅ กำหนดเวลาเริ่ม-จบที่ข้อความปรากฏ
- ✅ Video Timeline Control
- ✅ ทุกฟีเจอร์เหมือน Image Overlay

### 📱 **Mobile-First Design**
- ✅ ออกแบบสำหรับมือถือ 100%
- ✅ รองรับ Android, iPhone, Tablet
- ✅ Touch-friendly Controls
- ✅ Responsive Design

### 🌐 **Integration**
- ✅ Cloudinary API สำหรับ Image/Video Transformation
- ✅ n8n Webhook สำหรับส่งข้อมูลไป Workflow
- ✅ Google Fonts (Mitr, Kanit, Prompt, ฯลฯ)

---

## 🚀 Quick Start

### 1. **ตั้งค่า Cloudinary**

1. สมัคร [Cloudinary Account](https://cloudinary.com/) (ฟรี)
2. ไปที่ **Settings > Upload > Upload Presets**
3. สร้าง Upload Preset ใหม่:
   - **Preset Name**: `upload-image`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `text-overlay` (optional)
   - บันทึก

### 2. **ตั้งค่า n8n Webhook**

1. สร้าง Workflow ใน n8n
2. เพิ่ม **Webhook Node**
3. ตั้งค่า HTTP Method: `POST`
4. คัดลอก Webhook URL

### 3. **แก้ไข config.js**

เปิดไฟล์ `text-overlay-studio/config.js` และแก้ไข:

```javascript
const CONFIG = {
    cloudinary: {
        cloudName: 'YOUR_CLOUD_NAME', // ⬅️ เปลี่ยนเป็น cloud name ของคุณ
        uploadPreset: 'upload-image',
    },
    n8n: {
        webhookURL: 'YOUR_WEBHOOK_URL', // ⬅️ เปลี่ยนเป็น n8n webhook URL
    },
    // ... ส่วนอื่นๆ
};
```

**หา Cloudinary Cloud Name:**
- ไปที่ [Cloudinary Dashboard](https://cloudinary.com/console)
- หาที่ **Product Environment Credentials** > **Cloud name**

### 4. **Deploy**

#### **Option A: Hostinger**
1. Upload โฟลเดอร์ `text-overlay-studio` ไปยัง `public_html/`
2. เข้าถึงผ่าน `https://yourdomain.com/text-overlay-studio/`

#### **Option B: Local Development**
```bash
cd text-overlay-studio
python -m http.server 8000
# เปิดเบราว์เซอร์ที่ http://localhost:8000
```

#### **Option C: GitHub Pages**
1. Push ไปยัง GitHub Repository
2. ไปที่ **Settings > Pages**
3. เลือก Source: `main` branch, folder: `/text-overlay-studio`
4. เข้าถึงผ่าน `https://username.github.io/repo-name/text-overlay-studio/`

---

## 📂 File Structure

```
text-overlay-studio/
├── index.html              # Landing Page (เลือกรูป/วิดีโอ)
├── image-overlay.html      # Image Text Overlay
├── video-overlay.html      # Video Text Overlay
├── config.js               # Configuration
├── assets/
│   ├── js/
│   │   ├── cloudinary.js  # Cloudinary API Handler
│   │   ├── n8n.js         # n8n Webhook Handler
│   │   ├── image-app.js   # Image Overlay Logic
│   │   └── video-app.js   # Video Overlay Logic
│   └── css/
│       ├── main.css       # Global Styles
│       └── mobile.css     # Mobile Optimizations
└── README.md              # This file
```

---

## 🎨 Usage

### **เพิ่มข้อความลงรูปภาพ**

1. เปิด `index.html` แล้วเลือก **🖼️ เพิ่มข้อความลงรูปภาพ**
2. อัปโหลดรูปภาพ
3. พิมพ์ข้อความที่ต้องการ
4. เลือกสไตล์:
   - ใช้ **สไตล์สำเร็จรูป** (ป้ายลดราคา, ป้ายราคา, ลายน้ำ)
   - หรือปรับแต่งเอง (Font, ขนาด, สี, พื้นหลัง)
5. เลือกตำแหน่ง:
   - แตะบนรูปภาพ
   - หรือเลือก **ตำแหน่งสำเร็จรูป**
6. *(ถ้าต้องการ)* เปิด **ข้อความโค้ง** และปรับมุม
7. กดปุ่ม **🚀 สร้างรูปภาพ**

### **เพิ่มข้อความลงวิดีโอ**

1. เปิด `index.html` แล้วเลือก **🎬 เพิ่มข้อความลงวิดีโอ**
2. อัปโหลดวิดีโอ
3. กำหนด **เวลาเริ่ม-จบ** ที่ต้องการให้ข้อความปรากฏ
4. ปรับแต่งเหมือนรูปภาพ
5. กดปุ่ม **🚀 สร้างวิดีโอ**

---

## 🔧 Configuration Options

### **config.js - Presets**

ปรับแต่ง E-commerce Presets ได้ที่ `config.js`:

```javascript
presets: {
    'sale-badge': {
        name: '🏷️ ป้ายลดราคา',
        style: {
            fontSize: 48,
            color: 'FFFFFF',
            background: 'FF6B6B',
            fontFamily: 'Kanit',
            fontWeight: 'bold',
        }
    },
    // เพิ่ม preset ใหม่ได้...
}
```

### **เพิ่ม Font ใหม่**

แก้ไข `config.js`:

```javascript
fonts: {
    thai: [
        'Mitr',
        'Kanit',
        'YourNewFont', // ⬅️ เพิ่มที่นี่
    ],
}
```

และเพิ่มใน HTML `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=YourNewFont&display=swap" rel="stylesheet">
```

---

## 📊 n8n Webhook Data Format

### **Image Overlay**

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "app_version": "1.0.0",
  "media_type": "image",
  "user_id": "user123",
  "security_code": "secret",
  "original_url": "https://res.cloudinary.com/.../original.jpg",
  "transformed_url": "https://res.cloudinary.com/.../l_text:Mitr_24:ข้อความ/image.jpg",
  "cloudinary_public_id": "text-overlay/abc123",
  "text_overlay": {
    "text": "ลด 50%",
    "position": { "x": 90, "y": 10 },
    "style": {
      "font_family": "Kanit",
      "font_size": 48,
      "color": "#FFFFFF",
      "background_color": "#FF6B6B",
      "background_opacity": 100
    },
    "effects": {
      "curved": true,
      "curve_angle": 180,
      "rotation": 0
    },
    "preset_used": "sale-badge"
  }
}
```

### **Video Overlay**

เหมือนกับ Image แต่มีเพิ่ม:

```json
{
  // ... same as image ...
  "video_settings": {
    "startTime": 2.5,
    "endTime": 10.0,
    "duration": 15.2
  }
}
```

---

## 🌐 Cloudinary Transformation Examples

### **ข้อความธรรมดา**
```
https://res.cloudinary.com/demo/image/upload/
l_text:Arial_20:Hello,co_rgb:FFFFFF,g_center/
image.jpg
```

### **ข้อความโค้ง**
```
https://res.cloudinary.com/demo/image/upload/
l_text:Kanit_48:ลด 50%,co_rgb:FFFFFF,e_distort:arc:180,g_north_east/
image.jpg
```

### **ข้อความพร้อมพื้นหลัง**
```
https://res.cloudinary.com/demo/image/upload/
l_text:Mitr_24:ราคาพิเศษ,co_rgb:000000,b_rgb:FFD700,g_south/
image.jpg
```

---

## 🐛 Troubleshooting

### **ปัญหา: อัปโหลดไม่ได้**
- ✅ ตรวจสอบว่าตั้งค่า `cloudName` และ `uploadPreset` ถูกต้อง
- ✅ Preset ต้องเป็น **Unsigned** mode
- ✅ ตรวจสอบไฟล์ไม่เกิน 50MB

### **ปัญหา: n8n ไม่ได้รับข้อมูล**
- ✅ ตรวจสอบ Webhook URL ถูกต้อง
- ✅ ตรวจสอบ n8n Workflow เปิดอยู่
- ✅ ดู Console log (F12) เพื่อหา error

### **ปัญหา: Font ไม่แสดง**
- ✅ ตรวจสอบ Google Fonts URL ใน HTML
- ✅ ตรวจสอบชื่อ Font ถูกต้อง (case-sensitive)

### **ปัญหา: ข้อความโค้งไม่โค้ง**
- ✅ ตรวจสอบว่าเปิด **Curved Text** checkbox
- ✅ ลองปรับมุม (180 = โค้งครึ่งวงกลม, 360 = วงกลมเต็ม)

---

## 🔒 Security

### **User ID & Security Code**
- ส่งผ่าน URL: `?user_id=123&security_code=secret`
- หรือกรอกในฟอร์ม

### **n8n Workflow ควรมี:**
- ✅ Validation user_id + security_code
- ✅ Rate limiting
- ✅ เก็บ log ลง Google Sheet/Database

---

## 📝 License

MIT License - ใช้งานฟรี แก้ไขได้ตามต้องการ

---

## 🙏 Credits

- **Cloudinary** - Image/Video Transformation API
- **n8n** - Workflow Automation
- **Google Fonts** - Thai & English Fonts
- **Made with ❤️** for E-commerce & Social Media Marketing

---

## 📞 Support

มีปัญหาหรือต้องการปรับแต่ง?
- เปิด Issue ใน GitHub
- หรือติดต่อผู้พัฒนา

---

**Version:** 1.0.0
**Last Updated:** 2025-01-15
