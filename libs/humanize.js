/**
 * Humanize.js - Công cụ mô phỏng hành vi người dùng
 * Hỗ trợ cho extension Cookie Generator
 * Mô phỏng di chuyển chuột, nhấp chuột và nhập văn bản
 */

(function(window) {
  'use strict';

  const Humanize = function() {
    // Cấu hình mặc định
    this.config = {
      mouseMoveSpeed: { min: 50, max: 150 },  // Tốc độ di chuyển chuột (px/giây)
      mouseJitter: 2,                          // Độ lệch ngẫu nhiên khi di chuyển chuột
      typingSpeed: { min: 100, max: 300 },     // Tốc độ gõ (ms giữa các ký tự)
      typingErrors: 0.03,                      // Tỷ lệ lỗi khi gõ
      clickDelay: { min: 50, max: 200 },       // Độ trễ nhấp chuột (ms)
      humanFactors: {
        pauseProbability: 0.1,                 // Xác suất tạm dừng khi di chuyển
        pauseDuration: { min: 200, max: 1000 }, // Thời gian tạm dừng (ms)
        naturalCurve: true                     // Tạo đường cong tự nhiên khi di chuyển chuột
      }
    };
  };

  /**
   * Tạo số ngẫu nhiên trong khoảng
   */
  Humanize.prototype._random = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * Tạo độ trễ ngẫu nhiên
   */
  Humanize.prototype._delay = function(min, max) {
    const delay = this._random(min, max);
    return new Promise(resolve => setTimeout(resolve, delay));
  };

  /**
   * Tính toán các điểm trung gian cho đường cong Bezier
   */
  Humanize.prototype._bezierCurve = function(start, end, numPoints) {
    const points = [];
    // Tạo điểm kiểm soát ngẫu nhiên để tạo đường cong tự nhiên
    const ctrl1 = {
      x: start.x + (end.x - start.x) / 3 + this._random(-50, 50),
      y: start.y + (end.y - start.y) / 3 + this._random(-50, 50)
    };
    const ctrl2 = {
      x: start.x + 2 * (end.x - start.x) / 3 + this._random(-50, 50),
      y: start.y + 2 * (end.y - start.y) / 3 + this._random(-50, 50)
    };
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const u = 1 - t;
      // Công thức đường cong Bezier bậc 3
      const x = Math.pow(u, 3) * start.x + 
                3 * Math.pow(u, 2) * t * ctrl1.x +
                3 * u * Math.pow(t, 2) * ctrl2.x +
                Math.pow(t, 3) * end.x;
      const y = Math.pow(u, 3) * start.y + 
                3 * Math.pow(u, 2) * t * ctrl1.y +
                3 * u * Math.pow(t, 2) * ctrl2.y +
                Math.pow(t, 3) * end.y;
      points.push({ x: Math.round(x), y: Math.round(y) });
    }
    return points;
  };

  /**
   * Tạo các điểm di chuyển chuột giữa hai vị trí
   */
  Humanize.prototype._createMousePath = function(start, end) {
    // Tính khoảng cách
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Số lượng điểm phụ thuộc vào khoảng cách
    const speed = this._random(this.config.mouseMoveSpeed.min, this.config.mouseMoveSpeed.max);
    const duration = distance / speed * 1000; // Chuyển từ pixel/giây sang thời gian (ms)
    const numPoints = Math.max(5, Math.floor(duration / 50)); // Ít nhất 5 điểm
    
    let points;
    if (this.config.humanFactors.naturalCurve) {
      // Sử dụng đường cong Bezier để tạo đường đi tự nhiên
      points = this._bezierCurve(start, end, numPoints);
    } else {
      // Đường thẳng với một số jitter
      points = [];
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const jitterX = this._random(-this.config.mouseJitter, this.config.mouseJitter);
        const jitterY = this._random(-this.config.mouseJitter, this.config.mouseJitter);
        
        points.push({
          x: Math.round(start.x + dx * t + jitterX),
          y: Math.round(start.y + dy * t + jitterY)
        });
      }
    }
    
    // Thêm tạm dừng ngẫu nhiên để giống người thật
    const pausePoints = [];
    let lastPauseIndex = -1;
    
    for (let i = 0; i < points.length; i++) {
      pausePoints.push(points[i]);
      
      // Kiểm tra xem có nên tạm dừng hay không
      if (i > lastPauseIndex + 5 && // Ít nhất 5 điểm sau lần tạm dừng cuối
          i < points.length - 5 && // Không tạm dừng gần điểm cuối
          Math.random() < this.config.humanFactors.pauseProbability) {
        
        // Thêm điểm tạm dừng (giữ nguyên vị trí)
        const pauseDuration = this._random(
          this.config.humanFactors.pauseDuration.min, 
          this.config.humanFactors.pauseDuration.max
        );
        const numPausePoints = Math.ceil(pauseDuration / 50); // 50ms per point
        
        for (let j = 0; j < numPausePoints; j++) {
          pausePoints.push({ ...points[i], pause: true });
        }
        
        lastPauseIndex = i;
      }
    }
    
    return pausePoints;
  };

  /**
   * Di chuyển chuột đến vị trí
   */
  Humanize.prototype.mouseMoveTo = async function(target) {
    // Lấy vị trí hiện tại của chuột
    let currentX = 0, currentY = 0;
    try {
      if (typeof window.mouseX !== 'undefined' && typeof window.mouseY !== 'undefined') {
        currentX = window.mouseX;
        currentY = window.mouseY;
      }
    } catch (e) {
      console.error('Không thể lấy vị trí chuột hiện tại:', e);
    }
    
    // Nếu target là phần tử DOM, lấy vị trí và kích thước
    let targetX, targetY;
    if (target instanceof Element) {
      const rect = target.getBoundingClientRect();
      // Trỏ vào vị trí ngẫu nhiên trong phần tử
      targetX = rect.left + this._random(5, rect.width - 5);
      targetY = rect.top + this._random(5, rect.height - 5);
    } else {
      targetX = target.x;
      targetY = target.y;
    }
    
    // Tạo đường di chuyển
    const path = this._createMousePath(
      { x: currentX, y: currentY },
      { x: targetX, y: targetY }
    );
    
    // Thực hiện di chuyển
    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      
      // Cập nhật vị trí chuột toàn cục
      try {
        window.mouseX = point.x;
        window.mouseY = point.y;
      } catch (e) {
        console.error('Không thể cập nhật vị trí chuột:', e);
      }
      
      // Kích hoạt sự kiện mousemove
      try {
        const moveEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: point.x,
          clientY: point.y,
          screenX: point.x,
          screenY: point.y
        });
        
        document.elementFromPoint(point.x, point.y)?.dispatchEvent(moveEvent);
        document.dispatchEvent(moveEvent);
      } catch (e) {
        console.error('Lỗi khi kích hoạt sự kiện mousemove:', e);
      }
      
      // Độ trễ giữa các điểm di chuyển
      await this._delay(40, 60);
    }
    
    return { x: targetX, y: targetY };
  };

  /**
   * Nhấp chuột vào vị trí
   */
  Humanize.prototype.mouseClick = async function(target) {
    // Di chuyển chuột đến vị trí trước
    const pos = await this.mouseMoveTo(target);
    
    // Độ trễ trước khi nhấp
    await this._delay(this.config.clickDelay.min, this.config.clickDelay.max);
    
    // Tạo sự kiện mousedown
    try {
      const downEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: pos.x,
        clientY: pos.y,
        screenX: pos.x,
        screenY: pos.y,
        button: 0,
        buttons: 1
      });
      
      const element = document.elementFromPoint(pos.x, pos.y);
      element?.dispatchEvent(downEvent);
    } catch (e) {
      console.error('Lỗi khi kích hoạt sự kiện mousedown:', e);
    }
    
    // Độ trễ trước khi thả
    await this._delay(50, 150);
    
    // Tạo sự kiện mouseup và click
    try {
      const upEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: pos.x,
        clientY: pos.y,
        screenX: pos.x,
        screenY: pos.y,
        button: 0,
        buttons: 0
      });
      
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: pos.x,
        clientY: pos.y,
        screenX: pos.x,
        screenY: pos.y,
        button: 0,
        buttons: 0
      });
      
      const element = document.elementFromPoint(pos.x, pos.y);
      element?.dispatchEvent(upEvent);
      element?.dispatchEvent(clickEvent);
      
      return element;
    } catch (e) {
      console.error('Lỗi khi kích hoạt sự kiện mouseup/click:', e);
      return null;
    }
  };

  /**
   * Gõ văn bản vào phần tử
   */
  Humanize.prototype.typeText = async function(element, text) {
    if (!element) {
      console.error('Không thể gõ: element không tồn tại');
      return false;
    }
    
    // Focus vào phần tử
    await this.mouseClick(element);
    element.focus();
    
    // Gõ từng ký tự
    for (let i = 0; i < text.length; i++) {
      // Xác định có lỗi gõ không
      if (Math.random() < this.config.typingErrors && i < text.length - 1) {
        // Gõ ký tự sai
        const wrongChar = String.fromCharCode(
          text.charCodeAt(i) + this._random(-2, 2)
        );
        
        await this._typeChar(element, wrongChar);
        await this._delay(200, 500);
        
        // Xóa ký tự sai
        await this._typeSpecialKey(element, 'Backspace');
        await this._delay(200, 400);
      }
      
      // Gõ ký tự đúng
      await this._typeChar(element, text[i]);
      
      // Độ trễ giữa các ký tự
      await this._delay(this.config.typingSpeed.min, this.config.typingSpeed.max);
      
      // Tạm dừng ngẫu nhiên khi gõ
      if (Math.random() < 0.1 && i < text.length - 1) {
        await this._delay(500, 2000);
      }
    }
    
    return true;
  };

  /**
   * Gõ một ký tự
   */
  Humanize.prototype._typeChar = async function(element, char) {
    // Tạo sự kiện keydown
    const keyCode = char.charCodeAt(0);
    try {
      const downEvent = new KeyboardEvent('keydown', {
        key: char,
        code: 'Key' + char.toUpperCase(),
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(downEvent);
    } catch (e) {
      console.error('Lỗi khi kích hoạt sự kiện keydown:', e);
    }
    
    // Tạo sự kiện keypress
    try {
      const pressEvent = new KeyboardEvent('keypress', {
        key: char,
        code: 'Key' + char.toUpperCase(),
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(pressEvent);
    } catch (e) {
      console.error('Lỗi khi kích hoạt sự kiện keypress:', e);
    }
    
    // Thêm ký tự vào phần tử
    try {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        const start = element.selectionStart || 0;
        const end = element.selectionEnd || 0;
        const value = element.value || '';
        
        element.value = value.substring(0, start) + char + value.substring(end);
        element.selectionStart = element.selectionEnd = start + 1;
        
        // Kích hoạt sự kiện input
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        element.dispatchEvent(inputEvent);
      }
    } catch (e) {
      console.error('Lỗi khi thêm ký tự vào phần tử:', e);
    }
    
    // Tạo sự kiện keyup
    try {
      const upEvent = new KeyboardEvent('keyup', {
        key: char,
        code: 'Key' + char.toUpperCase(),
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(upEvent);
    } catch (e) {
      console.error('Lỗi khi kích hoạt sự kiện keyup:', e);
    }
  };

  /**
   * Gõ phím đặc biệt (Enter, Backspace, etc.)
   */
  Humanize.prototype._typeSpecialKey = async function(element, keyName) {
    let keyCode;
    switch (keyName) {
      case 'Enter': keyCode = 13; break;
      case 'Backspace': keyCode = 8; break;
      case 'Tab': keyCode = 9; break;
      case 'Escape': keyCode = 27; break;
      case 'ArrowLeft': keyCode = 37; break;
      case 'ArrowUp': keyCode = 38; break;
      case 'ArrowRight': keyCode = 39; break;
      case 'ArrowDown': keyCode = 40; break;
      default: keyCode = 0;
    }
    
    // Tạo sự kiện keydown
    try {
      const downEvent = new KeyboardEvent('keydown', {
        key: keyName,
        code: keyName,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(downEvent);
    } catch (e) {
      console.error('Lỗi khi kích hoạt sự kiện keydown:', e);
    }
    
    // Xử lý đặc biệt cho từng loại phím
    try {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        const start = element.selectionStart || 0;
        const end = element.selectionEnd || 0;
        const value = element.value || '';
        
        if (keyName === 'Backspace') {
          if (start === end && start > 0) {
            element.value = value.substring(0, start - 1) + value.substring(end);
            element.selectionStart = element.selectionEnd = start - 1;
          } else {
            element.value = value.substring(0, start) + value.substring(end);
            element.selectionStart = element.selectionEnd = start;
          }
        } else if (keyName === 'Enter' && element.tagName === 'TEXTAREA') {
          element.value = value.substring(0, start) + '\n' + value.substring(end);
          element.selectionStart = element.selectionEnd = start + 1;
        }
        
        // Kích hoạt sự kiện input
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        element.dispatchEvent(inputEvent);
      }
    } catch (e) {
      console.error('Lỗi khi xử lý phím đặc biệt:', e);
    }
    
    // Tạo sự kiện keyup
    try {
      const upEvent = new KeyboardEvent('keyup', {
        key: keyName,
        code: keyName,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(upEvent);
    } catch (e) {
      console.error('Lỗi khi kích hoạt sự kiện keyup:', e);
    }
  };

  /**
   * Cuộn trang
   */
  Humanize.prototype.scroll = async function(target) {
    let targetY;
    
    // Xác định vị trí cuộn
    if (typeof target === 'number') {
      targetY = target;
    } else if (target instanceof Element) {
      const rect = target.getBoundingClientRect();
      targetY = window.scrollY + rect.top - (window.innerHeight / 2);
    } else {
      return false;
    }
    
    // Lấy vị trí cuộn hiện tại
    const startY = window.scrollY;
    const distance = targetY - startY;
    
    // Số bước cuộn
    const duration = Math.min(1500, Math.abs(distance) * 2);
    const steps = Math.ceil(duration / 50);
    
    // Thực hiện cuộn
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      // Hàm easing để tạo hiệu ứng cuộn tự nhiên
      const factor = this._easeInOutCubic(t);
      const nextY = startY + distance * factor;
      
      window.scrollTo({
        top: nextY,
        behavior: 'auto'
      });
      
      // Kích hoạt sự kiện cuộn
      try {
        const scrollEvent = new Event('scroll', { bubbles: true });
        document.dispatchEvent(scrollEvent);
      } catch (e) {
        console.error('Lỗi khi kích hoạt sự kiện scroll:', e);
      }
      
      // Độ trễ giữa các bước
      await this._delay(40, 60);
    }
    
    return true;
  };

  /**
   * Hàm easing (làm mượt) cho cuộn
   */
  Humanize.prototype._easeInOutCubic = function(t) {
    return t < 0.5
      ? 4 * t * t * t
      : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };

  /**
   * Thiết lập cấu hình
   */
  Humanize.prototype.setConfig = function(config) {
    this.config = { ...this.config, ...config };
    return this;
  };

  // Thêm vào object window
  window.Humanize = Humanize;

  // Mở rộng cấu hình mặc định với các tùy chọn mới
  const defaultConfig = {
    mouseMoveSpeed: 800,    // px/giây
    mouseJitter: 100,       // px
    typingSpeed: 150,       // ms giữa các ký tự
    typingErrors: 0.05,     // tỷ lệ lỗi đánh máy (5%)
    clickDelay: 200,        // ms trước khi click
    pauseProbability: 0.2,  // xác suất tạm dừng (20%)
    pauseDuration: [500, 1500], // phạm vi thời gian tạm dừng
    naturalCurve: true,     // di chuyển chuột tự nhiên
    scrollSpeed: 1000,      // tốc độ cuộn (px/giây)
    scrollStyle: 'smooth',  // kiểu cuộn (smooth, stepped, instant)
    readingPauseProbability: 0.3, // xác suất tạm dừng khi đọc
    readingPauseDuration: [1000, 3000], // thời gian tạm dừng khi đọc
    attentionPoints: [],    // điểm chú ý tùy chỉnh
    activityProfile: 'balanced', // hồ sơ hoạt động (casual, balanced, focused)
    adaptiveTiming: true    // điều chỉnh thời gian dựa trên độ phức tạp của trang
  };

  /**
   * Đặt một hồ sơ hoạt động cụ thể
   * @param {string} profile - Loại hồ sơ hoạt động: 'casual', 'balanced', 'focused'
   */
  Humanize.setActivityProfile = function(profile) {
    if (!profile) return;
    
    switch(profile.toLowerCase()) {
      case 'casual':
        this.configure({
          mouseMoveSpeed: 600,
          mouseJitter: 150,
          typingSpeed: 200,
          pauseProbability: 0.3,
          pauseDuration: [800, 2000],
          readingPauseProbability: 0.4,
          readingPauseDuration: [1500, 4000],
          scrollSpeed: 800
        });
        break;
      case 'focused':
        this.configure({
          mouseMoveSpeed: 1000,
          mouseJitter: 70,
          typingSpeed: 100,
          pauseProbability: 0.15,
          pauseDuration: [300, 1000],
          readingPauseProbability: 0.2,
          readingPauseDuration: [500, 1500],
          scrollSpeed: 1200
        });
        break;
      case 'balanced':
      default:
        this.configure(defaultConfig);
        break;
    }
  };

  /**
   * Cuộn đến một vị trí cụ thể theo kiểu tự nhiên
   * @param {number} x - Vị trí cuộn theo trục X
   * @param {number} y - Vị trí cuộn theo trục Y
   * @param {Object} options - Tùy chọn cuộn bổ sung
   * @returns {Promise} Promise hoàn thành khi cuộn xong
   */
  Humanize.scrollTo = async function(x, y, options = {}) {
    const currentX = window.scrollX;
    const currentY = window.scrollY;
    const deltaX = x - currentX;
    const deltaY = y - currentY;
    
    return this.scrollBy(deltaX, deltaY, options);
  };

  /**
   * Cuộn đến một phần tử theo kiểu tự nhiên
   * @param {HTMLElement} element - Phần tử cần cuộn đến
   * @param {Object} options - Tùy chọn cuộn bổ sung
   * @returns {Promise} Promise hoàn thành khi cuộn xong
   */
  Humanize.scrollToElement = async function(element, options = {}) {
    if (!element) return Promise.resolve();
    
    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY + rect.top - (options.offset || 100);
    
    return this.scrollTo(window.scrollX, scrollY, options);
  };

  /**
   * Mô phỏng đọc nội dung
   * @param {HTMLElement} element - Phần tử có nội dung để đọc
   * @returns {Promise} Promise hoàn thành khi đọc xong
   */
  Humanize.readContent = async function(element) {
    if (!element) return Promise.resolve();
    
    // Đảm bảo phần tử nhìn thấy được
    await this.scrollToElement(element);
    
    // Tính thời gian đọc dựa trên độ dài nội dung
    const content = element.textContent || '';
    const wordCount = content.split(/\s+/).length;
    const readingTimeMs = Math.min(wordCount * 200, 10000); // Trung bình 200ms mỗi từ, tối đa 10s
    
    // Mô phỏng việc di chuyển mắt bằng cách di chuyển chuột
    const lines = Math.ceil(content.length / 50); // giả định 50 ký tự mỗi dòng
    const rect = element.getBoundingClientRect();
    const startX = rect.left + 20;
    const startY = rect.top + 20;
    const lineHeight = rect.height / Math.max(lines, 1);
    
    // Di chuyển chuột theo các dòng để mô phỏng đọc
    let currentY = startY;
    const linesToRead = Math.min(lines, 10); // Giới hạn số dòng để mô phỏng
    
    for (let i = 0; i < linesToRead; i++) {
      // Di chuyển đến đầu dòng
      await this.mouseMoveTo(startX, currentY);
      
      // Di chuyển qua dòng
      await this.mouseMoveTo(startX + rect.width * 0.8, currentY);
      
      // Tạm dừng mô phỏng đọc
      if (Math.random() < this.config.readingPauseProbability) {
        const pauseTime = this._randomInt(
          this.config.readingPauseDuration[0],
          this.config.readingPauseDuration[1]
        );
        await new Promise(resolve => setTimeout(resolve, pauseTime));
      }
      
      // Di chuyển xuống dòng tiếp theo
      currentY += lineHeight;
    }
    
    // Tạm dừng để mô phỏng thời gian đọc còn lại
    await new Promise(resolve => setTimeout(resolve, readingTimeMs));
    
    return Promise.resolve();
  };

  /**
   * Tương tác với một phần tử: di chuyển, hover và tùy chọn click
   * @param {HTMLElement} element - Phần tử để tương tác
   * @param {Object} options - Tùy chọn tương tác
   * @returns {Promise} Promise hoàn thành khi tương tác xong
   */
  Humanize.interactWithElement = async function(element, options = {}) {
    if (!element) return Promise.resolve();
    
    // Đặt tùy chọn mặc định
    const opts = {
      scroll: true,
      click: false,
      hoverTime: this._randomInt(300, 800),
      ...options
    };
    
    // Đảm bảo phần tử nhìn thấy được
    if (opts.scroll) {
      await this.scrollToElement(element);
    }
    
    // Di chuyển đến phần tử
    const rect = element.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    
    await this.mouseMoveTo(targetX, targetY);
    
    // Hover
    await new Promise(resolve => setTimeout(resolve, opts.hoverTime));
    
    // Click nếu được yêu cầu
    if (opts.click) {
      await this.mouseClick();
    }
    
    return Promise.resolve();
  };

  // Thêm một hàm tiện ích để tạo một chuỗi hành động phức tạp
  Humanize.createActionSequence = function() {
    const actions = [];
    const sequence = {
      addAction: function(action) {
        actions.push(action);
        return this;
      },
      moveTo: function(element) {
        return this.addAction(() => Humanize.interactWithElement(element, { click: false }));
      },
      click: function(element) {
        return this.addAction(() => Humanize.interactWithElement(element, { click: true }));
      },
      read: function(element) {
        return this.addAction(() => Humanize.readContent(element));
      },
      type: function(element, text) {
        return this.addAction(() => {
          return Humanize.interactWithElement(element, { click: true })
            .then(() => Humanize.type(text));
        });
      },
      pause: function(min, max) {
        const duration = max ? Humanize._randomInt(min, max) : min;
        return this.addAction(() => new Promise(resolve => setTimeout(resolve, duration)));
      },
      scroll: function(deltaY) {
        return this.addAction(() => Humanize.scrollBy(0, deltaY));
      },
      scrollToElement: function(element) {
        return this.addAction(() => Humanize.scrollToElement(element));
      },
      execute: async function() {
        for (const action of actions) {
          await action();
        }
      }
    };
    
    return sequence;
  };
})(window); 