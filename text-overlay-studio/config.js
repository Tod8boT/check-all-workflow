// ⚙️ Configuration
const CONFIG = {
    // Cloudinary Settings
    cloudinary: {
        cloudName: 'YOUR_CLOUD_NAME', // เปลี่ยนเป็น cloud name ของคุณ
        uploadPreset: 'upload-image', // สร้าง upload preset ใน Cloudinary
    },

    // n8n Webhook URL
    n8n: {
        webhookURL: 'YOUR_WEBHOOK_URL', // เปลี่ยนเป็น webhook URL ของคุณ
    },

    // App Settings
    app: {
        version: '1.0.0',
        maxFileSize: 50 * 1024 * 1024, // 50MB
        supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        supportedVideoTypes: ['video/mp4', 'video/webm'],
    },

    // Thai Fonts from Google Fonts
    fonts: {
        thai: [
            'Mitr',
            'Kanit',
            'Prompt',
            'Sarabun',
            'Noto Sans Thai',
            'Chakra Petch',
            'Bai Jamjuree',
        ],
        english: [
            'Arial',
            'Roboto',
            'Open Sans',
            'Montserrat',
            'Poppins',
            'Playfair Display',
        ]
    },

    // E-commerce Presets (ภาษาไทย)
    presets: {
        'sale-badge': {
            name: '🏷️ ป้ายลดราคา',
            style: {
                fontSize: 48,
                color: 'FFFFFF',
                background: 'FF6B6B',
                fontFamily: 'Kanit',
                fontWeight: 'bold',
            }
        },
        'price-tag': {
            name: '💰 ป้ายราคา',
            style: {
                fontSize: 36,
                color: '2C3E50',
                background: 'F8F9FA',
                fontFamily: 'Mitr',
                fontWeight: 'bold',
            }
        },
        'watermark': {
            name: '🔖 ลายน้ำ',
            style: {
                fontSize: 16,
                color: '000000',
                background: 'transparent',
                fontFamily: 'Arial',
                opacity: 60,
            }
        },
        'header': {
            name: '📌 หัวข้อ',
            style: {
                fontSize: 40,
                color: 'FFFFFF',
                background: '007AFF',
                fontFamily: 'Kanit',
                fontWeight: 'bold',
            }
        },
        'cta-button': {
            name: '👆 ปุ่มเรียกร้อง',
            style: {
                fontSize: 32,
                color: 'FFFFFF',
                background: '34C759',
                fontFamily: 'Prompt',
                fontWeight: 'bold',
            }
        }
    },

    // Position Presets (ภาษาไทย)
    positions: {
        'top-left': { x: 10, y: 10, label: 'มุมบนซ้าย' },
        'top-center': { x: 50, y: 10, label: 'บนกลาง' },
        'top-right': { x: 90, y: 10, label: 'มุมบนขวา' },
        'center-left': { x: 10, y: 50, label: 'กลางซ้าย' },
        'center': { x: 50, y: 50, label: 'ตรงกลาง' },
        'center-right': { x: 90, y: 50, label: 'กลางขวา' },
        'bottom-left': { x: 10, y: 90, label: 'มุมล่างซ้าย' },
        'bottom-center': { x: 50, y: 90, label: 'ล่างกลาง' },
        'bottom-right': { x: 90, y: 90, label: 'มุมล่างขวา' },
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
