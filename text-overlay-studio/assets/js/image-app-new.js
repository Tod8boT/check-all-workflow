/**
 * 🖼️ Image Text Overlay Application (Updated with Multiple Layers + Logo)
 */

// Application State
const appState = {
    uploadedFile: null,
    cloudinaryPublicId: null,
    cloudinaryURL: null,
    logoPublicId: null,
    logoLocalURL: null,
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
 * Load fonts - no longer needed, fonts loaded per layer
 */
function loadFonts() {
    // Fonts are now loaded inline in each layer
}

/**
 * Load position presets - no longer needed
 */
function loadPositionPresets() {
    // Position presets removed, each layer has own position
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

    // Submit button
    document.getElementById('submitBtn').addEventListener('click', generateFinalImage);

    // Range sliders value display
    setupSliderListeners();
}

/**
 * Setup slider value displays - now handled per-layer
 */
function setupSliderListeners() {
    // All slider listeners are now set up per-layer in setupLayerEventListeners
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
        appState.logoLocalURL = result.secure_url;

        // Show preview
        const logoPreview = document.getElementById('logoPreview');
        logoPreview.src = result.secure_url;
        logoPreview.style.display = 'block';

        // Show size and position controls
        document.getElementById('logoSizeGroup').style.display = 'block';
        document.getElementById('logoPositionGroup').style.display = 'block';

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
                <label>🌈 ข้อความโค้ง</label>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <input type="checkbox" class="layer-curved" ${layer.curved ? 'checked' : ''}>
                    <span style="font-size: 12px;">องศา:</span>
                    <input type="number" class="layer-curve-angle" min="-180" max="180" value="${layer.curveAngle}" style="width: 60px;">
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

    // Setup event listeners
    setupLayerEventListeners(layerDiv, layer, index);

    // Load saved templates into dropdown
    loadTemplatesIntoDropdown(layerDiv.querySelector('.layer-template-select'), index);
}

/**
 * Setup event listeners for a layer
 */
function setupLayerEventListeners(layerDiv, layer, index) {
    // Enable/disable
    layerDiv.querySelector('.layer-enabled').addEventListener('change', (e) => {
        layer.enabled = e.target.checked;
        layerDiv.classList.toggle('disabled', !e.target.checked);
        updatePreview();
    });

    // Text
    layerDiv.querySelector('.layer-text').addEventListener('input', (e) => {
        layer.text = e.target.value;
        updatePreview();
    });

    // Position
    layerDiv.querySelector('.layer-pos-x').addEventListener('input', (e) => {
        layer.position.x = parseInt(e.target.value) || 0;
        updatePreview();
    });
    layerDiv.querySelector('.layer-pos-y').addEventListener('input', (e) => {
        layer.position.y = parseInt(e.target.value) || 0;
        updatePreview();
    });

    // Font
    layerDiv.querySelector('.layer-font').addEventListener('change', (e) => {
        layer.fontFamily = e.target.value;
        updatePreview();
    });

    // Size
    layerDiv.querySelector('.layer-size').addEventListener('input', (e) => {
        layer.fontSize = parseInt(e.target.value);
        layerDiv.querySelector('.layer-size-value').textContent = e.target.value + 'px';
        updatePreview();
    });

    // Color
    layerDiv.querySelector('.layer-color').addEventListener('input', (e) => {
        layer.color = e.target.value.replace('#', '');
        updatePreview();
    });

    // Weight
    layerDiv.querySelector('.layer-weight').addEventListener('change', (e) => {
        layer.fontWeight = e.target.value;
        updatePreview();
    });

    // Stroke width
    layerDiv.querySelector('.layer-stroke').addEventListener('input', (e) => {
        layer.strokeWidth = parseInt(e.target.value);
        layerDiv.querySelector('.layer-stroke-value').textContent = e.target.value + 'px';
        layerDiv.querySelector('.layer-stroke-color-group').style.display = e.target.value > 0 ? 'block' : 'none';
        updatePreview();
    });

    // Stroke color
    layerDiv.querySelector('.layer-stroke-color').addEventListener('input', (e) => {
        layer.strokeColor = e.target.value.replace('#', '');
        updatePreview();
    });

    // Curved
    layerDiv.querySelector('.layer-curved').addEventListener('change', (e) => {
        layer.curved = e.target.checked;
        updatePreview();
    });

    // Curve angle
    layerDiv.querySelector('.layer-curve-angle').addEventListener('input', (e) => {
        layer.curveAngle = parseInt(e.target.value) || 0;
        updatePreview();
    });

    // Template select
    layerDiv.querySelector('.layer-template-select').addEventListener('change', (e) => {
        if (e.target.value) {
            applyTemplate(index, e.target.value);
            e.target.value = ''; // Reset dropdown
        }
    });

    // Set active layer on click
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
        curved: layer.curved,
        curveAngle: layer.curveAngle
    });

    localStorage.setItem('textTemplates', JSON.stringify(templates));

    // Refresh all dropdowns
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

    // Clear existing options except first
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

    // Apply template values
    layer.fontFamily = template.fontFamily;
    layer.fontSize = template.fontSize;
    layer.color = template.color;
    layer.fontWeight = template.fontWeight;
    layer.strokeWidth = template.strokeWidth;
    layer.strokeColor = template.strokeColor;
    layer.curved = template.curved;
    layer.curveAngle = template.curveAngle;

    // Update UI
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
        layerDiv.querySelector('.layer-curved').checked = layer.curved;
        layerDiv.querySelector('.layer-curve-angle').value = layer.curveAngle;
    }

    updatePreview();
    alert('✅ ใช้เทมเพลต "' + template.name + '" แล้ว!');
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
 * Select position (from clicking on preview)
 */
