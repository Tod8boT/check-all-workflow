# 🧊 Ice Cream Freezer Contract Web Form System

## 📖 Project Overview

สร้างระบบ Web Form สำหรับทำสัญญาวางตู้แช่ไอศครีม ที่ทำงานแบบ interactive form มีการกรอกข้อมูลลงบนเอกสารจริง พร้อมระบบเซ็นชื่อดิจิทัล และอัพโหลดเอกสารประกอบ

---

## 🎯 Core Requirements

### 1. Interactive PDF-like Web Form
- แสดงเอกสารสัญญาแบบภาพจริง
- กรอกข้อมูลลงในจุดไข่ปลา (...........) 
- วงกลม ☐ checkbox/radio
- ติ๊กถูก ✓ ขีดฆ่า ✗
- Freehand drawing
- Canvas เซ็นชื่อ
- อัพโหลดรูป 3 ประเภท

### 2. Multi-Template System (5 types)
1. สาขา-รร.เปิดเอง
2. สาขา-ตัวแทนปิดเอง
3. ตัวแทน-รร.เปิดเอง
4. ตัวแทน-ตัวแทนปิดเอง
5. ร้านค้าทั่วไป

### 3. Dual Output Format
- **Legacy:** 70+ columns (Customer Form.csv)
- **AI-friendly:** 30 columns (data for ai agent.csv)

---

## 📁 Source Files (in ../data file/)

### PDFs (5 files)
```
1-สาขา-รร.เปิดเอง.pdf
2-สาขา-ตัวแทนปิดเอง.pdf
3-ตัวแทน-รร.เปิดเอง.pdf
4-ตัวแทน-ตัวแทนปิดเอง.pdf
5-ร้านค้าทั่วไป.pdf
```

### Data Structure (CSVs)
- `Data Contract - Customer Form.csv` (Legacy)
- `Data Contract - data for ai agent.csv` (AI)
- `mock.json` (n8n workflow)

### Examples
- `ตัวแทน-01.jpg`, `ตัวแทน-02.jpg`

---

## 🏗️ System Architecture

```
Web Form (HTML/CSS/JS)
    ↓
Form Components:
- Template Selector (dropdown)
- Dynamic Fields (overlays)
- Canvas Drawing
- Signature Pad
- Image Upload (3 slots)
    ↓
Data Transformer
├─→ Legacy Format (70+ cols)
└─→ AI Format (30 cols)
    ↓
n8n Webhook
├─→ Google Sheets (2)
└─→ Google Drive
```

---

## 🎨 UI Components

### Template Selector
```html
<select id="template">
  <option value="1">1-สาขา-รร.เปิดเอง</option>
  <option value="2">2-สาขา-ตัวแทนปิดเอง</option>
  <option value="3">3-ตัวแทน-รร.เปิดเอง</option>
  <option value="4">4-ตัวแทน-ตัวแทนปิดเอง</option>
  <option value="5">5-ร้านค้าทั่วไป</option>
</select>
```

### Form Canvas
- **Background:** PDF as image
- **Overlays:** Positioned input fields
- **Elements:**
  - Text inputs (transparent bg)
  - Date pickers (Thai Buddhist calendar: CE + 543)
  - Dropdowns
  - Custom checkboxes (circles)

### Drawing Tools
```javascript
const tools = {
  pen: 'freehand',
  circle: 'shape',
  check: 'symbol ✓',
  cross: 'symbol ✗',
  eraser: 'erase'
};
```

