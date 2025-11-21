/**
 * 🖼️ Image Text Overlay Application (Updated with Multiple Layers + Logo)
 */

// Application State
const appState = {
    uploadedFile: null,
    cloudinaryPublicId: null,
    cloudinaryURL: null,
    logoPublicId: null,
    logoSettings: {
        width: 120,
        position: 'top-left'
    },
    textLayers: [],
    currentLayerIndex: 0,
    maxLayers: 3,
};

// Initialize Cloudinary API
let cloudinaryAPI;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize Cloudinary
    cloudinaryAPI = new CloudinaryAPI(CONFIG.cloudinary.cloudName, CONFIG.cloudinary.uploadPreset);

    // Load presets into dropdown
    loadPresetsDropdown();

    // Load fonts
    loadFonts();

    // Load position presets
    loadPositionPresets();

    // Setup event listeners
    setupEventListeners();

    // Load user info from URL
    loadUserInfo();

    // Add first text layer
    addTextLayer();
}

/**
 * Load presets into dropdown
 */
function loadPresetsDropdown() {
    const presetSelect = document.getElementById('presetSelect');

    Object.keys(CONFIG.presets).forEach(key => {
        const preset = CONFIG.presets[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = preset.name;
        presetSelect.appendChild(option);
    });

    // Handle preset selection
    presetSelect.addEventListener('change', (e) => {
        if (e.target.value && appState.textLayers[appState.currentLayerIndex]) {
            applyPresetToCurrentLayer(e.target.value);
        }
    });
}

/**
 * Apply preset to current layer
 */
function applyPresetToCurrentLayer(presetKey) {
    const preset = CONFIG.presets[presetKey];
    const layer = appState.textLayers[appState.currentLayerIndex];

    if (!layer || !preset) return;

    // Apply preset styles
    layer.fontSize = preset.style.fontSize || 24;
    layer.color = preset.style.color || 'FFFFFF';
    layer.fontFamily = preset.style.fontFamily || 'Mitr';
    layer.fontWeight = preset.style.fontWeight || 'normal';

    // Update UI
    updateLayerUI(appState.currentLayerIndex);

    alert(`✅ นำสไตล์ "${preset.name}" ไปใช้กับข้อความชั้นที่ ${appState.currentLayerIndex + 1} แล้ว`);
}

/**
 * Load fonts
 */
function loadFonts() {
    const fontSelect = document.getElementById('fontSelect');

    // Thai fonts
    const thaiGroup = document.createElement('optgroup');
    thaiGroup.label = '🇹🇭 ฟอนต์ไทย';
    CONFIG.fonts.thai.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        option.style.fontFamily = font;
        thaiGroup.appendChild(option);
    });
    fontSelect.appendChild(thaiGroup);

    // English fonts
    const englishGroup = document.createElement('optgroup');
    englishGroup.label = '🇬🇧 English Fonts';
    CONFIG.fonts.english.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        option.style.fontFamily = font;
        englishGroup.appendChild(option);
    });
    fontSelect.appendChild(englishGroup);
}

/**
 * Load position presets
 */
function loadPositionPresets() {
    const positionGrid = document.getElementById('positionGrid');

    Object.keys(CONFIG.positions).forEach(key => {
        const pos = CONFIG.positions[key];
        const btn = document.createElement('button');
        btn.className = 'position-btn';
        btn.textContent = pos.name;
        btn.dataset.position = key;
        btn.onclick = () => selectPosition(pos.value.x, pos.value.y);
        positionGrid.appendChild(btn);
    });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload({ target: { files: [file] } });
        }
    });

    // Position overlay click
    document.getElementById('positionOverlay').addEventListener('click', handlePositionClick);

    // Logo upload
    document.getElementById('logoInput').addEventListener('change', handleLogoUpload);

    // Logo size slider
    document.getElementById('logoSize').addEventListener('input', (e) => {
        appState.logoSettings.width = parseInt(e.target.value);
        document.getElementById('logoSizeValue').textContent = e.target.value + 'px';
    });

    // Logo position buttons
    document.querySelectorAll('.logo-pos-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.logo-pos-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            appState.logoSettings.position = e.target.dataset.position;
        });
    });

    // Submit button
    document.getElementById('submitBtn').addEventListener('click', generateFinalImage);

    // Range sliders value display
    setupSliderListeners();
}