function selectPosition(x, y) {
    // Update current layer position
    if (appState.textLayers[appState.currentLayerIndex]) {
        appState.textLayers[appState.currentLayerIndex].position = { x, y };

        // Update position inputs in layer UI
        const layerElement = document.getElementById(appState.textLayers[appState.currentLayerIndex].id);
        if (layerElement) {
            layerElement.querySelector('.layer-pos-x').value = x;
            layerElement.querySelector('.layer-pos-y').value = y;
        }

        updatePreview();
    }

    // Update marker on preview
    const marker = document.getElementById('positionMarker');
    if (marker) {
        marker.style.left = x + '%';
        marker.style.top = y + '%';
        marker.style.display = 'block';
    }
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
 * Update realtime preview with canvas
 */
function updatePreview() {
    const preview = document.getElementById('imagePreview');
    if (!preview.src || !appState.cloudinaryURL) return;

    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.style.display = 'block';
        preview.style.display = 'none';

        // Draw base image
        ctx.drawImage(img, 0, 0);

        // Draw logo if exists
        if (appState.logoPublicId && appState.logoLocalURL) {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';
            logoImg.onload = () => {
                const logoPos = getLogoCanvasPosition(canvas.width, canvas.height, appState.logoSettings);
                ctx.drawImage(logoImg, logoPos.x, logoPos.y, logoPos.width, logoPos.height);

                // Draw text layers after logo
                drawTextLayers(ctx, canvas.width, canvas.height);
            };
            logoImg.src = appState.logoLocalURL;
        } else {
            // Draw text layers
            drawTextLayers(ctx, canvas.width, canvas.height);
        }
    };
    img.src = appState.cloudinaryURL;
}

/**
 * Get logo position for canvas
 */
function getLogoCanvasPosition(canvasWidth, canvasHeight, settings) {
    const logoWidth = settings.width;
    const logoHeight = settings.width; // Assume square for simplicity
    const padding = 20;

    const positions = {
        'top-left': { x: padding, y: padding },
        'top-center': { x: (canvasWidth - logoWidth) / 2, y: padding },
        'top-right': { x: canvasWidth - logoWidth - padding, y: padding },
        'center-left': { x: padding, y: (canvasHeight - logoHeight) / 2 },
        'center': { x: (canvasWidth - logoWidth) / 2, y: (canvasHeight - logoHeight) / 2 },
        'center-right': { x: canvasWidth - logoWidth - padding, y: (canvasHeight - logoHeight) / 2 },
        'bottom-left': { x: padding, y: canvasHeight - logoHeight - padding },
        'bottom-center': { x: (canvasWidth - logoWidth) / 2, y: canvasHeight - logoHeight - padding },
        'bottom-right': { x: canvasWidth - logoWidth - padding, y: canvasHeight - logoHeight - padding },
    };

    return {
        ...positions[settings.position] || positions['top-left'],
        width: logoWidth,
        height: logoHeight
    };
}

/**
 * Draw text layers on canvas
 */
function drawTextLayers(ctx, canvasWidth, canvasHeight) {
    appState.textLayers.forEach(layer => {
        if (!layer.enabled || !layer.text.trim()) return;

        const x = (layer.position.x / 100) * canvasWidth;
        const y = (layer.position.y / 100) * canvasHeight;

        // Set font
        const fontWeight = layer.fontWeight === 'bold' ? 'bold ' : '';
        ctx.font = `${fontWeight}${layer.fontSize}px ${layer.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw stroke if set
        if (layer.strokeWidth > 0) {
            ctx.strokeStyle = '#' + layer.strokeColor;
            ctx.lineWidth = layer.strokeWidth * 2;
            ctx.strokeText(layer.text, x, y);
        }

        // Draw fill
        ctx.fillStyle = '#' + layer.color;
        ctx.fillText(layer.text, x, y);
    });
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
window.toggleLayerAdvanced = toggleLayerAdvanced;
window.saveLayerTemplate = saveLayerTemplate;