### Signature Pad
- Canvas-based
- Clear button
- Blue stroke (#0066cc)
- Export PNG

### Image Uploads
```javascript
const uploads = [
  {id: 'id_card', label: 'บัตรประชาชน', required: true},
  {id: 'location', label: 'รูปสถานที่', required: true},
  {id: 'photo', label: 'ภาพประกอบ', required: false}
];
```

---

## 📋 Field Config Format

```json
{
  "template_id": "1-สาขา-รร.เปิดเอง",
  "fields": [
    {
      "id": "date",
      "type": "text",
      "label": "วันที่",
      "position": {"x": 450, "y": 150, "w": 60, "h": 25},
      "validation": {"required": true, "type": "number", "min": 1, "max": 31},
      "mapping": {
        "legacy": "วันที่",
        "ai": "date"
      }
    }
  ],
  "checkboxes": [...],
  "signatures": [...],
  "drawing_zones": [...]
}
```

---

## 🔄 Data Flow

```
User Input
  ↓
Validation
  ↓
Transform
├─→ Legacy (70+ cols)
└─→ AI (30 cols)
  ↓
Add Images (base64)
  ↓
Add Signature (base64)
  ↓
POST to Webhook
  ↓
Success/Error
```

### Webhook Payload Example

```json
{
  "template": "1-สาขา-รร.เปิดเอง",
  "timestamp": "2024-11-21T10:30:00Z",
  "data_legacy": {
    "วันที่": "21",
    "เดือนปัจจุบัน": "พฤศจิกายน",
    "พุทธศักราช": "2568",
    "ชื่อลูกค้าเปิดตู้ นามสกุล": "นายมานะ...",
    ...
  },
  "data_ai": {
    "date": "2024-11-21",
    "Customer-name": "นายมานะ...",
    ...
  },
  "images": [
    {"type": "id_card", "base64": "..."},
    {"type": "location", "base64": "..."},
    {"type": "photo", "base64": "..."}
  ],
  "signature": {"base64": "..."}
}
```

---

## 🛠️ Tech Stack

### Frontend
- HTML5 + CSS3 + JavaScript
- Canvas API
- Optional: React, Tailwind

### Libraries
```javascript
import SignaturePad from 'signature_pad';
import Datepicker from 'vanillajs-datepicker';
import Dropzone from 'dropzone';
```

---

## 📦 Expected Deliverables

```
claudecode/
├── index.html
├── css/
│   ├── main.css
│   ├── form.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── form-renderer.js
│   ├── data-transformer.js
│   ├── signature.js
│   ├── upload.js
│   └── api.js
├── config/
│   ├── form-templates.json
│   └── field-mappings.json
├── assets/
└── README_APP.md
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

---

## 🔗 Integration

### n8n Workflow
```
Webhook
  ↓
Validate
  ↓
Google Sheets (Legacy)
  ↓
Google Sheets (AI)
  ↓
Process Images
  ↓
Google Drive Upload
  ↓
Response
```

### Google Sheets
- **Sheet 1:** Customer Form (70+ columns)
- **Sheet 2:** AI Agent Data (30 columns)

### Google Drive
```
Contracts/
└── 2024/
    └── 11-November/
        └── Customer_Name_20241121/
            ├── id_card.jpg
            ├── location.jpg
            ├── photo.jpg
            ├── signature.png
            └── contract.pdf
```

---

## ✅ Success Criteria

- [ ] Select template (5 options)
- [ ] Fields render at correct positions
- [ ] Text input on dotted lines
- [ ] Checkboxes styled as circles
- [ ] Drawing tools work
- [ ] Signature captures
- [ ] Image upload (3 slots)
- [ ] Preview works
- [ ] Data transforms correctly
- [ ] Webhook sends successfully
- [ ] Mobile responsive

---

## 🧪 Testing

### Unit Tests
- Data transformation
- Field validation
- Date formatting (Thai)
- File upload validation

### UI Tests
- All 5 templates render
- Fields align with PDF
- Drawing works
- Signature saves
- Image preview

### Browser Tests
- Chrome (desktop/mobile)
- Firefox
- Safari
- Edge

---

## 🐛 Known Challenges

### PDF Coordinate Mapping
- Use percentage-based positioning
- Scale based on viewport

### Thai Font Rendering
- Include Thai fonts (Sarabun)
- Fallback: Tahoma, sans-serif

### Large Image Upload
- Compress before encoding
- Max 2MB per file

### Mobile Drawing
- Use unified pointer events
- Increase touch targets
- Add zoom for precision

---

## 📚 Resources

### Thai Calendar
- พ.ศ. = ค.ศ. + 543
- Example: 2024 CE = 2567 BE

### Thai Months
```javascript
const months = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];
```

### Format Patterns
- **ID Card:** X-XXXX-XXXXX-XX-X (13 digits)
- **Phone:** XXX-XXX-XXXX (10 digits)
- **Bank Account:** Variable length, numbers only

---

## 📞 Support

### What You Need to Know

1. **Design:** Form = paper document
2. **Data:** No data loss during transformation
3. **Performance:** Fast load, smooth drawing (60fps)
4. **Accessibility:** Keyboard nav, screen reader support

### Before Starting

Confirm with project owner:
1. n8n Webhook URL
2. Google Sheets IDs (2 sheets)
3. Hosting preference
4. Domain (if any)

---

## 🎉 Final Notes

This system will:
- Replace manual form filling
- Standardize data collection
- Enable AI customer tracking
- Improve workflow efficiency

**Version:** 1.0  
**Created:** 2024-11-21  
**Owner:** todbot

Good luck! 🚀
