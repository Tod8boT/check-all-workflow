/**
 * 🌥️ Cloudinary API Handler (Updated with correct curved text + multiple layers)
 * Based on working code example
 */

class CloudinaryAPI {
    constructor(cloudName, uploadPreset) {
        this.cloudName = cloudName;
        this.uploadPreset = uploadPreset;
        this.baseURL = `https://api.cloudinary.com/v1_1/${cloudName}`;
        this.deliveryURL = `https://res.cloudinary.com/${cloudName}`;
    }

    /**
     * Upload image to Cloudinary
     */
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', 'text-overlay');

        try {
            const response = await fetch(`${this.baseURL}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    }

    /**
     * Generate text overlay URL - CORRECTED VERSION
     * Based on working example code
     */
    generateTextOverlayURL(publicId, options) {
        const {
            text,
            position = { x: 50, y: 50 },
            fontFamily = 'Mitr',
            fontSize = 70,
            color = 'ffdd17',
            strokeWidth = 0,
            strokeColor = '17539f',
            curved = false,
            curveAngle = 40,
            fontWeight = 'normal',
            textAlign = 'center',
            logoPublicId = null,
            logoWidth = 120,
            logoPosition = 'top-left',
        } = options;

        // All transformations (slash-separated)
        const trans = [];

        // Base resize
        trans.push('w_1080,h_1080,c_fill,g_auto');

        // Logo overlay (if provided)
        if (logoPublicId) {
            trans.push(`l_${logoPublicId},w_${logoWidth}`);
            trans.push(`fl_layer_apply,${this.getLogoGravity(logoPosition)}`);
        }

        // Text layer - BUILD EXACTLY LIKE WORKING EXAMPLE
        const fontStr = `${fontFamily.replace(/ /g, '_')}_${fontSize}_${fontWeight}_${textAlign}${strokeWidth > 0 ? '_stroke' : ''}`;
        const encodedText = this.encodeText(text);

        trans.push(`l_text:${fontStr}:${encodedText},w_750,c_fit,co_rgb:${color.replace('#', '')}`);

        // Outline/Stroke (if enabled) - CORRECT SYNTAX
        if (strokeWidth > 0) {
            trans.push(`co_rgb:${strokeColor.replace('#', '')},e_outline:${strokeWidth * 2}`);
            trans.push(`co_white,e_outline:${strokeWidth}`);
        }

        // Curved text - MUST BE AFTER TEXT + OUTLINES
        if (curved) {
            trans.push(`e_distort:arc:${curveAngle}.0`);
        }

        // Apply text layer at position
        const gravity = this.calculateTextGravity(position);
        const yOffset = this.calculateYOffset(position.y);

        trans.push(`fl_layer_apply,g_${gravity},y_${yOffset}`);

        // Build final URL
        return `${this.deliveryURL}/image/upload/${trans.join('/')}/${publicId}.jpg`;
    }

    /**
     * Generate MULTIPLE text layers
     */
    generateMultipleTextOverlays(publicId, textLayers, logoOptions = null) {
        const trans = [];

        // Base
        trans.push('w_1080,h_1080,c_fill,g_auto');

        // Logo
        if (logoOptions && logoOptions.publicId) {
            trans.push(`l_${logoOptions.publicId},w_${logoOptions.width || 120}`);
            trans.push(`fl_layer_apply,${this.getLogoGravity(logoOptions.position || 'top-left')}`);
        }

        // Each text layer
        textLayers.forEach(layer => {
            if (!layer.text || !layer.enabled) return;

            const fontStr = `${(layer.fontFamily || 'Mitr').replace(/ /g, '_')}_${layer.fontSize || 70}_${layer.fontWeight || 'normal'}_${layer.textAlign || 'center'}${layer.strokeWidth > 0 ? '_stroke' : ''}`;
            const encodedText = this.encodeText(layer.text);

            trans.push(`l_text:${fontStr}:${encodedText},w_750,c_fit,co_rgb:${(layer.color || 'ffdd17').replace('#', '')}`);

            // Stroke
            if (layer.strokeWidth > 0) {
                trans.push(`co_rgb:${(layer.strokeColor || '17539f').replace('#', '')},e_outline:${layer.strokeWidth * 2}`);
                trans.push(`co_white,e_outline:${layer.strokeWidth}`);
            }

            // Curved
            if (layer.curved) {
                trans.push(`e_distort:arc:${layer.curveAngle || 40}.0`);
            }

            // Apply
            const gravity = this.calculateTextGravity(layer.position || {x: 50, y: 50});
            const yOffset = this.calculateYOffset((layer.position || {y: 65}).y);

            trans.push(`fl_layer_apply,g_${gravity},y_${yOffset}`);
        });

        return `${this.deliveryURL}/image/upload/${trans.join('/')}/${publicId}.jpg`;
    }

    /**
     * Calculate text gravity
     */
    calculateTextGravity(position) {
        const { x, y } = position;

        // Vertical
        let vertical = 'center';
        if (y < 33) vertical = 'north';
        else if (y > 67) vertical = 'south';

        // Horizontal
        let horizontal = '';
        if (x < 33) horizontal = '_west';
        else if (x > 67) horizontal = '_east';

        return vertical + horizontal;
    }

    /**
     * Calculate Y offset from percentage
     */
    calculateYOffset(yPercent) {
        // Convert 0-100 to offset (approximate)
        return Math.round((yPercent - 50) * 10);
    }

    /**
     * Get logo gravity position
     */
    getLogoGravity(position) {
        const positions = {
            'top-left': 'g_north_west,x_15,y_15',
            'top-center': 'g_north,y_15',
            'top-right': 'g_north_east,x_15,y_15',
            'center-left': 'g_west,x_15',
            'center': 'g_center',
            'center-right': 'g_east,x_15',
            'bottom-left': 'g_south_west,x_15,y_15',
            'bottom-center': 'g_south,y_15',
            'bottom-right': 'g_south_east,x_15,y_15',
        };
        return positions[position] || positions['top-left'];
    }

    /**
     * Encode text for URL
     */
    encodeText(text) {
        return encodeURIComponent(text);
    }

    /**
     * Upload video
     */
    async uploadVideo(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', 'text-overlay-video');
        formData.append('resource_type', 'video');

        try {
            const response = await fetch(`${this.baseURL}/video/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Cloudinary video upload error:', error);
            throw error;
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudinaryAPI;
}
