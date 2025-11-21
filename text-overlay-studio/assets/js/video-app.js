/**
 * 🎬 Video Text Overlay App (Updated with Multiple Layers + Logo + Timing)
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
    uploadedVideo: null,
    cloudinaryPublicId: null,
    cloudinaryURL: null,
    videoDuration: 0,
    logoPublicId: null,
    logoLocalURL: null,
    logoSettings: {
        width: 120,
        position: 'top-left',
        startTime: 0,
        endTime: null
    },
    textLayers: [],
    currentLayerIndex: 0,
    maxLayers: 3,
    userId: null,
    securityCode: null,
};

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const controlsSection = document.getElementById('controlsSection');
const videoPreview = document.getElementById('videoPreview');
const positionOverlay = document.getElementById('positionOverlay');
const positionMarker = document.getElementById('positionMarker');
const submitBtn = document.getElementById('submitBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Video Controls
const playBtn = document.getElementById('playBtn');
const videoTimeline = document.getElementById('videoTimeline');
const timeDisplay = document.getElementById('timeDisplay');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadUserIdFromURL();
    setupEventListeners();
    addTextLayer(); // Add first layer
}

/**
 * Load user ID from URL parameters
 */
function loadUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('user_id');
    if (userIdParam) {
        document.getElementById('userId').value = userIdParam;
        appState.userId = userIdParam;
    }
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

    // Video player controls
    playBtn.addEventListener('click', togglePlay);
    videoPreview.addEventListener('loadedmetadata', handleVideoLoaded);
    videoPreview.addEventListener('timeupdate', handleTimeUpdate);
    videoTimeline.addEventListener('input', handleTimelineSeek);

    // Logo upload
    document.getElementById('logoInput').addEventListener('change', handleLogoUpload);

    // Logo size slider
    document.getElementById('logoSize').addEventListener('input', (e) => {
        appState.logoSettings.width = parseInt(e.target.value);
        document.getElementById('logoSizeValue').textContent = e.target.value + 'px';
        updatePreview();
    });

    // Logo position buttons
    document.querySelectorAll('.logo-pos-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.logo-pos-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            appState.logoSettings.position = e.target.dataset.position;
            updatePreview();
        });
    });

    // Logo timing
    document.getElementById('logoStartTime').addEventListener('input', (e) => {
        appState.logoSettings.startTime = parseFloat(e.target.value) || 0;
    });
    document.getElementById('logoEndTime').addEventListener('input', (e) => {
        appState.logoSettings.endTime = e.target.value ? parseFloat(e.target.value) : null;
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
    if (!CONFIG.app.supportedVideoTypes.includes(file.type)) {
        alert('❌ รองรับเฉพาะไฟล์ MP4, WEBM เท่านั้น');
        return;
    }

    if (file.size > CONFIG.app.maxFileSize) {
        alert('❌ ไฟล์ใหญ่เกินไป (สูงสุด 50MB)');
        return;
    }

    appState.uploadedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        videoPreview.src = e.target.result;
        previewSection.classList.add('active');
        controlsSection.classList.add('active');
        submitBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

/**
 * Handle logo upload
 */
async function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showLoading(true);

    try {
        const result = await cloudinary.uploadImage(file);
        appState.logoPublicId = result.public_id;
        appState.logoLocalURL = result.secure_url;

        const logoPreview = document.getElementById('logoPreview');
        logoPreview.src = result.secure_url;
        logoPreview.style.display = 'block';

        document.getElementById('logoSizeGroup').style.display = 'block';
        document.getElementById('logoPositionGroup').style.display = 'block';
        document.getElementById('logoTimingGroup').style.display = 'block';

        alert('✅ อัปโหลดโลโก้สำเร็จ!');
        updatePreview();

    } catch (error) {
        console.error('Logo upload error:', error);
        alert('❌ อัปโหลดโลโก้ไม่สำเร็จ: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Handle video loaded
 */
function handleVideoLoaded() {
    appState.videoDuration = videoPreview.duration;
    videoTimeline.max = Math.floor(videoPreview.duration);
    updateTimeDisplay();

    // Update all layer end time placeholders
    document.querySelectorAll('.layer-end-time').forEach(input => {
        input.placeholder = `จบ (ว่าง = ${Math.floor(appState.videoDuration)}s)`;
    });
}

/**
 * Handle time update
 */
function handleTimeUpdate() {
    videoTimeline.value = Math.floor(videoPreview.currentTime);
    updateTimeDisplay();
}

/**
 * Handle timeline seek
 */
function handleTimelineSeek(e) {
    videoPreview.currentTime = e.target.value;
}

/**
 * Toggle play/pause
 */
function togglePlay() {
    if (videoPreview.paused) {
        videoPreview.play();
        playBtn.textContent = '⏸️';
    } else {
        videoPreview.pause();
        playBtn.textContent = '▶️';
    }
}

/**
 * Update time display
 */
function updateTimeDisplay() {
    const current = formatTime(videoPreview.currentTime);
    const duration = formatTime(appState.videoDuration);
    timeDisplay.textContent = `${current} / ${duration}`;
}

/**
 * Format time (seconds to MM:SS)
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Handle position click
 */
function handlePositionClick(e) {
    const rect = positionOverlay.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    selectPosition(Math.round(x), Math.round(y));
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
    selectPosition(Math.round(x), Math.round(y));
}

/**
 * Select position for current layer
 */
function selectPosition(x, y) {
    if (appState.textLayers[appState.currentLayerIndex]) {
        appState.textLayers[appState.currentLayerIndex].position = { x, y };

        const layerElement = document.getElementById(appState.textLayers[appState.currentLayerIndex].id);
        if (layerElement) {
            layerElement.querySelector('.layer-pos-x').value = x;
            layerElement.querySelector('.layer-pos-y').value = y;
        }

        updatePreview();
    }

    const marker = document.getElementById('positionMarker');
    if (marker) {
        marker.style.left = x + '%';
        marker.style.top = y + '%';
        marker.style.display = 'block';
    }
}

/**
 * Add text layer
 */
function addTextLayer() {
    if (appState.textLayers.length >= appState.maxLayers) {
        alert('❌ เพิ่มข้อความได้สูงสุด 3 ชั้นเท่านั้น');
        return;
    }

    const layerIndex = appState.textLayers.length;

    const layer = {
        id: `layer-${Date.now()}`,
        enabled: true,
        text: '',
        position: { x: 50, y: 50 + (layerIndex * 15) },
        fontFamily: 'Mitr',
        fontSize: 48,
        color: 'FFFFFF',
        fontWeight: 'normal',
        strokeWidth: 0,
        strokeColor: '000000',
        curved: false,
        curveAngle: 40,
        rotation: 0,
        shadow: false,
        shadowColor: '000000',
        shadowBlur: 10,
        shadowX: 3,
        shadowY: 3,
        startTime: 0,
        endTime: null
    };

    appState.textLayers.push(layer);
    appState.currentLayerIndex = layerIndex;

    createLayerUI(layer, layerIndex);
    updateAddButtonState();
}

/**
 * Create layer UI with inline advanced settings
 */
function createLayerUI(layer, index) {
    const container = document.getElementById('textLayersContainer');

    const layerDiv = document.createElement('div');
    layerDiv.className = 'text-layer';
    layerDiv.id = layer.id;
    layerDiv.innerHTML = `
        <div class="layer-header">
            <span class="layer-title">ข้อความชั้นที่ ${index + 1}</span>
            <div class="layer-controls">
                <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 12px;">
                    <input type="checkbox" class="layer-enabled" checked>
                    เปิดใช้งาน
                </label>
                ${index > 0 ? `<button class="remove-layer-btn" onclick="removeTextLayer(${index})">🗑️ ลบ</button>` : ''}
            </div>
        </div>

        <div class="control-group">
            <label>📝 ข้อความ</label>
            <textarea class="layer-text" placeholder="พิมพ์ข้อความ..." rows="2"></textarea>
        </div>

        <div class="control-group">
            <label>⏱️ เวลาแสดง (วินาที)</label>
            <div style="display: flex; gap: 12px;">
                <input type="number" class="layer-start-time" min="0" step="0.5" value="${layer.startTime}" placeholder="เริ่ม (0)" style="flex: 1;">
                <input type="number" class="layer-end-time" min="0" step="0.5" value="" placeholder="จบ (ว่าง = จบวิดีโอ)" style="flex: 1;">
            </div>
            <p style="font-size: 11px; color: #6C757D; margin-top: 4px;">💡 เช่น เริ่ม 2 จบ 6 = แสดงวินาทีที่ 2-6</p>
        </div>

        <div class="control-group">
            <label>📍 ตำแหน่ง (X, Y)</label>
            <div style="display: flex; gap: 12px;">
                <input type="number" class="layer-pos-x" min="0" max="100" value="${layer.position.x}" placeholder="X">
                <input type="number" class="layer-pos-y" min="0" max="100" value="${layer.position.y}" placeholder="Y">
            </div>
        </div>

        <!-- Inline Advanced Settings -->
        <div class="layer-advanced-toggle" onclick="toggleLayerAdvanced('${layer.id}')">
            <span>⚙️ ตั้งค่าเพิ่มเติม</span>
            <span class="toggle-icon">▼</span>
        </div>
        <div class="layer-advanced-content" id="advanced-${layer.id}">
            <div class="control-group">
                <label>🔤 ฟอนต์</label>
                <select class="layer-font">
                    <optgroup label="🇹🇭 ฟอนต์ไทย">
                        ${CONFIG.fonts.thai.map(f => `<option value="${f}" ${f === layer.fontFamily ? 'selected' : ''}>${f}</option>`).join('')}
                    </optgroup>
                    <optgroup label="🇬🇧 English">
                        ${CONFIG.fonts.english.map(f => `<option value="${f}" ${f === layer.fontFamily ? 'selected' : ''}>${f}</option>`).join('')}
                    </optgroup>
                </select>
            </div>

            <div class="control-group">
                <label>📏 ขนาด: <span class="layer-size-value">${layer.fontSize}px</span></label>
                <input type="range" class="layer-size" min="12" max="150" value="${layer.fontSize}">
            </div>

            <div class="control-group">
                <label>🎨 สีตัวอักษร</label>
                <input type="color" class="layer-color" value="#${layer.color}">
            </div>

            <div class="control-group">
                <label>💪 ความหนา</label>
                <select class="layer-weight">
                    <option value="normal" ${layer.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                    <option value="bold" ${layer.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                </select>
            </div>

            <div class="control-group">
                <label>🖍️ ขอบ (Stroke): <span class="layer-stroke-value">${layer.strokeWidth}px</span></label>
                <input type="range" class="layer-stroke" min="0" max="10" value="${layer.strokeWidth}">
            </div>

            <div class="control-group layer-stroke-color-group" style="display: ${layer.strokeWidth > 0 ? 'block' : 'none'};">
                <label>🎨 สีขอบ</label>
                <input type="color" class="layer-stroke-color" value="#${layer.strokeColor}">
            </div>

            <div class="control-group">
                <label>🔄 หมุน: <span class="layer-rotation-value">${layer.rotation}°</span></label>
                <input type="range" class="layer-rotation" min="-180" max="180" value="${layer.rotation}">
            </div>

            <div class="control-group">
                <label>💫 เงาตัวอักษร</label>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <input type="checkbox" class="layer-shadow" ${layer.shadow ? 'checked' : ''}>
                    <input type="color" class="layer-shadow-color" value="#${layer.shadowColor}" style="width: 40px; height: 30px;" ${!layer.shadow ? 'disabled' : ''}>
                    <span style="font-size: 11px;">เบลอ:</span>
                    <input type="number" class="layer-shadow-blur" min="0" max="50" value="${layer.shadowBlur}" style="width: 50px;" ${!layer.shadow ? 'disabled' : ''}>
                </div>
            </div>

            <!-- Pattern Templates -->
            <div class="control-group" style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e0e6ed;">
                <label>📋 เทมเพลตสไตล์</label>
                <select class="layer-template-select" style="margin-bottom: 8px;">
                    <option value="">-- ใช้สไตล์ที่บันทึก --</option>
                </select>
                <button class="save-template-btn" onclick="saveLayerTemplate(${index})">💾 บันทึกสไตล์นี้</button>
            </div>
        </div>
    `;

    container.appendChild(layerDiv);
    setupLayerEventListeners(layerDiv, layer, index);
    loadTemplatesIntoDropdown(layerDiv.querySelector('.layer-template-select'), index);
}

/**
 * Setup event listeners for a layer
 */
function setupLayerEventListeners(layerDiv, layer, index) {
    layerDiv.querySelector('.layer-enabled').addEventListener('change', (e) => {
        layer.enabled = e.target.checked;
        layerDiv.classList.toggle('disabled', !e.target.checked);
        updatePreview();
    });

    layerDiv.querySelector('.layer-text').addEventListener('input', (e) => {
        layer.text = e.target.value;
        updatePreview();
    });

    layerDiv.querySelector('.layer-start-time').addEventListener('input', (e) => {
        layer.startTime = parseFloat(e.target.value) || 0;
    });

    layerDiv.querySelector('.layer-end-time').addEventListener('input', (e) => {
        layer.endTime = e.target.value ? parseFloat(e.target.value) : null;
    });

    layerDiv.querySelector('.layer-pos-x').addEventListener('input', (e) => {
        layer.position.x = parseInt(e.target.value) || 0;
        updatePreview();
    });

    layerDiv.querySelector('.layer-pos-y').addEventListener('input', (e) => {
        layer.position.y = parseInt(e.target.value) || 0;
        updatePreview();
    });

    layerDiv.querySelector('.layer-font').addEventListener('change', (e) => {
        layer.fontFamily = e.target.value;
        updatePreview();
    });

    layerDiv.querySelector('.layer-size').addEventListener('input', (e) => {
        layer.fontSize = parseInt(e.target.value);
        layerDiv.querySelector('.layer-size-value').textContent = e.target.value + 'px';
        updatePreview();
    });

    layerDiv.querySelector('.layer-color').addEventListener('input', (e) => {
        layer.color = e.target.value.replace('#', '');
        updatePreview();
    });

    layerDiv.querySelector('.layer-weight').addEventListener('change', (e) => {
        layer.fontWeight = e.target.value;
        updatePreview();
    });

    layerDiv.querySelector('.layer-stroke').addEventListener('input', (e) => {
        layer.strokeWidth = parseInt(e.target.value);
        layerDiv.querySelector('.layer-stroke-value').textContent = e.target.value + 'px';
        layerDiv.querySelector('.layer-stroke-color-group').style.display = e.target.value > 0 ? 'block' : 'none';
        updatePreview();
    });

    layerDiv.querySelector('.layer-stroke-color').addEventListener('input', (e) => {
        layer.strokeColor = e.target.value.replace('#', '');
        updatePreview();
    });

    layerDiv.querySelector('.layer-rotation').addEventListener('input', (e) => {
        layer.rotation = parseInt(e.target.value) || 0;
        layerDiv.querySelector('.layer-rotation-value').textContent = e.target.value + '°';
        updatePreview();
    });

    layerDiv.querySelector('.layer-shadow').addEventListener('change', (e) => {
        layer.shadow = e.target.checked;
        const shadowInputs = layerDiv.querySelectorAll('.layer-shadow-color, .layer-shadow-blur');
        shadowInputs.forEach(input => input.disabled = !e.target.checked);
        updatePreview();
    });

    layerDiv.querySelector('.layer-shadow-color').addEventListener('input', (e) => {
        layer.shadowColor = e.target.value.replace('#', '');
        updatePreview();
    });

    layerDiv.querySelector('.layer-shadow-blur').addEventListener('input', (e) => {
        layer.shadowBlur = parseInt(e.target.value) || 0;
        updatePreview();
    });

    layerDiv.querySelector('.layer-template-select').addEventListener('change', (e) => {
        if (e.target.value) {
            applyTemplate(index, e.target.value);
            e.target.value = '';
        }
    });

    layerDiv.addEventListener('click', () => {
        appState.currentLayerIndex = index;
    });
}

/**
 * Toggle layer advanced settings
 */
function toggleLayerAdvanced(layerId) {
    const content = document.getElementById('advanced-' + layerId);
    const toggle = content.previousElementSibling;
    content.classList.toggle('active');
    toggle.classList.toggle('active');
}

/**
 * Remove text layer
 */
function removeTextLayer(index) {
    if (appState.textLayers.length <= 1) {
        alert('❌ ต้องมีข้อความอย่างน้อย 1 ชั้น');
        return;
    }

    const layer = appState.textLayers[index];
    const layerElement = document.getElementById(layer.id);
    if (layerElement) layerElement.remove();

    appState.textLayers.splice(index, 1);
    updateAddButtonState();
    updatePreview();
}

/**
 * Update add button state
 */
function updateAddButtonState() {
    const addBtn = document.getElementById('addLayerBtn');
    if (addBtn) {
        addBtn.disabled = appState.textLayers.length >= appState.maxLayers;
        addBtn.textContent = appState.textLayers.length >= appState.maxLayers
            ? '🚫 ถึงจำนวนสูงสุดแล้ว (3 ชั้น)'
            : '➕ เพิ่มข้อความ';
    }
}

/**
 * Save layer settings as template
 */
function saveLayerTemplate(index) {
    const layer = appState.textLayers[index];
    if (!layer) return;

    const name = prompt('ตั้งชื่อเทมเพลต:');
    if (!name) return;

    const templates = JSON.parse(localStorage.getItem('textTemplates') || '[]');
    templates.push({
        name: name,
        fontFamily: layer.fontFamily,
        fontSize: layer.fontSize,
        color: layer.color,
        fontWeight: layer.fontWeight,
        strokeWidth: layer.strokeWidth,
        strokeColor: layer.strokeColor,
        rotation: layer.rotation,
        shadow: layer.shadow,
        shadowColor: layer.shadowColor,
        shadowBlur: layer.shadowBlur
    });

    localStorage.setItem('textTemplates', JSON.stringify(templates));
    document.querySelectorAll('.layer-template-select').forEach((select, idx) => {
        loadTemplatesIntoDropdown(select, idx);
    });

    alert('✅ บันทึกเทมเพลต "' + name + '" แล้ว!');
}

/**
 * Load templates into dropdown
 */
function loadTemplatesIntoDropdown(select, layerIndex) {
    const templates = JSON.parse(localStorage.getItem('textTemplates') || '[]');
    select.innerHTML = '<option value="">-- ใช้สไตล์ที่บันทึก --</option>';
    templates.forEach((template, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = template.name;
        select.appendChild(option);
    });
}

/**
 * Apply template to layer
 */
function applyTemplate(layerIndex, templateIndex) {
    const templates = JSON.parse(localStorage.getItem('textTemplates') || '[]');
    const template = templates[templateIndex];
    const layer = appState.textLayers[layerIndex];

    if (!template || !layer) return;

    layer.fontFamily = template.fontFamily;
    layer.fontSize = template.fontSize;
    layer.color = template.color;
    layer.fontWeight = template.fontWeight;
    layer.strokeWidth = template.strokeWidth || 0;
    layer.strokeColor = template.strokeColor || '000000';
    layer.rotation = template.rotation || 0;
    layer.shadow = template.shadow || false;
    layer.shadowColor = template.shadowColor || '000000';
    layer.shadowBlur = template.shadowBlur || 10;

    const layerDiv = document.getElementById(layer.id);
    if (layerDiv) {
        layerDiv.querySelector('.layer-font').value = layer.fontFamily;
        layerDiv.querySelector('.layer-size').value = layer.fontSize;
        layerDiv.querySelector('.layer-size-value').textContent = layer.fontSize + 'px';
        layerDiv.querySelector('.layer-color').value = '#' + layer.color;
        layerDiv.querySelector('.layer-weight').value = layer.fontWeight;
        layerDiv.querySelector('.layer-stroke').value = layer.strokeWidth;
        layerDiv.querySelector('.layer-stroke-value').textContent = layer.strokeWidth + 'px';
        layerDiv.querySelector('.layer-stroke-color').value = '#' + layer.strokeColor;
        layerDiv.querySelector('.layer-stroke-color-group').style.display = layer.strokeWidth > 0 ? 'block' : 'none';
        layerDiv.querySelector('.layer-rotation').value = layer.rotation;
        layerDiv.querySelector('.layer-rotation-value').textContent = layer.rotation + '°';
        layerDiv.querySelector('.layer-shadow').checked = layer.shadow;
        layerDiv.querySelector('.layer-shadow-color').value = '#' + layer.shadowColor;
        layerDiv.querySelector('.layer-shadow-blur').value = layer.shadowBlur;
    }

    updatePreview();
    alert('✅ ใช้เทมเพลต "' + template.name + '" แล้ว!');
}

/**
 * Update preview - show text overlay on video
 */
function updatePreview() {
    const textOverlay = document.getElementById('textPreviewOverlay');
    if (!textOverlay) return;

    // Clear previous content
    textOverlay.innerHTML = '';

    // Show all enabled layers
    appState.textLayers.forEach(layer => {
        if (!layer.enabled || !layer.text.trim()) return;

        const textDiv = document.createElement('div');
        textDiv.style.position = 'absolute';
        textDiv.style.left = layer.position.x + '%';
        textDiv.style.top = layer.position.y + '%';
        textDiv.style.transform = `translate(-50%, -50%) rotate(${layer.rotation}deg)`;
        textDiv.style.fontFamily = layer.fontFamily + ', sans-serif';
        textDiv.style.fontSize = layer.fontSize + 'px';
        textDiv.style.color = '#' + layer.color;
        textDiv.style.fontWeight = layer.fontWeight;
        textDiv.style.whiteSpace = 'nowrap';
        textDiv.style.pointerEvents = 'none';

        if (layer.strokeWidth > 0) {
            textDiv.style.webkitTextStroke = layer.strokeWidth + 'px #' + layer.strokeColor;
        }

        if (layer.shadow) {
            textDiv.style.textShadow = `${layer.shadowBlur}px ${layer.shadowBlur}px ${layer.shadowBlur}px #${layer.shadowColor}`;
        }

        textDiv.textContent = layer.text;
        textOverlay.appendChild(textDiv);
    });

    textOverlay.style.display = appState.textLayers.some(l => l.enabled && l.text.trim()) ? 'block' : 'none';
}

/**
 * Show/hide loading
 */
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

/**
 * Handle submit - generate video with overlays
 */
async function handleSubmit() {
    if (!appState.uploadedFile) {
        alert('❌ กรุณาอัปโหลดวิดีโอก่อน');
        return;
    }

    const hasText = appState.textLayers.some(layer => layer.enabled && layer.text.trim());
    if (!hasText && !appState.logoPublicId) {
        alert('❌ กรุณากรอกข้อความอย่างน้อย 1 ชั้น หรืออัปโหลดโลโก้');
        return;
    }

    showLoading(true);
    submitBtn.disabled = true;

    try {
        // Upload video to Cloudinary
        console.log('Uploading video to Cloudinary...');
        const uploadResult = await cloudinary.uploadVideo(appState.uploadedFile);
        console.log('Upload success:', uploadResult);

        appState.cloudinaryPublicId = uploadResult.public_id;
        appState.cloudinaryURL = uploadResult.secure_url;

        // Generate URL with multiple text layers and timing
        const overlayURL = generateVideoOverlayURL(uploadResult.public_id);
        console.log('Overlay URL:', overlayURL);

        // Send to n8n
        try {
            await n8nWebhook.sendTextOverlayData({
                mediaType: 'video',
                userId: document.getElementById('userId').value || 'anonymous',
                securityCode: document.getElementById('securityCode').value || '',
                originalURL: uploadResult.secure_url,
                transformedURL: overlayURL,
                publicId: uploadResult.public_id,
                textLayers: appState.textLayers.map(layer => ({
                    text: layer.text,
                    position: layer.position,
                    enabled: layer.enabled,
                    startTime: layer.startTime,
                    endTime: layer.endTime,
                    fontSize: layer.fontSize,
                    color: layer.color,
                    fontFamily: layer.fontFamily,
                })),
                logo: appState.logoPublicId ? appState.logoSettings : null,
                videoDuration: appState.videoDuration
            });
        } catch (n8nError) {
            console.error('n8n error:', n8nError);
        }

        showLoading(false);
        alert('✅ สร้างวิดีโอสำเร็จ!\n\n🔗 เปิดวิดีโอในแท็บใหม่แล้ว');
        window.open(overlayURL, '_blank');

    } catch (error) {
        console.error('Error:', error);
        showLoading(false);
        alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    } finally {
        submitBtn.disabled = false;
    }
}

/**
 * Generate video overlay URL with multiple layers and timing
 */
function generateVideoOverlayURL(publicId) {
    const baseURL = `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/video/upload`;
    let transformations = [];

    // Add text layers with timing
    appState.textLayers.forEach(layer => {
        if (!layer.enabled || !layer.text.trim()) return;

        const encodedText = encodeURIComponent(layer.text);
        const fontName = layer.fontFamily.replace(/\s+/g, '%20');
        const color = layer.color.toUpperCase();
        const gravity = getGravityFromPosition(layer.position);

        let layerTransform = `l_text:${fontName}_${layer.fontSize}:${encodedText},co_rgb:${color},g_${gravity}`;

        // Add stroke
        if (layer.strokeWidth > 0) {
            layerTransform += `/e_outline:${layer.strokeWidth},co_rgb:${layer.strokeColor}`;
        }

        // Add timing (so_=start offset, eo_=end offset)
        if (layer.startTime > 0 || layer.endTime) {
            layerTransform += `/so_${layer.startTime}`;
            if (layer.endTime) {
                layerTransform += `,eo_${layer.endTime}`;
            }
        }

        layerTransform += '/fl_layer_apply';
        transformations.push(layerTransform);
    });

    // Add logo with timing
    if (appState.logoPublicId) {
        const logoGravity = getLogoGravity(appState.logoSettings.position);
        let logoTransform = `l_${appState.logoPublicId.replace(/\//g, ':')},w_${appState.logoSettings.width},g_${logoGravity}`;

        if (appState.logoSettings.startTime > 0 || appState.logoSettings.endTime) {
            logoTransform += `/so_${appState.logoSettings.startTime}`;
            if (appState.logoSettings.endTime) {
                logoTransform += `,eo_${appState.logoSettings.endTime}`;
            }
        }

        logoTransform += '/fl_layer_apply';
        transformations.push(logoTransform);
    }

    const transformString = transformations.join('/');
    return `${baseURL}/${transformString}/${publicId}.mp4`;
}

/**
 * Get gravity from position percentage
 */
function getGravityFromPosition(position) {
    const { x, y } = position;

    if (y <= 33) {
        if (x <= 33) return 'north_west';
        if (x >= 67) return 'north_east';
        return 'north';
    } else if (y >= 67) {
        if (x <= 33) return 'south_west';
        if (x >= 67) return 'south_east';
        return 'south';
    } else {
        if (x <= 33) return 'west';
        if (x >= 67) return 'east';
        return 'center';
    }
}

/**
 * Get logo gravity from position name
 */
function getLogoGravity(position) {
    const gravityMap = {
        'top-left': 'north_west',
        'top-center': 'north',
        'top-right': 'north_east',
        'center-left': 'west',
        'center': 'center',
        'center-right': 'east',
        'bottom-left': 'south_west',
        'bottom-center': 'south',
        'bottom-right': 'south_east'
    };
    return gravityMap[position] || 'north_west';
}

/**
 * Toggle collapsible section
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const header = section.previousElementSibling;
    section.classList.toggle('active');
    header.classList.toggle('active');
}

// Make functions global
window.addTextLayer = addTextLayer;
window.removeTextLayer = removeTextLayer;
window.toggleLayerAdvanced = toggleLayerAdvanced;
window.saveLayerTemplate = saveLayerTemplate;
window.toggleSection = toggleSection;