/**
 * Setup slider value displays
 */
function setupSliderListeners() {
    const sliders = [
        { id: 'fontSize', valueId: 'fontSizeValue', suffix: 'px' },
        { id: 'bgOpacity', valueId: 'bgOpacityValue', suffix: '%' },
        { id: 'strokeWidth', valueId: 'strokeWidthValue', suffix: 'px' },
        { id: 'shadowBlur', valueId: 'shadowBlurValue', suffix: 'px' },
        { id: 'letterSpacing', valueId: 'letterSpacingValue', suffix: '' },
        { id: 'textRotation', valueId: 'textRotationValue', suffix: '°' },
        { id: 'curveAngle', valueId: 'curveAngleValue', suffix: '°' },
    ];

    sliders.forEach(slider => {
        const element = document.getElementById(slider.id);
        const valueElement = document.getElementById(slider.valueId);
        if (element && valueElement) {
            element.addEventListener('input', (e) => {
                valueElement.textContent = e.target.value + slider.suffix;
            });
        }
    });

    // Stroke width - show color picker
    document.getElementById('strokeWidth').addEventListener('input', (e) => {
        const strokeColorGroup = document.getElementById('strokeColorGroup');
        strokeColorGroup.style.display = e.target.value > 0 ? 'block' : 'none';
    });

    // Text shadow checkbox
    document.getElementById('textShadow').addEventListener('change', (e) => {
        document.getElementById('shadowSettings').style.display = e.target.checked ? 'block' : 'none';
    });

    // Curved text checkbox
    document.getElementById('curvedText').addEventListener('change', (e) => {
        document.getElementById('curveAngleGroup').style.display = e.target.checked ? 'block' : 'none';
    });
}

