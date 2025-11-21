/**
 * 🔗 n8n Webhook Handler
 * ส่งข้อมูลไปยัง n8n workflow
 */

class N8NWebhook {
    constructor(webhookURL) {
        this.webhookURL = webhookURL;
    }

    /**
     * Send text overlay data to n8n
     * @param {object} data - Overlay data
     * @returns {Promise} Response from n8n
     */
    async sendTextOverlayData(data) {
        const payload = {
            // Metadata
            timestamp: new Date().toISOString(),
            app_version: CONFIG.app.version,
            media_type: data.mediaType, // 'image' or 'video'

            // User info
            user_id: data.userId,
            security_code: data.securityCode,

            // Media URLs
            original_url: data.originalURL,
            transformed_url: data.transformedURL,
            cloudinary_public_id: data.publicId,

            // Text overlay settings
            text_overlay: {
                text: data.text,
                position: {
                    x: data.position.x,
                    y: data.position.y,
                    preset: data.positionPreset || null,
                },
                style: {
                    font_family: data.fontFamily,
                    font_size: data.fontSize,
                    color: data.color,
                    background_color: data.backgroundColor,
                    background_opacity: data.bgOpacity,
                },
                effects: {
                    curved: data.curved || false,
                    curve_angle: data.curveAngle || 0,
                    rotation: data.rotation || 0,
                },
                preset_used: data.presetUsed || null,
            },

            // Video specific (if applicable)
            video_settings: data.videoSettings || null,
        };

        try {
            const response = await fetch(this.webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`n8n webhook failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('n8n webhook error:', error);
            throw error;
        }
    }

    /**
     * Send batch overlay data (multiple overlays)
     * @param {object} data - Batch overlay data
     * @returns {Promise} Response from n8n
     */
    async sendBatchOverlayData(data) {
        const payload = {
            timestamp: new Date().toISOString(),
            app_version: CONFIG.app.version,
            media_type: data.mediaType,
            user_id: data.userId,
            security_code: data.securityCode,
            original_url: data.originalURL,
            transformed_url: data.transformedURL,
            cloudinary_public_id: data.publicId,
            overlays: data.overlays, // Array of overlay objects
        };

        try {
            const response = await fetch(this.webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`n8n webhook failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('n8n webhook error:', error);
            throw error;
        }
    }

    /**
     * Test webhook connection
     * @returns {Promise} Test result
     */
    async testConnection() {
        try {
            const response = await fetch(this.webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    test: true,
                    timestamp: new Date().toISOString()
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Webhook test failed:', error);
            return false;
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = N8NWebhook;
}
