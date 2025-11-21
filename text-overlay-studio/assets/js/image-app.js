/**
 * 🖼️ Image Text Overlay App
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
        curved: false,
        curveAngle: 180,
        rotation: 0,
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
    // Load user ID from URL
    loadUserIdFromURL();

    // Setup font options
    populateFontSelect();

    // Setup presets
    populatePresets();

    // Setup position presets
    populatePositionPresets();

    // Setup event listeners
    setupEventListeners();
}

/**
 * Load user ID from URL parameters
 */
function loadUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('user_id');
    if (userIdParam) {
        userId.value = userIdParam;
        appState.userId = userIdParam;
    }
}

/**
 * Populate font select dropdown
 */
function populateFontSelect() {
    // Thai fonts
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

    // English fonts
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

    // Set default
    fontSelect.value = 'Mitr';
}

/**
 * Populate style presets
 */
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

/**
 * Populate position presets
 */
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

/**
 * Setup all event listeners
 */
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
    textInput.addEventListener('input', updatePreview);

    // Font controls
    fontSelect.addEventListener('change', updatePreview);
    fontSize.addEventListener('input', (e) => {
        fontSizeValue.textContent = e.target.value + 'px';
        appState.currentSettings.fontSize = parseInt(e.target.value);
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

    // Opacity control
    bgOpacity.addEventListener('input', (e) => {
        bgOpacityValue.textContent = e.target.value + '%';
        appState.currentSettings.bgOpacity = parseInt(e.target.value);
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

/**
 * Handle drag over
 */
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

/**
 * Handle drag leave
 */
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

/**
 * Handle file drop
 */
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * Handle file select
 */
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * Handle file upload
 */
function handleFile(file) {
    // Validate file
    if (!CONFIG.app.supportedImageTypes.includes(file.type)) {
        alert('❌ รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น');
        return;
    }

    if (file.size > CONFIG.app.maxFileSize) {
        alert('❌ ไฟล์ใหญ่เกินไป (สูงสุด 50MB)');
        return;
    }

    // Store file
    appState.uploadedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        previewSection.classList.add('active');
        controlsSection.classList.add('active');
        submitBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

/**
 * Handle position click
 */
function handlePositionClick(e) {
    const rect = positionOverlay.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition(x, y);
}

/**
 * Handle position touch
 */
function handlePositionTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = positionOverlay.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setPosition(x, y);
}

/**
 * Set position
 */
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

/**
 * Update position marker
 */
function updatePositionMarker() {
    const { x, y } = appState.currentSettings.position;
    positionMarker.style.left = x + '%';
    positionMarker.style.top = y + '%';
    positionMarker.style.display = 'block';
}

/**
 * Apply preset
 */
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
 * Update preview (visual feedback only - not generating Cloudinary URL yet)
 */
function updatePreview() {
    // Update text from input
    appState.currentSettings.text = textInput.value;
    appState.currentSettings.fontFamily = fontSelect.value;

    // This is just a visual preview
    // Actual Cloudinary URL will be generated on submit
    console.log('Preview updated:', appState.currentSettings);
}

/**
 * Handle submit
 */
async function handleSubmit() {
    // Validate
    if (!appState.uploadedFile) {
        alert('❌ กรุณาอัปโหลดรูปภาพก่อน');
        return;
    }

    if (!textInput.value.trim()) {
        alert('❌ กรุณาใส่ข้อความ');
        return;
    }

    // Show loading
    loadingOverlay.classList.add('active');
    submitBtn.disabled = true;

    try {
        // Step 1: Upload to Cloudinary
        console.log('Uploading to Cloudinary...');
        const uploadResult = await cloudinary.uploadImage(appState.uploadedFile);
        console.log('Upload success:', uploadResult);

        appState.uploadedImage = uploadResult;

        // Step 2: Generate text overlay URL
        console.log('Generating overlay URL...');
        const overlayURL = cloudinary.generateTextOverlayURL(
            uploadResult.public_id,
            appState.currentSettings
        );
        console.log('Overlay URL:', overlayURL);

        // Step 3: Send to n8n
        console.log('Sending to n8n...');
        const webhookData = {
            mediaType: 'image',
            userId: userId.value || 'anonymous',
            securityCode: securityCode.value || '',
            originalURL: uploadResult.secure_url,
            transformedURL: overlayURL,
            publicId: uploadResult.public_id,
            text: appState.currentSettings.text,
            position: appState.currentSettings.position,
            fontFamily: appState.currentSettings.fontFamily,
            fontSize: appState.currentSettings.fontSize,
            color: appState.currentSettings.color,
            backgroundColor: appState.currentSettings.backgroundColor,
            bgOpacity: appState.currentSettings.bgOpacity,
            curved: appState.currentSettings.curved,
            curveAngle: appState.currentSettings.curveAngle,
            rotation: appState.currentSettings.rotation,
            presetUsed: appState.selectedPreset,
        };

        const n8nResult = await n8nWebhook.sendTextOverlayData(webhookData);
        console.log('n8n result:', n8nResult);

        // Success
        loadingOverlay.classList.remove('active');
        alert('✅ สร้างรูปภาพสำเร็จ!\n\nURL: ' + overlayURL);

        // Open result in new tab
        window.open(overlayURL, '_blank');

    } catch (error) {
        console.error('Error:', error);
        loadingOverlay.classList.remove('active');
        alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    } finally {
        submitBtn.disabled = false;
    }
}