/**
 * Handle file upload
 */
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
        alert('❌ กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
        return;
    }

    if (file.size > 50 * 1024 * 1024) {
        alert('❌ ไฟล์ใหญ่เกิน 50MB');
        return;
    }

    appState.uploadedFile = file;

    // Show loading
    showLoading(true);

    try {
        // Upload to Cloudinary
        const result = await cloudinaryAPI.uploadImage(file);
        appState.cloudinaryPublicId = result.public_id;
        appState.cloudinaryURL = result.secure_url;

        // Show preview
        const preview = document.getElementById('imagePreview');
        preview.src = result.secure_url;

        document.getElementById('previewSection').classList.add('active');
        document.getElementById('controlsSection').classList.add('active');
        document.getElementById('submitBtn').disabled = false;

    } catch (error) {
        console.error('Upload error:', error);
        alert('❌ อัปโหลดไม่สำเร็จ: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Handle logo upload
 */
async function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showLoading(true);

    try {
        const result = await cloudinaryAPI.uploadImage(file);
        appState.logoPublicId = result.public_id;

        // Show preview
        const logoPreview = document.getElementById('logoPreview');
        logoPreview.src = result.secure_url;
        logoPreview.style.display = 'block';

        // Show size and position controls
        document.getElementById('logoSizeGroup').style.display = 'block';
        document.getElementById('logoPositionGroup').style.display = 'block';

        alert('✅ อัปโหลดโลโก้สำเร็จ!');

    } catch (error) {
        console.error('Logo upload error:', error);
        alert('❌ อัปโหลดโลโก้ไม่สำเร็จ: ' + error.message);
    } finally {
        showLoading(false);
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

    // Create layer data
    const layer = {
        id: `layer-${Date.now()}`,
        enabled: true,
        text: '',
        position: { x: 50, y: 50 + (layerIndex * 15) }, // Offset each layer
        fontFamily: 'Mitr',
        fontSize: 70,
        color: 'ffdd17',
        fontWeight: 'normal',
        textAlign: 'center',
        strokeWidth: 0,
        strokeColor: '17539f',
        curved: false,
        curveAngle: 40,
    };

    appState.textLayers.push(layer);
    appState.currentLayerIndex = layerIndex;

    // Create layer UI
    createLayerUI(layer, layerIndex);

    // Update add button state
    updateAddButtonState();
}

/**
 * Create layer UI
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
                    <input type="checkbox" class="layer-enabled" data-index="${index}" checked>
                    เปิดใช้งาน
                </label>
                ${index > 0 ? `<button class="remove-layer-btn" onclick="removeTextLayer(${index})">🗑️ ลบ</button>` : ''}
            </div>
        </div>

        <div class="control-group">
            <label>📝 ข้อความ</label>
            <textarea class="layer-text" data-index="${index}" placeholder="พิมพ์ข้อความ..." rows="2"></textarea>
        </div>

        <div class="control-group">
            <label>📍 ตำแหน่ง (X, Y)</label>
            <div style="display: flex; gap: 12px;">
                <input type="number" class="layer-pos-x" data-index="${index}" min="0" max="100" value="${layer.position.x}" placeholder="X">
                <input type="number" class="layer-pos-y" data-index="${index}" min="0" max="100" value="${layer.position.y}" placeholder="Y">
            </div>
        </div>

        <div class="control-group">
            <label>🌈 ข้อความโค้ง</label>
            <div class="checkbox-container">
                <input type="checkbox" class="layer-curved" data-index="${index}">
                <label style="margin: 0; font-size: 12px;">เปิดใช้งานข้อความโค้ง</label>
            </div>
        </div>
    `;

    container.appendChild(layerDiv);

    // Add event listeners for this layer
    layerDiv.querySelector('.layer-enabled').addEventListener('change', (e) => {
        layer.enabled = e.target.checked;
        layerDiv.classList.toggle('disabled', !e.target.checked);
    });

    layerDiv.querySelector('.layer-text').addEventListener('input', (e) => {
        layer.text = e.target.value;
    });

    layerDiv.querySelector('.layer-pos-x').addEventListener('input', (e) => {
        layer.position.x = parseInt(e.target.value);
    });

    layerDiv.querySelector('.layer-pos-y').addEventListener('input', (e) => {
        layer.position.y = parseInt(e.target.value);
    });

    layerDiv.querySelector('.layer-curved').addEventListener('change', (e) => {
        layer.curved = e.target.checked;
    });

    // Make this the active layer when clicked
    layerDiv.addEventListener('click', () => {
        appState.currentLayerIndex = index;
    });
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

    if (layerElement) {
        layerElement.remove();
    }

    appState.textLayers.splice(index, 1);

    // Re-index remaining layers
    appState.textLayers.forEach((layer, idx) => {
        const element = document.getElementById(layer.id);
        if (element) {
            element.querySelector('.layer-title').textContent = `ข้อความชั้นที่ ${idx + 1}`;
        }
    });

    updateAddButtonState();
}

/**
 * Update add button state
 */
function updateAddButtonState() {
    const addBtn = document.getElementById('addLayerBtn');
    addBtn.disabled = appState.textLayers.length >= appState.maxLayers;
    addBtn.textContent = appState.textLayers.length >= appState.maxLayers
        ? '🚫 ถึงจำนวนสูงสุดแล้ว (3 ชั้น)'
        : '➕ เพิ่มข้อความ';
}

/**
 * Update layer UI from state
 */
function updateLayerUI(index) {
    // This would update shared controls to reflect the current layer's settings
    // For now, layers use their own stored settings
}

/**
 * Handle position click
 */
function handlePositionClick(event) {
    const rect = event.target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    selectPosition(Math.round(x), Math.round(y));
}

/**
 * Select position
 */
function selectPosition(x, y) {
    // Update current layer position
    if (appState.textLayers[appState.currentLayerIndex]) {
        appState.textLayers[appState.currentLayerIndex].position = { x, y };

        // Update position inputs
        const layerElement = document.getElementById(appState.textLayers[appState.currentLayerIndex].id);
        if (layerElement) {
            layerElement.querySelector('.layer-pos-x').value = x;
            layerElement.querySelector('.layer-pos-y').value = y;
        }
    }

    // Update shared position inputs
    document.getElementById('posX').value = x;
    document.getElementById('posY').value = y;

    // Update marker
    const marker = document.getElementById('positionMarker');
    marker.style.left = x + '%';
    marker.style.top = y + '%';
    marker.style.display = 'block';
}

/**
 * Generate final image
 */
async function generateFinalImage() {
    if (!appState.cloudinaryPublicId) {
        alert('❌ กรุณาอัปโหลดรูปภาพก่อน');
        return;
    }

    // Check if at least one layer has text
    const hasText = appState.textLayers.some(layer => layer.enabled && layer.text.trim());
    if (!hasText) {
        alert('❌ กรุณากรอกข้อความอย่างน้อย 1 ชั้น');
        return;
    }

    showLoading(true);

    try {
        // Prepare logo options
        const logoOptions = appState.logoPublicId ? {
            publicId: appState.logoPublicId,
            width: appState.logoSettings.width,
            position: appState.logoSettings.position,
        } : null;

        // Generate URL with multiple text layers
        const transformedURL = cloudinaryAPI.generateMultipleTextOverlays(
            appState.cloudinaryPublicId,
            appState.textLayers,
            logoOptions
        );

        // Open in new tab
        window.open(transformedURL, '_blank');

        // Send to n8n
        try {
            await sendToN8N({
                original_url: appState.cloudinaryURL,
                transformed_url: transformedURL,
                text_layers: appState.textLayers.map(layer => ({
                    text: layer.text,
                    position: layer.position,
                    enabled: layer.enabled,
                    curved: layer.curved,
                    curveAngle: layer.curveAngle,
                    fontSize: layer.fontSize,
                    color: layer.color,
                    fontFamily: layer.fontFamily,
                })),
                logo: logoOptions,
            });
        } catch (n8nError) {
            console.error('n8n error:', n8nError);
            // Don't block the user if n8n fails
        }

        alert('✅ สร้างรูปภาพสำเร็จ!\n\n🔗 เปิดรูปในแท็บใหม่แล้ว');

    } catch (error) {
        console.error('Generate error:', error);
        alert('❌ สร้างรูปภาพไม่สำเร็จ: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Send data to n8n
 */
async function sendToN8N(data) {
    if (!CONFIG.n8n || !CONFIG.n8n.webhookURL) {
        console.log('n8n not configured');
        return;
    }

    const payload = {
        timestamp: new Date().toISOString(),
        app_version: '1.1.0',
        media_type: 'image',
        user_id: document.getElementById('userId').value || 'anonymous',
        security_code: document.getElementById('securityCode').value || '',
        ...data,
    };

    const response = await fetch(CONFIG.n8n.webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('n8n webhook failed');
    }

    return response.json();
}

/**
 * Load user info from URL
 */
function loadUserInfo() {
    const urlParams = new URLSearchParams(window.location.search);

    const userId = urlParams.get('user_id');
    if (userId) {
        document.getElementById('userId').value = userId;
    }

    const securityCode = urlParams.get('security_code');
    if (securityCode) {
        document.getElementById('securityCode').value = securityCode;
    }
}

/**
 * Show/hide loading
 */
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
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
window.toggleSection = toggleSection;
