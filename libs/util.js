/**
 * Util.js - Các hàm tiện ích cho extension
 * Cookie Generator - Các công cụ hỗ trợ
 */

(function(window) {
  'use strict';
  
  // Đối tượng tiện ích toàn cục
  const CookieUtil = {
    /**
     * Tạo cookie ngẫu nhiên
     * @param {string} domain Tên miền
     * @param {number} count Số lượng cookie cần tạo
     * @param {boolean} secure Có sử dụng secure flag
     * @return {Array} Danh sách cookie
     */
    generateRandomCookies: function(domain, count = 10, secure = true) {
      const cookies = [];
      const now = new Date();
      const expireDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 năm
      
      for (let i = 0; i < count; i++) {
        const cookieName = this.generateRandomString(8);
        const cookieValue = this.generateRandomString(16);
        
        cookies.push({
          name: cookieName,
          value: cookieValue,
          domain: domain,
          path: '/',
          expirationDate: Math.floor(expireDate.getTime() / 1000),
          secure: secure,
          httpOnly: false
        });
      }
      
      return cookies;
    },
    
    /**
     * Tạo chuỗi ngẫu nhiên
     * @param {number} length Độ dài chuỗi
     * @return {string} Chuỗi ngẫu nhiên
     */
    generateRandomString: function(length = 10) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    
    /**
     * Tạo ID ngẫu nhiên
     * @return {string} UUID v4
     */
    generateUUID: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    
    /**
     * Lấy tên miền chính từ URL
     * @param {string} url URL cần xử lý
     * @return {string} Tên miền chính
     */
    extractMainDomain: function(url) {
      try {
        // Loại bỏ protocol và path
        let domain = url.replace(/(https?:\/\/)?(www.)?/i, '');
        domain = domain.split('/')[0];
        
        // Kiểm tra nếu là địa chỉ IP
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(domain)) {
          return domain;
        }
        
        // Tách phần tên miền
        const parts = domain.split('.');
        if (parts.length <= 2) {
          return domain;
        }
        
        // Xử lý các trường hợp đặc biệt (co.uk, com.vn, ...)
        const tlds = ['com', 'net', 'org', 'gov', 'co', 'edu', 'ac'];
        if (parts.length > 2 && 
            tlds.includes(parts[parts.length - 2]) && 
            parts[parts.length - 1].length <= 3) {
          // Trường hợp example.co.uk -> co.uk
          return parts.slice(-3).join('.');
        }
        
        // Trường hợp cơ bản example.com -> example.com
        return parts.slice(-2).join('.');
      } catch (e) {
        console.error('Lỗi khi trích xuất tên miền:', e);
        return url;
      }
    },
    
    /**
     * Kiểm tra xem hiện tại có phải là mobile không
     * @return {boolean} Là thiết bị di động
     */
    isMobile: function() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Thiết lập User-Agent mới
     * @param {string} type Loại thiết bị (desktop/mobile/tablet)
     * @return {string} User-Agent mới
     */
    generateUserAgent: function(type = 'desktop') {
      const agents = {
        desktop: [
          // Chrome trên Windows
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
          // Firefox trên Windows
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
          // Chrome trên macOS
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
          // Safari trên macOS
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15'
        ],
        mobile: [
          // Chrome trên Android
          'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.115 Mobile Safari/537.36',
          // Safari trên iOS
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
          'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        ],
        tablet: [
          // iPad
          'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
          // Android tablet
          'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
          'Mozilla/5.0 (Linux; Android 10; SM-T500) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.115 Safari/537.36'
        ]
      };
      
      const agentList = agents[type] || agents.desktop;
      return agentList[Math.floor(Math.random() * agentList.length)];
    },
    
    /**
     * Tạo thông tin trình duyệt ngẫu nhiên
     * @return {Object} Thông tin trình duyệt
     */
    generateBrowserProfile: function() {
      // Danh sách ngôn ngữ phổ biến
      const languages = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'ja-JP', 'ko-KR', 'pt-BR', 'ru-RU', 'zh-CN', 'vi-VN'];
      // Danh sách múi giờ phổ biến
      const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney', 'Asia/Ho_Chi_Minh'];
      // Danh sách độ phân giải màn hình phổ biến
      const screenResolutions = [
        {width: 1366, height: 768},  // Laptop phổ biến
        {width: 1920, height: 1080}, // Full HD
        {width: 2560, height: 1440}, // 2K
        {width: 3840, height: 2160}, // 4K
        {width: 1440, height: 900},  // MacBook
        {width: 1536, height: 864}   // Laptop Windows khác
      ];
      
      // Chọn ngẫu nhiên
      const selectedLanguage = languages[Math.floor(Math.random() * languages.length)];
      const selectedTimezone = timezones[Math.floor(Math.random() * timezones.length)];
      const selectedResolution = screenResolutions[Math.floor(Math.random() * screenResolutions.length)];
      
      return {
        userAgent: this.generateUserAgent(),
        language: selectedLanguage,
        languages: [selectedLanguage, selectedLanguage.split('-')[0]],
        platform: Math.random() > 0.7 ? 'MacIntel' : 'Win32',
        vendor: Math.random() > 0.7 ? 'Apple' : 'Google Inc.',
        timezone: selectedTimezone,
        timezoneOffset: new Date().getTimezoneOffset(),
        screen: {
          width: selectedResolution.width,
          height: selectedResolution.height,
          colorDepth: 24,
          pixelDepth: 24
        }
      };
    },
    
    /**
     * Thiết lập thông tin trình duyệt
     * @param {Object} profile Thông tin trình duyệt
     */
    applyBrowserProfile: function(profile) {
      try {
        // Lưu User-Agent gốc
        this.originalUserAgent = navigator.userAgent;
        
        // Override các thuộc tính navigator
        this._overrideNavigatorProperty('userAgent', profile.userAgent);
        this._overrideNavigatorProperty('platform', profile.platform);
        this._overrideNavigatorProperty('vendor', profile.vendor);
        this._overrideNavigatorProperty('language', profile.language);
        this._overrideNavigatorProperty('languages', profile.languages);
        
        // Override các thuộc tính screen
        for (const [key, value] of Object.entries(profile.screen)) {
          this._overrideScreenProperty(key, value);
        }
        
        console.log('Đã áp dụng thông tin trình duyệt mới');
        return true;
      } catch (e) {
        console.error('Lỗi khi áp dụng thông tin trình duyệt:', e);
        return false;
      }
    },
    
    /**
     * Ghi đè thuộc tính của đối tượng navigator
     * @private
     */
    _overrideNavigatorProperty: function(property, value) {
      try {
        Object.defineProperty(Object.getPrototypeOf(navigator), property, {
          get: function() { return value; },
          configurable: true
        });
      } catch (e) {
        console.error(`Không thể ghi đè thuộc tính ${property}:`, e);
      }
    },
    
    /**
     * Ghi đè thuộc tính của đối tượng screen
     * @private
     */
    _overrideScreenProperty: function(property, value) {
      try {
        Object.defineProperty(screen, property, {
          get: function() { return value; },
          configurable: true
        });
      } catch (e) {
        console.error(`Không thể ghi đè thuộc tính screen.${property}:`, e);
      }
    },
    
    /**
     * Khôi phục thông tin trình duyệt gốc
     */
    restoreOriginalProfile: function() {
      try {
        if (this.originalUserAgent) {
          this._overrideNavigatorProperty('userAgent', this.originalUserAgent);
        }
        
        console.log('Đã khôi phục thông tin trình duyệt gốc');
        return true;
      } catch (e) {
        console.error('Lỗi khi khôi phục thông tin trình duyệt:', e);
        return false;
      }
    },
    
    /**
     * Lưu thông tin vào localStorage
     * @param {string} key Khóa
     * @param {*} value Giá trị
     */
    saveToStorage: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Lỗi khi lưu vào localStorage:', e);
        return false;
      }
    },
    
    /**
     * Đọc thông tin từ localStorage
     * @param {string} key Khóa
     * @param {*} defaultValue Giá trị mặc định nếu không tìm thấy
     * @return {*} Giá trị
     */
    getFromStorage: function(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('Lỗi khi đọc từ localStorage:', e);
        return defaultValue;
      }
    },
    
    /**
     * Xóa thông tin từ localStorage
     * @param {string} key Khóa
     */
    removeFromStorage: function(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error('Lỗi khi xóa từ localStorage:', e);
        return false;
      }
    },
    
    /**
     * Tạo timeout với Promise
     * @param {number} ms Thời gian chờ (ms)
     * @return {Promise} Promise
     */
    sleep: function(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    /**
     * Định dạng thời gian
     * @param {Date} date Đối tượng Date
     * @return {string} Thời gian định dạng
     */
    formatDate: function(date = new Date()) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    },
    
    /**
     * Tạo dữ liệu cho việc chống phát hiện
     * @return {Object} Dữ liệu chống phát hiện
     */
    generateAntiDetectionData: function() {
      return {
        // Thông tin kỹ thuật ngẫu nhiên
        webgl: {
          vendor: Math.random() > 0.5 ? 'Google Inc.' : 'NVIDIA Corporation',
          renderer: Math.random() > 0.5 ? 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1070 Direct3D11 vs_5_0 ps_5_0)' : 'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)'
        },
        canvas: {
          noise: Math.random() > 0.5,
          noiseFactor: Math.random() * 0.1
        },
        // Giả lập tương tác người dùng
        interaction: {
          mouseMovements: Math.floor(Math.random() * 50) + 50,
          clicks: Math.floor(Math.random() * 10) + 5,
          scrolls: Math.floor(Math.random() * 15) + 5
        }
      };
    },
    
    /**
     * Chuẩn hóa URL và loại bỏ các tham số theo dõi
     * @param {string} url URL cần chuẩn hóa
     * @return {string} URL đã chuẩn hóa
     */
    normalizeUrl: function(url) {
      try {
        // Tạo đối tượng URL
        const urlObj = new URL(url);
        
        // Danh sách các tham số theo dõi cần loại bỏ
        const trackingParams = [
          'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
          'fbclid', 'gclid', 'msclkid', 'dclid', 'zanpid', 'igshid',
          'ref', 'referrer', 'source', 'origin', '_ga'
        ];
        
        // Loại bỏ các tham số theo dõi
        trackingParams.forEach(param => {
          urlObj.searchParams.delete(param);
        });
        
        // Chuyển đổi lại thành chuỗi
        return urlObj.toString();
      } catch (e) {
        console.error('Lỗi khi chuẩn hóa URL:', e);
        return url;
      }
    },
    
    /**
     * Tạo thông tin người dùng ngẫu nhiên
     * @return {Object} Thông tin người dùng
     */
    generateUserInfo: function() {
      const firstNames = [
        'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Huynh', 'Vu', 'Phan', 'Truong', 'Bui',
        'John', 'Mary', 'James', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'
      ];
      
      const lastNames = [
        'An', 'Binh', 'Cuong', 'Dung', 'Em', 'Giang', 'Hai', 'Hung', 'Khanh', 'Linh',
        'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'
      ];
      
      const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      
      const year = Math.floor(Math.random() * 30) + 1970;
      const emailUser = `${firstName.toLowerCase()}${lastName.toLowerCase()}${year % 100}`;
      const email = `${emailUser}@${domain}`;
      
      return {
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`,
        email: email,
        birthYear: year,
        username: emailUser,
        password: this.generateRandomString(12)
      };
    },
    
    /**
     * Đếm số lượng cookies hiện tại
     * @return {Promise<number>} Số lượng cookies
     */
    countCookies: async function() {
      return new Promise((resolve, reject) => {
        try {
          chrome.cookies.getAll({}, cookies => {
            resolve(cookies.length);
          });
        } catch (e) {
          console.error('Lỗi khi đếm cookies:', e);
          resolve(0);
        }
      });
    },
    
    /**
     * Xóa tất cả cookies
     * @return {Promise<boolean>} Kết quả
     */
    clearAllCookies: async function() {
      return new Promise((resolve, reject) => {
        try {
          chrome.cookies.getAll({}, cookies => {
            for (const cookie of cookies) {
              const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
              chrome.cookies.remove({url: url, name: cookie.name});
            }
            resolve(true);
          });
        } catch (e) {
          console.error('Lỗi khi xóa cookies:', e);
          resolve(false);
        }
      });
    }
  };
  
  // Thêm vào object window
  window.CookieUtil = CookieUtil;
})(window); 