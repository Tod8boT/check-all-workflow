# Claude Code Development Folder

## 📂 What's in This Folder

This folder contains **project documentation** for Claude Code to build the Ice Cream Freezer Contract Web Form System.

```
claudecode/              ← You are here
│
├── PROJECT_BRIEF.md     ← ⭐ START HERE - Complete project spec
├── README.md            ← This file
│
└── [Claude Code will create output here]
```

---

## 🎯 Project Summary

**Goal:** Build an interactive web form for ice cream freezer contracts

**Key Features:**
- 5 different contract templates (PDF-based)
- Interactive form filling on document background
- Drawing tools, signature pad, image uploads
- Outputs 2 data formats (legacy + AI-friendly)
- Sends to n8n webhook

---

## 📁 Source Files Location

All templates and data are in: `../data file/`

**Contract PDFs (5 types):**
- 1-สาขา-รร.เปิดเอง.pdf
- 2-สาขา-ตัวแทนปิดเอง.pdf
- 3-ตัวแทน-รร.เปิดเอง.pdf
- 4-ตัวแทน-ตัวแทนปิดเอง.pdf
- 5-ร้านค้าทั่วไป.pdf

**Data Structure:**
- Data Contract - Customer Form.csv (70+ columns - legacy)
- Data Contract - data for ai agent.csv (30 columns - AI)
- mock.json (n8n workflow reference)

**Examples:**
- ตัวแทน-01.jpg, ตัวแทน-02.jpg (filled forms)

---

## 🚀 For Claude Code

### Step 1: Read Documentation
📖 Open and read **PROJECT_BRIEF.md** thoroughly

### Step 2: Analyze Source Files  
📂 Access all PDFs and CSVs in `../data file/`

### Step 3: Extract Field Positions
🔍 Analyze each PDF to identify:
- Text input positions (x, y coordinates)
- Checkbox/radio positions  
- Signature areas
- Drawing zones

### Step 4: Generate Configs
⚙️ Create:
- `config/form-templates.json` (5 template configs)
- `config/field-mappings.json` (column mappings)

### Step 5: Build Web App
💻 Create:
- `index.html` (main app)
- `css/` folder (styles)
- `js/` folder (logic)
- `assets/` folder (if needed)

### Step 6: Documentation
📝 Write:
- `README_APP.md` (setup/usage)
- `API.md` (webhook docs)

---

## 📦 Expected Output Structure

```
claudecode/
├── PROJECT_BRIEF.md          ✓ Done
├── README.md                 ✓ Done
│
├── index.html               ← Main web app
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
│   └── (optional)
│
├── README_APP.md
└── API.md
```

---

## ✅ Success Criteria

The web app must:
- [ ] Work on desktop & mobile
- [ ] Load all 5 templates correctly
- [ ] Allow form filling on PDF background
- [ ] Support drawing & signatures
- [ ] Upload 3 images (ID card, location, photo)
- [ ] Transform data to 2 formats
- [ ] Send complete payload to webhook
- [ ] Show clear user feedback

---

## 🔗 Integration Points

**n8n Webhook:** (to be configured by project owner)
**Google Sheets:** 2 sheets (legacy + AI format)
**Google Drive:** Image/PDF storage

---

## 📞 Project Info

- **Project:** Ice Cream Freezer Contract System
- **Owner:** todbot  
- **Version:** 1.0
- **Created:** 2024-11-21

---

## 🎉 Let's Build!

Everything you need is in **PROJECT_BRIEF.md**

Good luck! 🚀
