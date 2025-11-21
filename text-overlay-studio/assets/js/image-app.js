/**
 * 🖼️ Image Text Overlay App (Updated with new features)
 * Main logic for image text overlay page
 */

// Initialize APIs
const cloudinary = new CloudinaryAPI(
    CONFIG.cloudinary.cloudName,
    CONFIG.cloudinary.uploadPreset
);
const n8nWebhook = new N8NWebhook(CONFIG.n8n.webhookURL);

// App State
const appState = {
    uploadedFile: null,
    uploadedImage: null,
    currentSettings: {
        text: '',
        position: { x: 50, y: 50 },
        fontFamily: 'Mitr',
        fontSize: 24,
        color: '#FFFFFF',
        backgroundColor: '#000000',
        bgOpacity: 100,
        fontWeight: 'normal',
        textAlign: 'center',
        strokeWidth: 0,
        strokeColor: '#000000',
        shadow: false,
        shadowBlur: 10,
        shadowColor: '#000000',
        shadowX: 5,
        shadowY: 5,
        letterSpacing: 0,
        rotation: 0,
        curved: false,
        curveAngle: 180,
    },
    selectedPreset: null,
    userId: null,
    securityCode: null,
};

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const controlsSection = document.getElementById('controlsSection');
const imagePreview = document.getElementById('imagePreview');
const positionOverlay = document.getElementById('positionOverlay');
const positionMarker = document.getElementById('positionMarker');
const textPreviewOverlay = document.getElementById('textPreviewOverlay');
const submitBtn = document.getElementById('submitBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Form Controls
const textInput = document.getElementById('textInput');
const fontSelect = document.getElementById('fontSelect');
const fontSize = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const textColor = document.getElementById('textColor');
const textColorHex = document.getElementById('textColorHex');
const bgColor = document.getElementById('bgColor');
const bgColorHex = document.getElementById('bgColorHex');
const bgOpacity = document.getElementById('bgOpacity');
const bgOpacityValue = document.getElementById('bgOpacityValue');

// New Controls
const fontWeight = document.getElementById('fontWeight');
const textAlign = document.getElementById('textAlign');
const strokeWidth = document.getElementById('strokeWidth');
const strokeWidthValue = document.getElementById('strokeWidthValue');
const strokeColor = document.getElementById('strokeColor');
const strokeColorHex = document.getElementById('strokeColorHex');
const strokeColorGroup = document.getElementById('strokeColorGroup');
const textShadow = document.getElementById('textShadow');
const shadowSettings = document.getElementById('shadowSettings');
const shadowBlur = document.getElementById('shadowBlur');
const shadowBlurValue = document.getElementById('shadowBlurValue');
const shadowColor = document.getElementById('shadowColor');
const shadowColorHex = document.getElementById('shadowColorHex');
const shadowX = document.getElementById('shadowX');
const shadowY = document.getElementById('shadowY');
const letterSpacing = document.getElementById('letterSpacing');
const letterSpacingValue = document.getElementById('letterSpacingValue');
const textRotation = document.getElementById('textRotation');
const textRotationValue = document.getElementById('textRotationValue');

const curvedText = document.getElementById('curvedText');
const curveAngle = document.getElementById('curveAngle');
const curveAngleValue = document.getElementById('curveAngleValue');
const curveAngleGroup = document.getElementById('curveAngleGroup');
const posX = document.getElementById('posX');
const posY = document.getElementById('posY');
const userId = document.getElementById('userId');
const securityCode = document.getElementById('securityCode');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadUserIdFromURL();
    populateFontSelect();
    populatePresets();
    populatePositionPresets();
    setupEventListeners();
}

function loadUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('user_id');
    if (userIdParam) {
        userId.value = userIdParam;
        appState.userId = userIdParam;
    }
}

function populateFontSelect() {
    const thaiFonts = CONFIG.fonts.thai;
    const thaiGroup = document.createElement('optgroup');
    thaiGroup.label = 'ฟอนต์ไทย';
    thaiFonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        option.style.fontFamily = `'${font}', sans-serif`;
        thaiGroup.appendChild(option);
    });

    const englishFonts = CONFIG.fonts.english;
    const englishGroup = document.createElement('optgroup');
    englishGroup.label = 'English Fonts';
    englishFonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        option.style.fontFamily = `'${font}', sans-serif`;
        englishGroup.appendChild(option);
    });

    fontSelect.appendChild(thaiGroup);
    fontSelect.appendChild(englishGroup);
    fontSelect.value = 'Mitr';
}

