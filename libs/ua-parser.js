/**
 * UA-Parser.js - Phiên bản nhẹ cho extension
 * Phân tích User-Agent và cung cấp thông tin về trình duyệt, hệ điều hành, và thiết bị
 */

(function (window) {
  'use strict';

  const UAParser = function (ua) {
    // Khởi tạo với UA mặc định là UA hiện tại
    this.ua = ua || (window && window.navigator && window.navigator.userAgent ? window.navigator.userAgent : '');
    this._ua = this.ua;
  };

  // Các regex để phân tích UA
  const REGEXES = {
    // Hệ điều hành
    os: {
      windows: { regex: /Windows NT\s([\d.]+)/ },
      ios: { regex: /\b(iPhone|iPad|iPod)\b.*OS\s([\d_]+)/ },
      android: { regex: /\bAndroid\s([\d.]+)/ },
      mac: { regex: /\bMac\sOS\sX\s([\d_]+)/ },
      linux: { regex: /\bLinux\b/ }
    },
    // Trình duyệt
    browser: {
      chrome: { regex: /\bChrome\/([\d.]+)/ },
      firefox: { regex: /\bFirefox\/([\d.]+)/ },
      safari: { regex: /\bSafari\/([\d.]+)/ },
      edge: { regex: /\bEdg(?:e|A|iOS)\/([\d.]+)/ },
      ie: { regex: /\b(?:MSIE|IE|Trident)(?:\s|\/)([\d.]+)/ },
      opera: { regex: /\b(?:Opera|OPR)\/([\d.]+)/ }
    },
    // Thiết bị
    device: {
      mobile: { regex: /\b(?:Mobile|Android|iPhone|iPad|iPod)\b/ },
      tablet: { regex: /\b(?:Tablet|iPad)\b/ }
    }
  };

  UAParser.prototype.getResult = function () {
    return {
      ua: this._ua,
      browser: this.getBrowser(),
      os: this.getOS(),
      device: this.getDevice(),
      cpu: this.getCPU()
    };
  };

  UAParser.prototype.getBrowser = function () {
    const browser = {
      name: undefined,
      version: undefined
    };

    for (const key in REGEXES.browser) {
      const match = REGEXES.browser[key].regex.exec(this._ua);
      if (match) {
        browser.name = key;
        browser.version = match[1].replace(/_/g, '.');
        break;
      }
    }

    // Nếu không tìm thấy, thử phát hiện dựa trên engine
    if (!browser.name) {
      if (this._ua.indexOf('Chrome') > -1) {
        browser.name = 'Chrome';
      } else if (this._ua.indexOf('Safari') > -1) {
        browser.name = 'Safari';
      } else if (this._ua.indexOf('Firefox') > -1) {
        browser.name = 'Firefox';
      } else if (this._ua.indexOf('MSIE') > -1 || this._ua.indexOf('Trident') > -1) {
        browser.name = 'IE';
      }
    }

    return browser;
  };

  UAParser.prototype.getOS = function () {
    const os = {
      name: undefined,
      version: undefined
    };

    for (const key in REGEXES.os) {
      const match = REGEXES.os[key].regex.exec(this._ua);
      if (match) {
        os.name = key;
        os.version = match[1] ? match[1].replace(/_/g, '.') : undefined;
        break;
      }
    }

    // Kiểm tra thêm nếu không tìm thấy
    if (!os.name) {
      if (this._ua.indexOf('Win') > -1) {
        os.name = 'Windows';
      } else if (this._ua.indexOf('Mac') > -1) {
        os.name = 'Mac';
      } else if (this._ua.indexOf('Linux') > -1) {
        os.name = 'Linux';
      } else if (this._ua.indexOf('Android') > -1) {
        os.name = 'Android';
      } else if (this._ua.indexOf('iOS') > -1 || /(iPhone|iPad|iPod)/.test(this._ua)) {
        os.name = 'iOS';
      }
    }

    return os;
  };

  UAParser.prototype.getDevice = function () {
    const device = {
      type: undefined,
      model: undefined,
      vendor: undefined
    };

    // Phát hiện thiết bị mobile
    if (REGEXES.device.mobile.regex.test(this._ua)) {
      device.type = 'mobile';
      
      // Phát hiện thiết bị cụ thể
      if (this._ua.indexOf('iPhone') > -1) {
        device.model = 'iPhone';
        device.vendor = 'Apple';
      } else if (this._ua.indexOf('iPad') > -1) {
        device.type = 'tablet';
        device.model = 'iPad';
        device.vendor = 'Apple';
      } else if (this._ua.indexOf('Samsung') > -1) {
        device.vendor = 'Samsung';
      } else if (this._ua.indexOf('Huawei') > -1) {
        device.vendor = 'Huawei';
      } else if (this._ua.indexOf('Xiaomi') > -1) {
        device.vendor = 'Xiaomi';
      } else if (this._ua.indexOf('OPPO') > -1) {
        device.vendor = 'OPPO';
      }
    }
    // Phát hiện tablet
    else if (REGEXES.device.tablet.regex.test(this._ua)) {
      device.type = 'tablet';
    }
    // Mặc định là desktop
    else {
      device.type = 'desktop';
    }

    return device;
  };

  UAParser.prototype.getCPU = function () {
    const cpu = {
      architecture: undefined
    };

    // Phát hiện kiến trúc CPU
    if (this._ua.indexOf('x86_64') > -1 || this._ua.indexOf('x64') > -1 || this._ua.indexOf('Win64') > -1) {
      cpu.architecture = 'x64';
    } else if (this._ua.indexOf('x86') > -1 || this._ua.indexOf('WOW64') > -1) {
      cpu.architecture = 'x86';
    } else if (this._ua.indexOf('arm') > -1 || this._ua.indexOf('ARM') > -1) {
      cpu.architecture = 'arm';
    } else if (this._ua.indexOf('aarch64') > -1) {
      cpu.architecture = 'arm64';
    }

    return cpu;
  };

  UAParser.prototype.setUA = function (ua) {
    this._ua = typeof ua === 'string' ? ua : (window && window.navigator && window.navigator.userAgent ? window.navigator.userAgent : '');
    return this;
  };

  // Thêm vào object window
  window.UAParser = UAParser;
})(window); 