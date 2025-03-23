/**
 * FingerprintJS - Advanced anti-bot detection
 * Phiên bản tối giản để sử dụng trong extension
 */

// Phiên bản nhẹ của FingerprintJS dành cho extension
(function (global) {
  const FingerprinterLocal = function () {
    this.components = {
      userAgent: true,
      language: true,
      colorDepth: true,
      deviceMemory: true,
      pixelRatio: true,
      hardwareConcurrency: true,
      screenResolution: true,
      availableScreenResolution: true,
      timezone: true,
      sessionStorage: true,
      localStorage: true,
      indexedDB: true,
      plugins: true,
      canvas: true,
      webgl: true,
      fonts: false, // Fonts có thể chậm
      audio: false  // Audio có thể tạo ra UI
    };
  };

  FingerprinterLocal.prototype = {
    get: function (options) {
      return new Promise((resolve, reject) => {
        try {
          setTimeout(() => {
            const components = this.getComponents();
            const fingerprint = this.x64hash128(components.map(pair => pair.value).join(''), 31);
            
            resolve({
              visitorId: fingerprint,
              components: components,
              version: '3.4.1'
            });
          }, 50); // Trì hoãn để không gây chú ý
        } catch (e) {
          reject(e);
        }
      });
    },
    
    getComponents: function () {
      const components = [];
      
      // User Agent
      components.push({
        key: 'userAgent',
        value: navigator.userAgent
      });
      
      // Ngôn ngữ
      components.push({
        key: 'language',
        value: navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || ''
      });
      
      // Màu
      components.push({
        key: 'colorDepth',
        value: window.screen.colorDepth || -1
      });
      
      // Bộ nhớ thiết bị
      components.push({
        key: 'deviceMemory',
        value: navigator.deviceMemory || -1
      });
      
      // Pixel Ratio
      components.push({
        key: 'pixelRatio',
        value: window.devicePixelRatio || -1
      });
      
      // CPU Cores
      components.push({
        key: 'hardwareConcurrency',
        value: navigator.hardwareConcurrency || -1
      });
      
      // Độ phân giải màn hình
      components.push({
        key: 'screenResolution',
        value: this.getScreenResolution()
      });
      
      // Màn hình khả dụng
      components.push({
        key: 'availableScreenResolution',
        value: this.getAvailableScreenResolution()
      });
      
      // Múi giờ
      components.push({
        key: 'timezone',
        value: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      // Session Storage
      components.push({
        key: 'sessionStorage',
        value: this.hasSessionStorage()
      });
      
      // Local Storage
      components.push({
        key: 'localStorage',
        value: this.hasLocalStorage()
      });
      
      // IndexedDB
      components.push({
        key: 'indexedDb',
        value: this.hasIndexedDB()
      });
      
      // Plugins
      if (this.components.plugins) {
        components.push({
          key: 'plugins',
          value: this.getPlugins()
        });
      }
      
      // Canvas
      if (this.components.canvas) {
        components.push({
          key: 'canvas',
          value: this.getCanvasFingerprint()
        });
      }
      
      // WebGL
      if (this.components.webgl) {
        components.push({
          key: 'webgl',
          value: this.getWebGLFingerprint()
        });
      }
      
      return components;
    },
    
    getScreenResolution: function () {
      if (window.screen.height && window.screen.width) {
        return [Math.max(window.screen.width, window.screen.height), Math.min(window.screen.width, window.screen.height)].join('x');
      }
      return '';
    },
    
    getAvailableScreenResolution: function () {
      if (window.screen.availHeight && window.screen.availWidth) {
        return [Math.max(window.screen.availWidth, window.screen.availHeight), Math.min(window.screen.availWidth, window.screen.availHeight)].join('x');
      }
      return '';
    },
    
    hasSessionStorage: function () {
      try {
        return !!window.sessionStorage;
      } catch(e) {
        return false;
      }
    },
    
    hasLocalStorage: function () {
      try {
        return !!window.localStorage;
      } catch(e) {
        return false;
      }
    },
    
    hasIndexedDB: function () {
      try {
        return !!window.indexedDB;
      } catch(e) {
        return false;
      }
    },
    
    getPlugins: function () {
      if (navigator.plugins && navigator.plugins.length) {
        const plugins = [];
        for (let i = 0; i < navigator.plugins.length; i++) {
          plugins.push(navigator.plugins[i].name);
        }
        return plugins.join('~');
      }
      return '';
    },
    
    getCanvasFingerprint: function () {
      try {
        // Tạo canvas với các hình ảnh
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 240;
        canvas.height = 140;
        ctx.textBaseline = "top";
        
        // Tạo một gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#F60");
        gradient.addColorStop(1, "#FF6");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Thêm một ít text
        ctx.fillStyle = "#069";
        ctx.font = "15px 'Arial'";
        ctx.fillText("Fingerprint.js", 10, 50);
        ctx.fillStyle = "#000";
        ctx.font = "normal 12px 'Arial'";
        
        // Chuyển thành base64 để hash
        return canvas.toDataURL();
      } catch (e) {
        return '';
      }
    },
    
    getWebGLFingerprint: function() {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          return '';
        }
        
        // Tạo thông tin về WebGL
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = gl.getParameter(debugInfo ? debugInfo.UNMASKED_VENDOR_WEBGL : gl.VENDOR);
        const renderer = gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
        
        return `${vendor}~${renderer}`;
      } catch (e) {
        return '';
      }
    },
    
    // Hàm băm MurmurHash3 (x64)
    x64hash128: function (key, seed) {
      // Giả mạo hash đơn giản cho phiên bản nhẹ
      let hash = 0;
      if (key.length === 0) return ('00000000' + Math.abs(hash).toString(16)).slice(-8);
      
      for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
      }
      
      // Tạo một chuỗi hash dài 32 ký tự
      hash = Math.abs(hash);
      let hashStr = hash.toString(16);
      while (hashStr.length < 8) hashStr = '0' + hashStr;
      
      // Mở rộng thành 32 ký tự
      const parts = [];
      for (let i = 0; i < 4; i++) {
        const part = (hash + i * 123456789) % 4294967296;
        let partStr = part.toString(16);
        while (partStr.length < 8) partStr = '0' + partStr;
        parts.push(partStr);
      }
      
      return parts.join('');
    }
  };

  // Tạo global object
  const fingerprinter = new FingerprinterLocal();
  global.FingerprintJS = {
    load: function() {
      return Promise.resolve(fingerprinter);
    }
  };
  
})(window); 