function populatePresets() {
    const presetGrid = document.getElementById('presetGrid');
    presetGrid.innerHTML = '';

    Object.keys(CONFIG.presets).forEach(presetKey => {
        const preset = CONFIG.presets[presetKey];
        const card = document.createElement('div');
        card.className = 'preset-card';
        card.dataset.preset = presetKey;
        card.innerHTML = `
            <div class="preset-icon">${preset.name.split(' ')[0]}</div>
            <div class="preset-name">${preset.name.split(' ').slice(1).join(' ')}</div>
        `;
        card.addEventListener('click', () => applyPreset(presetKey));
        presetGrid.appendChild(card);
    });
}

function populatePositionPresets() {
    const positionGrid = document.getElementById('positionGrid');
    positionGrid.innerHTML = '';

    Object.keys(CONFIG.positions).forEach(posKey => {
        const pos = CONFIG.positions[posKey];
        const btn = document.createElement('button');
        btn.className = 'position-btn';
        btn.dataset.position = posKey;
        btn.textContent = pos.label;
        btn.addEventListener('click', () => setPosition(pos.x, pos.y));
        positionGrid.appendChild(btn);
    });
}

function setupEventListeners() {
    // Upload area
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // Position overlay
    positionOverlay.addEventListener('click', handlePositionClick);
    positionOverlay.addEventListener('touchstart', handlePositionTouch, { passive: false });

    // Text input
    textInput.addEventListener('input', () => {
        appState.currentSettings.text = textInput.value;
        updatePreview();
    });

    // Font controls
    fontSelect.addEventListener('change', () => {
        appState.currentSettings.fontFamily = fontSelect.value;
        updatePreview();
    });

    fontSize.addEventListener('input', (e) => {
        fontSizeValue.textContent = e.target.value + 'px';
        appState.currentSettings.fontSize = parseInt(e.target.value);
        updatePreview();
    });

    fontWeight.addEventListener('change', () => {
        appState.currentSettings.fontWeight = fontWeight.value;
        updatePreview();
    });

    textAlign.addEventListener('change', () => {
        appState.currentSettings.textAlign = textAlign.value;
        updatePreview();
    });

    // Color controls
    textColor.addEventListener('input', (e) => {
        textColorHex.value = e.target.value;
        appState.currentSettings.color = e.target.value;
        updatePreview();
    });

    textColorHex.addEventListener('input', (e) => {
        textColor.value = e.target.value;
        appState.currentSettings.color = e.target.value;
        updatePreview();
    });

    bgColor.addEventListener('input', (e) => {
        bgColorHex.value = e.target.value;
        appState.currentSettings.backgroundColor = e.target.value;
        updatePreview();
    });

    bgColorHex.addEventListener('input', (e) => {
        if (e.target.value === 'transparent') {
            appState.currentSettings.backgroundColor = 'transparent';
        } else {
            bgColor.value = e.target.value;
            appState.currentSettings.backgroundColor = e.target.value;
        }
        updatePreview();
    });

    bgOpacity.addEventListener('input', (e) => {
        bgOpacityValue.textContent = e.target.value + '%';
        appState.currentSettings.bgOpacity = parseInt(e.target.value);
        updatePreview();
    });

    // Stroke controls
    strokeWidth.addEventListener('input', (e) => {
        strokeWidthValue.textContent = e.target.value + 'px';
        appState.currentSettings.strokeWidth = parseInt(e.target.value);
        strokeColorGroup.style.display = parseInt(e.target.value) > 0 ? 'block' : 'none';
        updatePreview();
    });

    strokeColor.addEventListener('input', (e) => {
        strokeColorHex.value = e.target.value;
        appState.currentSettings.strokeColor = e.target.value;
        updatePreview();
    });

    strokeColorHex.addEventListener('input', (e) => {
        strokeColor.value = e.target.value;
        appState.currentSettings.strokeColor = e.target.value;
        updatePreview();
    });

    // Shadow controls
    textShadow.addEventListener('change', (e) => {
        appState.currentSettings.shadow = e.target.checked;
        shadowSettings.style.display = e.target.checked ? 'block' : 'none';
        updatePreview();
    });

    shadowBlur.addEventListener('input', (e) => {
        shadowBlurValue.textContent = e.target.value + 'px';
        appState.currentSettings.shadowBlur = parseInt(e.target.value);
        updatePreview();
    });

    shadowColor.addEventListener('input', (e) => {
        shadowColorHex.value = e.target.value;
        appState.currentSettings.shadowColor = e.target.value;
        updatePreview();
    });

    shadowColorHex.addEventListener('input', (e) => {
        shadowColor.value = e.target.value;
        appState.currentSettings.shadowColor = e.target.value;
        updatePreview();
    });

    shadowX.addEventListener('input', (e) => {
        appState.currentSettings.shadowX = parseInt(e.target.value);
        updatePreview();
    });

    shadowY.addEventListener('input', (e) => {
        appState.currentSettings.shadowY = parseInt(e.target.value);
        updatePreview();
    });

    // Letter spacing
    letterSpacing.addEventListener('input', (e) => {
        letterSpacingValue.textContent = e.target.value;
        appState.currentSettings.letterSpacing = parseInt(e.target.value);
        updatePreview();
    });

    // Rotation
    textRotation.addEventListener('input', (e) => {
        textRotationValue.textContent = e.target.value + '°';
        appState.currentSettings.rotation = parseInt(e.target.value);
        updatePreview();
    });

    // Curved text
    curvedText.addEventListener('change', (e) => {
        appState.currentSettings.curved = e.target.checked;
        curveAngleGroup.style.display = e.target.checked ? 'block' : 'none';
        updatePreview();
    });

    curveAngle.addEventListener('input', (e) => {
        curveAngleValue.textContent = e.target.value + '°';
        appState.currentSettings.curveAngle = parseInt(e.target.value);
        updatePreview();
    });

    // Position inputs
    posX.addEventListener('input', (e) => {
        appState.currentSettings.position.x = parseInt(e.target.value) || 50;
        updatePositionMarker();
        updatePreview();
    });

    posY.addEventListener('input', (e) => {
        appState.currentSettings.position.y = parseInt(e.target.value) || 50;
        updatePositionMarker();
        updatePreview();
    });

    // Submit button
    submitBtn.addEventListener('click', handleSubmit);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    if (!CONFIG.app.supportedImageTypes.includes(file.type)) {
        alert('❌ รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น');
        return;
    }

    if (file.size > CONFIG.app.maxFileSize) {
        alert('❌ ไฟล์ใหญ่เกินไป (สูงสุด 50MB)');
        return;
    }

    appState.uploadedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        previewSection.classList.add('active');
        controlsSection.classList.add('active');
        submitBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

function handlePositionClick(e) {
    const rect = positionOverlay.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition(x, y);
}

function handlePositionTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = positionOverlay.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setPosition(x, y);
}

