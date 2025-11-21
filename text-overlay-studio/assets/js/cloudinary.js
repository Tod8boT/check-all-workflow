/**
 * 🌥️ Cloudinary API Handler
 * จัดการ upload และ generate text overlay URL
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
     * @param {File} file - Image file
     * @returns {Promise} Upload response
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
     * Upload video to Cloudinary
     * @param {File} file - Video file
     * @returns {Promise} Upload response
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

    /**
     * Generate text overlay transformation URL
     * @param {string} publicId - Cloudinary public ID
     * @param {object} options - Text overlay options
     * @returns {string} Transformed image URL
     */
    generateTextOverlayURL(publicId, options) {
        const {
            text,
            position = { x: 50, y: 50 },
            fontFamily = 'Arial',
            fontSize = 24,
            color = 'FFFFFF',
            backgroundColor = '000000',
            bgOpacity = 100,
            curved = false,
            curveAngle = 180,
            gravity = 'center',
            rotation = 0,
            fontWeight = 'normal',
            textAlign = 'center',
            strokeWidth = 0,
            strokeColor = '000000',
            shadow = false,
            shadowBlur = 10,
            shadowColor = '000000',
            shadowX = 5,
            shadowY = 5,
            letterSpacing = 0,
        } = options;

        // Build transformation parts
        const parts = [];

        // Gravity and position
        let gravityStr = this.calculateGravity(position);
        parts.push(`g_${gravityStr}`);

        // X, Y offsets (as percentages)
        const xOffset = this.calculateOffset(position.x);
        const yOffset = this.calculateOffset(position.y);
        if (xOffset !== 0) parts.push(`x_${xOffset}`);
        if (yOffset !== 0) parts.push(`y_${yOffset}`);

        // Build text style string with new options
        let textStyleStr = fontFamily.replace(/ /g, '_');

        // Font weight
        if (fontWeight === 'bold') {
            textStyleStr += '_bold';
        }

        // Font size
        textStyleStr += `_${fontSize}`;

        // Text alignment
        if (textAlign && textAlign !== 'center') {
            textStyleStr += `_${textAlign}`;
        }

        // Letter spacing
        if (letterSpacing !== 0) {
            textStyleStr += `_letter_spacing_${letterSpacing}`;
        }

        // Stroke (border)
        if (strokeWidth > 0) {
            textStyleStr += `_stroke`;
        }

        // Text layer
        const encodedText = this.encodeText(text);
        parts.push(`l_text:${textStyleStr}:${encodedText}`);

        // Text color
        parts.push(`co_rgb:${color.replace('#', '')}`);

        // Stroke color (if stroke enabled)
        if (strokeWidth > 0) {
            parts.push(`bo_${strokeWidth}px_solid_rgb:${strokeColor.replace('#', '')}`);
        }

        // Background (if not transparent)
        if (backgroundColor && backgroundColor !== 'transparent') {
            const bgColor = backgroundColor.replace('#', '');
            parts.push(`b_rgb:${bgColor}`);
            if (bgOpacity < 100) {
                parts.push(`o_${bgOpacity}`);
            }
        }

        // Shadow effect
        if (shadow) {
            // Cloudinary uses e_shadow for drop shadow
            parts.push(`e_shadow:${shadowBlur},x_${shadowX},y_${shadowY},co_rgb:${shadowColor.replace('#', '')}`);
        }

        // Curved text (arc distortion)
        if (curved) {
            parts.push(`e_distort:arc:${curveAngle}`);
        }

        // Rotation
        if (rotation !== 0) {
            parts.push(`a_${rotation}`);
        }

        // Build final URL
        const transformation = parts.join(',');
        const resourceType = publicId.includes('video') ? 'video' : 'image';

        return `${this.deliveryURL}/${resourceType}/upload/${transformation}/${publicId}`;
    }

    /**
     * Calculate gravity based on position
     * @param {object} position - {x, y} position (0-100)
     * @returns {string} Gravity string
     */
    calculateGravity(position) {
        const { x, y } = position;

        // Determine vertical position
        let vertical = 'center';
        if (y < 33) vertical = 'north';
        else if (y > 67) vertical = 'south';

        // Determine horizontal position
        let horizontal = '';
        if (x < 33) horizontal = '_west';
        else if (x > 67) horizontal = '_east';

        return vertical + horizontal;
    }

    /**
     * Calculate offset from center
     * @param {number} percent - Position percentage (0-100)
     * @returns {number} Offset value
     */
    calculateOffset(percent) {
        // Convert percentage to offset from center
        const offset = Math.round((percent - 50) * 10);
        return offset;
    }

    /**
     * Build font string for Cloudinary
     * @param {string} family - Font family
     * @param {number} size - Font size
     * @param {string} weight - Font weight
     * @returns {string} Font string
     */
    buildFontString(family, size, weight) {
        // Replace spaces with underscores
        const fontName = family.replace(/ /g, '_');

        // Add weight if specified
        let fontStr = fontName;
        if (weight === 'bold') {
            fontStr += '_bold';
        }

        fontStr += `_${size}`;

        return fontStr;
    }

    /**
     * Encode text for URL
     * @param {string} text - Text to encode
     * @returns {string} Encoded text
     */
    encodeText(text) {
        return encodeURIComponent(text)
            .replace(/%20/g, '%20')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');
    }

    /**
     * Generate multiple text overlays
     * @param {string} publicId - Cloudinary public ID
     * @param {array} overlays - Array of overlay options
     * @returns {string} Transformed image URL with multiple overlays
     */
    generateMultipleOverlays(publicId, overlays) {
        let baseURL = `${this.deliveryURL}/image/upload`;

        // Add each overlay as a transformation
        overlays.forEach(overlay => {
            const transformation = this.buildTransformation(overlay);
            baseURL += `/${transformation}`;
        });

        baseURL += `/${publicId}`;
        return baseURL;
    }

    /**
     * Build single transformation string
     * @param {object} options - Overlay options
     * @returns {string} Transformation string
     */
    buildTransformation(options) {
        const {
            text,
            position = { x: 50, y: 50 },
            fontFamily = 'Arial',
            fontSize = 24,
            color = 'FFFFFF',
            backgroundColor = '000000',
            bgOpacity = 100,
            curved = false,
            curveAngle = 180,
        } = options;

        const parts = [];

        // Gravity and position
        let gravityStr = this.calculateGravity(position);
        parts.push(`g_${gravityStr}`);

        const xOffset = this.calculateOffset(position.x);
        const yOffset = this.calculateOffset(position.y);
        if (xOffset !== 0) parts.push(`x_${xOffset}`);
        if (yOffset !== 0) parts.push(`y_${yOffset}`);

        // Text layer
        const encodedText = this.encodeText(text);
        const fontStr = this.buildFontString(fontFamily, fontSize, 'normal');
        parts.push(`l_text:${fontStr}:${encodedText}`);

        // Color
        parts.push(`co_rgb:${color.replace('#', '')}`);

        // Background
        if (backgroundColor && backgroundColor !== 'transparent') {
            const bgColor = backgroundColor.replace('#', '');
            parts.push(`b_rgb:${bgColor}`);
            if (bgOpacity < 100) {
                parts.push(`o_${bgOpacity}`);
            }
        }

        // Curved text
        if (curved) {
            parts.push(`e_distort:arc:${curveAngle}`);
        }

        return parts.join(',');
    }

    /**
     * Generate video text overlay URL
     * @param {string} publicId - Cloudinary public ID
     * @param {object} options - Video overlay options
     * @returns {string} Transformed video URL
     */
    generateVideoOverlayURL(publicId, options) {
        const {
            text,
            position = { x: 50, y: 50 },
            fontFamily = 'Arial',
            fontSize = 24,
            color = 'FFFFFF',
            backgroundColor = '000000',
            bgOpacity = 100,
            startTime = 0,
            endTime = null,
            duration = null,
        } = options;

        const parts = [];

        // Timing (if specified)
        if (startTime > 0 || endTime || duration) {
            let timingStr = '';
            if (startTime > 0) timingStr += `so_${startTime}`;
            if (endTime) timingStr += `,eo_${endTime}`;
            if (duration) timingStr += `,du_${duration}`;
            if (timingStr) parts.push(timingStr);
        }

        // Gravity and position
        let gravityStr = this.calculateGravity(position);
        parts.push(`g_${gravityStr}`);

        const xOffset = this.calculateOffset(position.x);
        const yOffset = this.calculateOffset(position.y);
        if (xOffset !== 0) parts.push(`x_${xOffset}`);
        if (yOffset !== 0) parts.push(`y_${yOffset}`);

        // Text layer
        const encodedText = this.encodeText(text);
        const fontStr = this.buildFontString(fontFamily, fontSize, 'normal');
        parts.push(`l_text:${fontStr}:${encodedText}`);

        // Color
        parts.push(`co_rgb:${color.replace('#', '')}`);

        // Background
        if (backgroundColor && backgroundColor !== 'transparent') {
            const bgColor = backgroundColor.replace('#', '');
            parts.push(`b_rgb:${bgColor}`);
            if (bgOpacity < 100) {
                parts.push(`o_${bgOpacity}`);
            }
        }

        const transformation = parts.join(',');
        return `${this.deliveryURL}/video/upload/${transformation}/${publicId}`;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudinaryAPI;
}