function setPosition(x, y) {
    appState.currentSettings.position = {
        x: Math.round(x),
        y: Math.round(y)
    };
    posX.value = Math.round(x);
    posY.value = Math.round(y);
    updatePositionMarker();
    updatePreview();
}

function updatePositionMarker() {
    const { x, y } = appState.currentSettings.position;
    positionMarker.style.left = x + '%';
    positionMarker.style.top = y + '%';
    positionMarker.style.display = 'block';
}

function applyPreset(presetKey) {
    const preset = CONFIG.presets[presetKey];
    appState.selectedPreset = presetKey;

    // Update UI
    fontSelect.value = preset.style.fontFamily;
    fontSize.value = preset.style.fontSize;
    fontSizeValue.textContent = preset.style.fontSize + 'px';
    textColor.value = '#' + preset.style.color;
    textColorHex.value = '#' + preset.style.color;

    if (preset.style.background !== 'transparent') {
        bgColor.value = '#' + preset.style.background;
        bgColorHex.value = '#' + preset.style.background;
    } else {
        bgColorHex.value = 'transparent';
    }

    if (preset.style.opacity) {
        bgOpacity.value = preset.style.opacity;
        bgOpacityValue.textContent = preset.style.opacity + '%';
    }

    // Update state
    appState.currentSettings.fontFamily = preset.style.fontFamily;
    appState.currentSettings.fontSize = preset.style.fontSize;
    appState.currentSettings.color = '#' + preset.style.color;
    appState.currentSettings.backgroundColor = preset.style.background === 'transparent' ? 'transparent' : '#' + preset.style.background;
    appState.currentSettings.bgOpacity = preset.style.opacity || 100;

    // Highlight selected preset
    document.querySelectorAll('.preset-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-preset="${presetKey}"]`).classList.add('active');

    updatePreview();
}

/**
 * Real-time preview overlay on image
 */
function updatePreview() {
    const settings = appState.currentSettings;

    // Only show if there's text
    if (!settings.text) {
        textPreviewOverlay.style.display = 'none';
        return;
    }

    textPreviewOverlay.style.display = 'block';
    textPreviewOverlay.textContent = settings.text;

    // Position
    textPreviewOverlay.style.left = settings.position.x + '%';
    textPreviewOverlay.style.top = settings.position.y + '%';
    textPreviewOverlay.style.transform = `translate(-50%, -50%) rotate(${settings.rotation}deg)`;

    // Font
    textPreviewOverlay.style.fontFamily = `'${settings.fontFamily}', sans-serif`;
    textPreviewOverlay.style.fontSize = settings.fontSize + 'px';
    textPreviewOverlay.style.fontWeight = settings.fontWeight;
    textPreviewOverlay.style.textAlign = settings.textAlign;
    textPreviewOverlay.style.letterSpacing = settings.letterSpacing + 'px';

    // Colors
    textPreviewOverlay.style.color = settings.color;

    if (settings.backgroundColor !== 'transparent') {
        const bgOpacity = settings.bgOpacity / 100;
        const bgColor = settings.backgroundColor;
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);
        textPreviewOverlay.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${bgOpacity})`;
        textPreviewOverlay.style.padding = '8px 16px';
        textPreviewOverlay.style.borderRadius = '4px';
    } else {
        textPreviewOverlay.style.backgroundColor = 'transparent';
        textPreviewOverlay.style.padding = '0';
    }

    // Stroke
    if (settings.strokeWidth > 0) {
        textPreviewOverlay.style.webkitTextStroke = `${settings.strokeWidth}px ${settings.strokeColor}`;
        textPreviewOverlay.style.textStroke = `${settings.strokeWidth}px ${settings.strokeColor}`;
    } else {
        textPreviewOverlay.style.webkitTextStroke = 'none';
        textPreviewOverlay.style.textStroke = 'none';
    }

    // Shadow
    if (settings.shadow) {
        textPreviewOverlay.style.textShadow = `${settings.shadowX}px ${settings.shadowY}px ${settings.shadowBlur}px ${settings.shadowColor}`;
    } else {
        textPreviewOverlay.style.textShadow = 'none';
    }

    console.log('Preview updated:', settings);
}

async function handleSubmit() {
    if (!appState.uploadedFile) {
        alert('❌ กรุณาอัปโหลดรูปภาพก่อน');
        return;
    }

    if (!textInput.value.trim()) {
        alert('❌ กรุณาใส่ข้อความ');
        return;
    }

    loadingOverlay.classList.add('active');
    submitBtn.disabled = true;

    try {
        console.log('Uploading to Cloudinary...');
        const uploadResult = await cloudinary.uploadImage(appState.uploadedFile);
        console.log('Upload success:', uploadResult);

        appState.uploadedImage = uploadResult;

        console.log('Generating overlay URL...');
        const overlayURL = cloudinary.generateTextOverlayURL(
            uploadResult.public_id,
            appState.currentSettings
        );
        console.log('Overlay URL:', overlayURL);

        console.log('Sending to n8n...');
        const webhookData = {
            mediaType: 'image',
            userId: userId.value || 'anonymous',
            securityCode: securityCode.value || '',
            originalURL: uploadResult.secure_url,
            transformedURL: overlayURL,
            publicId: uploadResult.public_id,
            ...appState.currentSettings,
            presetUsed: appState.selectedPreset,
        };

        const n8nResult = await n8nWebhook.sendTextOverlayData(webhookData);
        console.log('n8n result:', n8nResult);

        loadingOverlay.classList.remove('active');
        alert('✅ สร้างรูปภาพสำเร็จ!\n\nURL: ' + overlayURL);

        window.open(overlayURL, '_blank');

    } catch (error) {
        console.error('Error:', error);
        loadingOverlay.classList.remove('active');
        alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    } finally {
        submitBtn.disabled = false;
    }
}
