let spoofComplete = false;
let spoofingInProgress = false;

// Ghi đè các biến và hàm cũ để tránh xung đột
(function overrideDeprecatedFunctions() {
  // Thêm một thẻ script để ghi đè các hàm cũ trên trang
  try {
    const overrideScript = document.createElement('script');
    overrideScript.textContent = `
      // Ghi đè các hàm đã lỗi thời
      if (typeof handlePage === 'function') {
        console.warn('Cookie Generator: Phát hiện hàm handlePage cũ, đang ghi đè...');
        window.handlePage = function() { 
          console.warn('Cookie Generator: handlePage đã bị loại bỏ, sử dụng phiên bản mới');
          return Promise.resolve(false);
        };
      }
      
      if (typeof FingerprinterLocal !== 'undefined') {
        console.warn('Cookie Generator: Phát hiện FingerprinterLocal cũ, đang ghi đè...');
        window.FingerprinterLocal = function() {
          console.warn('Cookie Generator: FingerprinterLocal đã bị loại bỏ, sử dụng phiên bản mới');
          return {};
        };
      }
      
      // Thêm polyfill để tránh lỗi không tìm thấy CookieUtil
      if (typeof CookieUtil === 'undefined') {
        console.warn('Cookie Generator: Không tìm thấy CookieUtil, tạo phiên bản tạm thời...');
        window.CookieUtil = {
          extractMainDomain: function(hostname) {
            // Phiên bản đơn giản của hàm extractMainDomain
            return hostname.replace(/^www\\./, '');
          },
          generateRandomString: function(length) {
            // Tạo chuỗi ngẫu nhiên
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < (length || 10); i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
          },
          generateUserInfo: function() {
            // Tạo thông tin người dùng ngẫu nhiên
            return {
              firstName: 'John',
              lastName: 'Doe',
              fullName: 'John Doe',
              email: 'john.doe@example.com',
              username: 'johndoe'
            };
          }
        };
      }
      
      // Thêm polyfill để tránh lỗi không tìm thấy Humanize
      if (typeof Humanize === 'undefined') {
        console.warn('Cookie Generator: Không tìm thấy Humanize, tạo phiên bản tạm thời...');
        window.Humanize = function() {
          return {
            scroll: async function() {
              console.warn('Cookie Generator: Sử dụng phiên bản đơn giản của Humanize.scroll');
              return Promise.resolve();
            },
            mouseClick: async function() {
              console.warn('Cookie Generator: Sử dụng phiên bản đơn giản của Humanize.mouseClick');
              return Promise.resolve();
            },
            typeText: async function() {
              console.warn('Cookie Generator: Sử dụng phiên bản đơn giản của Humanize.typeText');
              return Promise.resolve();
            },
            sleep: async function(ms) {
              return new Promise(resolve => setTimeout(resolve, ms || 1000));
            }
          };
        };
        // Thêm các phương thức tĩnh
        window.Humanize.scroll = async function() {
          console.warn('Cookie Generator: Sử dụng phiên bản đơn giản của Humanize.scroll');
          return Promise.resolve();
        };
        window.Humanize.mouseClick = async function() {
          console.warn('Cookie Generator: Sử dụng phiên bản đơn giản của Humanize.mouseClick');
          return Promise.resolve();
        };
        window.Humanize.typeText = async function() {
          console.warn('Cookie Generator: Sử dụng phiên bản đơn giản của Humanize.typeText');
          return Promise.resolve();
        };
        window.Humanize.sleep = async function(ms) {
          return new Promise(resolve => setTimeout(resolve, ms || 1000));
        };
      }
    `;
    
    (document.head || document.documentElement).appendChild(overrideScript);
    setTimeout(() => overrideScript.remove(), 100);
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi ghi đè các hàm cũ', error);
  }
})();

// Phát hiện phiên bản cũ của extension và hiển thị thông báo
(function detectOldVersion() {
  // Kiểm tra các biến toàn cục trong DOM hiện tại
  console.log('Cookie Generator: Kiểm tra phiên bản cũ của extension...');
  
  try {
    const checkScript = document.createElement('script');
    checkScript.textContent = `
      (function() {
        // Gửi thông tin về biến toàn cục hiện có
        window.postMessage({
          from: 'cookiegen_check',
          action: 'check_old_version',
          data: {
            hasHandlePage: typeof handlePage === 'function',
            hasFingerprinterLocal: typeof FingerprinterLocal !== 'undefined',
            hasCookieUtil: typeof CookieUtil !== 'undefined',
            hasHumanize: typeof Humanize !== 'undefined'
          }
        }, '*');
      })();
    `;
    
    document.head.appendChild(checkScript);
    setTimeout(() => checkScript.remove(), 100);
    
    // Lắng nghe phản hồi
    window.addEventListener('message', function oldVersionListener(event) {
      if (event.source !== window) return;
      const message = event.data;
      
      if (message && message.from === 'cookiegen_check' && message.action === 'check_old_version') {
        // Gỡ bỏ listener
        window.removeEventListener('message', oldVersionListener);
        
        // Xử lý kết quả
        const data = message.data;
        if (data.hasHandlePage || data.hasFingerprinterLocal) {
          console.error('Cookie Generator: Phát hiện phiên bản cũ của extension:', data);
          
          // Thông báo cho người dùng
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
              action: 'show_notification',
              data: {
                title: 'Cookie Generator cần được làm mới',
                message: 'Phát hiện phiên bản cũ của extension, vui lòng làm mới trang hoặc khởi động lại trình duyệt'
              }
            }).catch(err => console.error('Không thể gửi thông báo', err));
          }
        } else {
          console.log('Cookie Generator: Không phát hiện phiên bản cũ');
        }
      }
    }, { once: false });
  } catch (e) {
    console.error('Cookie Generator: Lỗi khi kiểm tra phiên bản cũ', e);
  }
})();

// Trích xuất tên miền chính từ một hostname (thay cho CookieUtil.extractMainDomain)
function extractMainDomain(hostname) {
  // Loại bỏ www nếu có
  let domain = hostname.replace(/^www\./, '');
  
  // Các tên miền cấp cao nhất phổ biến
  const tldRegex = /\.(com|net|org|edu|gov|co|io|app|me|info|biz|xyz|dev|vn|jp|kr|cn|ru|eu|uk|de|fr|it|es|nl|au|ca|br|mx|in)$/i;
  
  // Kiểm tra xem có phải tên miền cấp cao nhất hay không
  const tldMatch = domain.match(tldRegex);
  if (tldMatch) {
    // Lấy phần tên miền cấp 2 + tên miền cấp cao nhất
    const parts = domain.split('.');
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }
  }
  
  return domain;
}

/**
 * Helper: Tạm dừng thực thi trong một khoảng thời gian
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mô phỏng người dùng thực hiện các thao tác trên trang web
 */
async function simulateUser() {
  console.log('Cookie Generator: Bắt đầu mô phỏng người dùng');
  
  try {
    // Kiểm tra thư viện humanize nếu có sẵn
    let hasHumanize = false;
    
    // Kiểm tra an toàn thông qua script
    try {
      const checkScript = document.createElement('script');
      checkScript.textContent = `
        window.postMessage({
          from: 'cookiegen_page',
          action: 'libraries_status',
          loaded: !!(window.Humanize && window.CookieUtil)
        }, '*');
      `;
      (document.head || document.documentElement).appendChild(checkScript);
      checkScript.remove();
      
      // Đợi phản hồi về trạng thái thư viện
      hasHumanize = await new Promise(resolve => {
        const listener = function(event) {
          if (event.source !== window) return;
          const message = event.data;
          
          if (message && message.from === 'cookiegen_page' && message.action === 'libraries_status') {
            window.removeEventListener('message', listener);
            return resolve(message.loaded);
          }
        };
        
        window.addEventListener('message', listener);
        
        // Timeout sau 1 giây
        setTimeout(() => {
          window.removeEventListener('message', listener);
          resolve(false);
        }, 1000);
      });
    } catch (e) {
      console.error('Cookie Generator: Lỗi khi kiểm tra thư viện', e);
      hasHumanize = false;
    }
    
    if (hasHumanize) {
      // Nếu có Humanize, sử dụng thông qua bridge
      console.log('Cookie Generator: Đã phát hiện Humanize, sử dụng mô phỏng nâng cao');
      await performUserSimulation();
    } else {
      // Nếu không có Humanize, sử dụng các phương thức giản lược
      console.log('Cookie Generator: Không tìm thấy Humanize, sử dụng mô phỏng đơn giản');
      
      // Thực hiện một số hành động giả lập
      await simulateScrolling();
      await simulateRandomClicks();
      
      // Giả lập điền form nếu có
      await simulateForms();
      
      // Đợi thêm một khoảng thời gian ngẫu nhiên
      await sleep(Math.random() * 3000 + 2000);
      
      // Thực hiện thêm vài tương tác cuối cùng
      await finalInteractions();
    }
    
    console.log('Cookie Generator: Đã hoàn thành mô phỏng người dùng');
    return true;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi mô phỏng người dùng', error);
    return false;
  }
}

/**
 * Mô phỏng cuộn trang
 */
async function simulateScrolling() {
  console.log('Cookie Generator: Mô phỏng cuộn trang');
  
  // Số lần cuộn
  const scrollCount = Math.floor(Math.random() * 10) + 5;
  
  for (let i = 0; i < scrollCount; i++) {
    // Tính toán khoảng cách cuộn ngẫu nhiên
    const scrollAmount = Math.floor(Math.random() * 300) + 100;
    
    // Cuộn xuống
    window.scrollBy({
      top: scrollAmount,
      behavior: 'smooth'
    });
    
    // Đợi một khoảng thời gian ngẫu nhiên
    await sleep(Math.random() * 1000 + 500);
  }
  
  // Đôi khi cuộn lên trên
  if (Math.random() > 0.7) {
    window.scrollBy({
      top: -Math.floor(Math.random() * 500) - 200,
      behavior: 'smooth'
    });
    await sleep(Math.random() * 800 + 300);
  }
}

/**
 * Mô phỏng nhấp chuột ngẫu nhiên
 */
async function simulateRandomClicks() {
  console.log('Cookie Generator: Mô phỏng nhấp chuột ngẫu nhiên');
  
  // Lấy các phần tử có thể nhấp
  const clickableElements = Array.from(document.querySelectorAll('a, button, [role="button"], [onclick], .btn, .button, input[type="submit"]'));
  
  // Lọc ra các phần tử có thể nhìn thấy
  const visibleElements = clickableElements.filter(el => {
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
  
  // Số lần nhấp
  const clickCount = Math.min(Math.floor(Math.random() * 3) + 1, visibleElements.length);
  
  for (let i = 0; i < clickCount; i++) {
    // Chọn một phần tử ngẫu nhiên để nhấp
    const randomIndex = Math.floor(Math.random() * visibleElements.length);
    const element = visibleElements[randomIndex];
    
    if (element) {
      try {
        // Thêm hiệu ứng highlight (nếu đã thêm CSS)
        element.classList.add('cookiegen-highlight');
        
        // Đợi một chút để hiển thị hiệu ứng highlight
        await sleep(500);
        
        // Chỉ nhấp nếu phần tử không phải link dẫn ra ngoài
        const href = element.getAttribute('href');
        if (!href || (href && !href.startsWith('http') && !href.startsWith('//') && href !== '#')) {
          element.click();
          console.log('Cookie Generator: Đã nhấp vào:', element.textContent || element.value || 'Phần tử không có văn bản');
          
          // Đợi sau khi nhấp
          await sleep(Math.random() * 1500 + 1000);
        } else {
          console.log('Cookie Generator: Bỏ qua nhấp vào liên kết ngoài:', href);
        }
        
        // Xóa hiệu ứng highlight
        element.classList.remove('cookiegen-highlight');
        
        // Xóa phần tử khỏi danh sách để không nhấp lại
        visibleElements.splice(randomIndex, 1);
      } catch (error) {
        console.error('Cookie Generator: Lỗi khi nhấp vào phần tử', error);
      }
    }
    
    // Đợi giữa các lần nhấp
    await sleep(Math.random() * 2000 + 1000);
  }
}

/**
 * Mô phỏng điền form
 */
async function simulateForms() {
  console.log('Cookie Generator: Mô phỏng điền form');
  
  // Tìm tất cả các form trên trang
  const forms = document.querySelectorAll('form');
  
  if (forms.length === 0) {
    console.log('Cookie Generator: Không tìm thấy form nào trên trang');
    return;
  }
  
  // Chọn một form ngẫu nhiên
  const randomForm = forms[Math.floor(Math.random() * forms.length)];
  
  // Tìm các trường nhập liệu
  const inputs = randomForm.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea');
  
  if (inputs.length === 0) {
    console.log('Cookie Generator: Form không có trường nhập liệu');
    return;
  }
  
  // Tạo thông tin người dùng ngẫu nhiên
  const userInfo = generateRandomUserInfo();
  
  // Điền vào các trường
  for (const input of inputs) {
    try {
      // Highlight trường đang điền
      input.classList.add('cookiegen-highlight');
      
      // Đợi một lúc
      await sleep(Math.random() * 800 + 200);
      
      // Xác định kiểu trường và điền giá trị phù hợp
      const type = input.getAttribute('type') || 'text';
      const name = input.getAttribute('name') || '';
      const id = input.getAttribute('id') || '';
      const placeholder = input.getAttribute('placeholder') || '';
      
      let value = '';
      
      // Kiểm tra kiểu trường
      if (type === 'email' || name.includes('email') || id.includes('email') || placeholder.includes('email')) {
        value = userInfo.email;
      } else if (type === 'password' || name.includes('pass') || id.includes('pass') || placeholder.includes('pass')) {
        value = userInfo.password;
      } else if (name.includes('name') || id.includes('name') || placeholder.includes('name')) {
        if (name.includes('first') || id.includes('first') || placeholder.includes('first')) {
          value = userInfo.firstName;
        } else if (name.includes('last') || id.includes('last') || placeholder.includes('last')) {
          value = userInfo.lastName;
        } else {
          value = userInfo.firstName + ' ' + userInfo.lastName;
        }
      } else if (name.includes('user') || id.includes('user') || placeholder.includes('user')) {
        value = userInfo.username;
      } else if (type === 'tel' || name.includes('phone') || id.includes('phone') || placeholder.includes('phone')) {
        value = '0' + Math.floor(Math.random() * 900000000 + 100000000);
      } else if (type === 'checkbox' || type === 'radio') {
        if (Math.random() > 0.5) {
          input.checked = true;
        }
        continue; // Không cần điền giá trị
      } else {
        // Trường văn bản khác, điền ngẫu nhiên
        value = generateRandomString(Math.floor(Math.random() * 10) + 5);
      }
      
      // Điền giá trị
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      
      console.log(`Cookie Generator: Đã điền "${value}" vào trường ${name || id || 'không tên'}`);
      
      // Bỏ highlight
      input.classList.remove('cookiegen-highlight');
      
      // Đợi giữa các lần điền
      await sleep(Math.random() * 1000 + 500);
    } catch (error) {
      console.error('Cookie Generator: Lỗi khi điền vào trường', error);
    }
  }
  
  // Đôi khi nhấn nút submit
  if (Math.random() > 0.3) {
    const submitButtons = randomForm.querySelectorAll('button[type="submit"], input[type="submit"], button:not([type]), [type="button"][value*="submit" i], [type="button"][value*="sign" i]');
    
    if (submitButtons.length > 0) {
      const submitButton = submitButtons[0];
      console.log('Cookie Generator: Nhấn nút gửi form');
      
      // Highlight nút
      submitButton.classList.add('cookiegen-highlight');
      await sleep(800);
      
      // Nhấn nút
      submitButton.click();
      
      // Bỏ highlight
      submitButton.classList.remove('cookiegen-highlight');
      
      // Đợi sau khi gửi form
      await sleep(Math.random() * 2000 + 1000);
    }
  }
}

/**
 * Thực hiện các tương tác cuối cùng
 */
async function finalInteractions() {
  console.log('Cookie Generator: Thực hiện các tương tác cuối cùng');
  
  // Cuộn lên đầu trang
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await sleep(Math.random() * 1000 + 500);
  
  // Cuộn xuống một chút
  window.scrollBy({ top: 200, behavior: 'smooth' });
  await sleep(Math.random() * 1000 + 500);
  
  // Thực hiện một vài tương tác với các phần tử có thể nhìn thấy
  const elements = Array.from(document.querySelectorAll('img, h1, h2, h3, p')).filter(el => {
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
  
  if (elements.length > 0) {
    // Chọn một phần tử ngẫu nhiên
    const element = elements[Math.floor(Math.random() * elements.length)];
    
    // Highlight phần tử
    element.classList.add('cookiegen-highlight');
    await sleep(800);
    element.classList.remove('cookiegen-highlight');
  }
  
  // Đôi khi thực hiện thêm một vài tương tác phụ
  if (Math.random() > 0.5) {
    const additionalActions = [
      async () => {
        // Mô phỏng hover trên một menu
        const menus = document.querySelectorAll('nav, [role="navigation"], .menu, .nav');
        if (menus.length > 0) {
          const menu = menus[Math.floor(Math.random() * menus.length)];
          menu.classList.add('cookiegen-highlight');
          await sleep(1000);
          menu.classList.remove('cookiegen-highlight');
        }
      },
      async () => {
        // Chọn vùng văn bản ngẫu nhiên
        const paragraphs = document.querySelectorAll('p');
        if (paragraphs.length > 0) {
          const paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
          
          // Chọn một đoạn văn bản
          paragraph.classList.add('cookiegen-highlight');
          await sleep(800);
          paragraph.classList.remove('cookiegen-highlight');
        }
      }
    ];
    
    // Thực hiện một hành động phụ ngẫu nhiên
    const randomAction = additionalActions[Math.floor(Math.random() * additionalActions.length)];
    await randomAction();
  }
  
  // Thêm một chút thời gian chờ ở cuối
  await sleep(Math.random() * 2000 + 1000);
}

/**
 * Giả mạo browser fingerprint - Phiên bản rút gọn không phụ thuộc vào thư viện bên ngoài
 */
function spoofBrowserFingerprint() {
  try {
    console.log('Cookie Generator: Đang giả mạo browser fingerprint');
    
    // Tạo script để chèn vào trang
    const fingerprintScript = document.createElement('script');
    fingerprintScript.textContent = `
      (function() {
        try {
          // Khởi tạo biến theo dõi fingerprint đã được giả mạo
          window.COOKIEGEN_FINGERPRINT_SPOOFED = false;
          
          // Ghi đè phương thức Canvas
          const originalGetContext = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function() {
            const context = originalGetContext.apply(this, arguments);
            if (context && arguments[0] === '2d') {
              const originalFillText = context.fillText;
              context.fillText = function() {
                // Thêm nhiễu nhỏ vào hình ảnh khi vẽ text
                arguments[1] += Math.random() * 0.1 - 0.05;
                arguments[2] += Math.random() * 0.1 - 0.05; 
                return originalFillText.apply(this, arguments);
              };
              
              const originalGetImageData = context.getImageData;
              context.getImageData = function() {
                const imageData = originalGetImageData.apply(this, arguments);
                // Thêm nhiễu vào dữ liệu hình ảnh
                for (let i = 0; i < imageData.data.length; i += 4) {
                  const noise = Math.floor(Math.random() * 2);
                  imageData.data[i] += noise;      // Red
                  imageData.data[i + 1] += noise;  // Green
                  imageData.data[i + 2] += noise;  // Blue
                }
                return imageData;
              };
            }
            return context;
          };
          
          // Ghi đè WebGL
          if (window.WebGLRenderingContext) {
            const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
              // Trả về dữ liệu ngẫu nhiên cho một số thông số WebGL
              if (parameter === 37445 || parameter === 37446) {
                return "NVIDIA";
              }
              return originalGetParameter.apply(this, arguments);
            };
          }
          
          console.log('Cookie Generator: Đã giả mạo browser fingerprint thành công');
          window.COOKIEGEN_FINGERPRINT_SPOOFED = true;
        } catch (error) {
          console.error('Cookie Generator: Lỗi khi giả mạo fingerprint', error);
        }
      })();
    `;
    
    // Chèn script vào trang
    document.documentElement.appendChild(fingerprintScript);
    fingerprintScript.remove();
    
    return true;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi giả mạo browser fingerprint', error);
    return false;
  }
}

// Chèn thư viện vào trang
function injectLibraries() {
  console.log('Cookie Generator: Chèn thư viện vào trang web');
  
  try {
    // Thêm CSS nếu cần
    const style = document.createElement('style');
    style.textContent = `
      /* CSS cho các tương tác của extension */
      .cookiegen-highlight {
        position: relative;
        z-index: 9999;
        box-shadow: 0 0 5px 2px rgba(66, 133, 244, 0.5) !important;
        transition: box-shadow 0.3s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    // Lấy đường dẫn đến các thư viện - sắp xếp theo thứ tự cần thiết
    const libraries = [
      // Tải util.js trước tiên vì các thư viện khác phụ thuộc vào nó
      { name: 'util.js', path: chrome.runtime.getURL('libs/util.js') },
      // Sau đó tải các thư viện còn lại
      { name: 'ua-parser.js', path: chrome.runtime.getURL('libs/ua-parser.js') },
      { name: 'fingerprint.js', path: chrome.runtime.getURL('libs/fingerprint.js') },
      { name: 'humanize.js', path: chrome.runtime.getURL('libs/humanize.js') }
    ];
    
    // Tải tuần tự các thư viện để đảm bảo thứ tự đúng
    return libraries.reduce((chain, lib) => {
      return chain.then(() => {
        return fetch(lib.path)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Không thể tải thư viện ${lib.name}: ${response.status} ${response.statusText}`);
            }
            return response.text();
          })
          .then(code => {
            // Tạo script element và chèn vào trang
            console.log(`Cookie Generator: Đang chèn thư viện ${lib.name}`);
            const script = document.createElement('script');
            script.textContent = code;
            (document.head || document.documentElement).appendChild(script);
            
            // Đợi một khoảng thời gian ngắn để script được xử lý
            return new Promise(resolve => {
              setTimeout(() => {
                script.remove();
                console.log(`Cookie Generator: Đã chèn thư viện ${lib.name}`);
                resolve();
              }, 100);
            });
          })
          .catch(error => {
            console.error(`Cookie Generator: Lỗi khi chèn thư viện ${lib.name}`, error);
            // Tiếp tục chuỗi Promise ngay cả khi có lỗi
            return Promise.resolve();
          });
      });
    }, Promise.resolve())
    .then(() => {
      console.log('Cookie Generator: Đã chèn tất cả thư viện');
      
      // Thêm biến toàn cục để đánh dấu thư viện đã được tải
      const initScript = document.createElement('script');
      initScript.textContent = `
        // Kiểm tra xem các thư viện có sẵn sàng không
        const libraryCheck = setInterval(() => {
          if (window.Humanize && window.CookieUtil) {
            clearInterval(libraryCheck);
            window.COOKIEGEN_LIBRARIES_LOADED = true;
            console.log('Cookie Generator: Các thư viện đã sẵn sàng');
            
            // Tạo một sự kiện tùy chỉnh để thông báo khi thư viện đã sẵn sàng
            const event = new CustomEvent('cookiegen_libraries_loaded');
            document.dispatchEvent(event);
            
            // Thông báo qua bridge
            if (window.cookiegenBridge) {
              window.cookiegenBridge.sendMessage('libraries_status', { loaded: true });
            } else {
              window.postMessage({
                from: 'cookiegen_page',
                action: 'libraries_status',
                loaded: true
              }, '*');
            }
          }
        }, 100);  // Kiểm tra mỗi 100ms
        
        // Đặt timeout để dừng kiểm tra sau 10 giây
        setTimeout(() => {
          clearInterval(libraryCheck);
          if (!window.COOKIEGEN_LIBRARIES_LOADED) {
            console.error('Cookie Generator: Không thể tải thư viện sau thời gian chờ');
            
            // Thông báo qua bridge
            if (window.cookiegenBridge) {
              window.cookiegenBridge.sendMessage('libraries_status', { 
                loaded: false,
                error: 'Timeout khi tải thư viện'
              });
            } else {
              window.postMessage({
                from: 'cookiegen_page',
                action: 'libraries_status',
                loaded: false,
                error: 'Timeout khi tải thư viện'
              }, '*');
            }
          }
        }, 10000);  // Chờ tối đa 10 giây
      `;
      (document.head || document.documentElement).appendChild(initScript);
      setTimeout(() => {
        initScript.remove();
      }, 100);
      
      return true;
    });
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi chèn thư viện', error);
    return Promise.reject(error);
  }
}

// Thêm CSS cho việc highlight phần tử
function addHighlightStyle() {
  if (document.getElementById('cookiegen-styles')) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'cookiegen-styles';
  styleElement.textContent = `
    .cookiegen-highlight {
      outline: 3px solid rgba(255, 82, 82, 0.8) !important;
      box-shadow: 0 0 10px rgba(255, 82, 82, 0.5) !important;
      transition: outline 0.3s, box-shadow 0.3s !important;
      position: relative !important;
      z-index: 9999 !important;
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Tạo bridge giữa content script và trang web
function createBridge() {
  console.log('Cookie Generator: Tạo bridge với trang web');
  
  // Thêm CSS styles cho highlight
  addHighlightStyle();
  
  // Đăng ký một listener cho các sự kiện từ trang web
  window.addEventListener('message', function(event) {
    // Chỉ xử lý tin nhắn từ cùng một trang
    if (event.source !== window) return;
    
    const message = event.data;
    
    // Kiểm tra nếu tin nhắn là từ extension của chúng ta
    if (message && message.from === 'cookiegen_page') {
      console.log('Cookie Generator: Nhận tin nhắn từ trang', message.action);
      
      switch (message.action) {
        case 'simulation_complete':
          // Xử lý khi mô phỏng từ thư viện hoàn thành
          spoofComplete = true;
          spoofingInProgress = false;
          console.log('Cookie Generator: Đã nhận thông báo hoàn thành từ trang');
          break;
          
        case 'simulation_error':
          // Xử lý khi có lỗi trong quá trình mô phỏng
          console.error('Cookie Generator: Lỗi khi mô phỏng:', message.error);
          spoofComplete = true; // Vẫn đánh dấu hoàn thành để không bị kẹt
          spoofingInProgress = false;
          break;
          
        case 'libraries_status':
          // Xử lý thông tin về trạng thái thư viện
          if (message.loaded) {
            console.log('Cookie Generator: Thư viện đã được tải trong trang');
          } else {
            console.error('Cookie Generator: Thư viện chưa được tải trong trang:', message.error);
          }
          break;
          
        case 'cookies_extracted':
          // Xử lý khi cookies được trích xuất từ trang
          console.log('Cookie Generator: Nhận cookies từ trang', message.cookies?.length || 0);
          
          // Gửi cookies về background script
          chrome.runtime.sendMessage({
            action: 'cookies_saved',
            data: {
              domain: window.location.hostname,
              cookies: message.cookies || [],
              timestamp: new Date().getTime(),
              url: window.location.href
            }
          }).catch(error => {
            console.error('Cookie Generator: Lỗi khi gửi cookies về background script', error);
          });
          break;
          
        case 'debug_log':
          // Nhận log từ trang để dễ dàng debug
          console.log('Trang:', message.log);
          break;
      }
    }
  });
  
  // Tạo một script để trang web có thể gửi tin nhắn cho content script
  const bridgeScript = `
    // Bridge để giao tiếp với content script
    window.cookiegenBridge = {
      // Gửi tin nhắn đến content script
      sendMessage: function(action, data) {
        window.postMessage({
          from: 'cookiegen_page',
          action: action,
          ...data
        }, '*');
      },
      
      // Debug log
      log: function(message) {
        console.log('Cookie Generator (Page):', message);
        this.sendMessage('debug_log', { log: message });
      },
      
      // Thông báo mô phỏng đã hoàn thành
      simulationComplete: function() {
        console.log('Cookie Generator (Page): Mô phỏng đã hoàn thành');
        this.sendMessage('simulation_complete');
      },
      
      // Thông báo lỗi khi mô phỏng
      simulationError: function(error) {
        console.error('Cookie Generator (Page): Lỗi khi mô phỏng', error);
        this.sendMessage('simulation_error', { error: error.toString() });
      },
      
      // Trích xuất và gửi cookies
      extractCookies: function() {
        try {
          const cookies = document.cookie.split(';').map(cookie => {
            const parts = cookie.trim().split('=');
            const name = parts[0];
            const value = parts.slice(1).join('=');
            return { name, value };
          });
          
          console.log('Cookie Generator (Page): Đã trích xuất', cookies.length, 'cookies');
          this.sendMessage('cookies_extracted', { cookies });
          return cookies.length;
        } catch (error) {
          console.error('Cookie Generator (Page): Lỗi khi trích xuất cookies', error);
          this.sendMessage('simulation_error', { error: 'Lỗi khi trích xuất cookies: ' + error.toString() });
          return 0;
        }
      },
      
      // Kiểm tra xem các thư viện đã được tải chưa
      checkLibraries: function() {
        const hasHumanize = typeof window.Humanize === 'function';
        const hasCookieUtil = typeof window.CookieUtil === 'object';
        
        console.log('Cookie Generator (Page): Kiểm tra thư viện - Humanize:', hasHumanize, 'CookieUtil:', hasCookieUtil);
        
        this.sendMessage('libraries_status', {
          loaded: hasHumanize && hasCookieUtil,
          status: {
            humanize: hasHumanize,
            cookieUtil: hasCookieUtil
          }
        });
        
        return hasHumanize && hasCookieUtil;
      }
    };
    
    // Thực hiện kiểm tra ngay
    setTimeout(() => {
      if (window.cookiegenBridge) {
        window.cookiegenBridge.checkLibraries();
      }
    }, 500);
    
    console.log('Cookie Generator: Bridge đã được khởi tạo');
  `;
  
  // Chèn bridge script vào trang
  const script = document.createElement('script');
  script.textContent = bridgeScript;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
  
  console.log('Cookie Generator: Đã tạo bridge với trang web');
}

// Thông báo khi content script đã được tải
console.log('Cookie Generator Content Script đã được tải');

// Khởi tạo bridge khi document đã sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Tạo bridge với trang
    createBridge();
    
    // Lắng nghe thông điệp từ background script
    console.log('Cookie Generator: Sẵn sàng nhận thông điệp từ background script');
  });
} else {
  // Tạo bridge ngay lập tức nếu trang đã tải xong
  createBridge();
  console.log('Cookie Generator: Sẵn sàng nhận thông điệp từ background script');
}

// Các hàm tiện ích để thay thế các phụ thuộc vào thư viện bên ngoài
function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Tạo thông tin người dùng ngẫu nhiên nếu CookieUtil không hoạt động
function generateRandomUserInfo() {
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Jessica', 'William', 'Jennifer'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson'];
  const domains = ['example.com', 'test.org', 'sample.net', 'demo.io', 'mail.com'];
  
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  
  const username = (randomFirstName + randomLastName).toLowerCase().substring(0, 12);
  const email = `${username}@${randomDomain}`;
  const password = `Pass${Math.floor(Math.random() * 10000)}!`;
  
  return {
    firstName: randomFirstName,
    lastName: randomLastName,
    fullName: `${randomFirstName} ${randomLastName}`,
    username: username,
    email: email,
    password: password
  };
}

/**
 * Thực hiện mô phỏng người dùng thông qua bridge
 */
async function performUserSimulation() {
  console.log('Cookie Generator: Thực hiện mô phỏng người dùng thông qua bridge');
  
  try {
    // Tạo script để thực hiện mô phỏng
    const script = document.createElement('script');
    script.textContent = `
      (async function() {
        try {
          console.log('Cookie Generator Page: Bắt đầu mô phỏng người dùng bên trong trang');
          
          // Kiểm tra xem Humanize có sẵn không
          if (typeof Humanize !== 'undefined') {
            // Sử dụng Humanize nếu có sẵn
            console.log('Cookie Generator Page: Sử dụng Humanize để mô phỏng');
            
            // Thực hiện các thao tác cuộn ngẫu nhiên
            await Humanize.scroll();
            
            // Thực hiện một số nhấp chuột ngẫu nhiên
            const clickableElements = document.querySelectorAll('a:not([href^="http"]), button:not([type="submit"]), [role="button"]');
            
            if (clickableElements.length > 0) {
              const randomIndex = Math.floor(Math.random() * clickableElements.length);
              const elementToClick = clickableElements[randomIndex];
              
              if (elementToClick) {
                await Humanize.mouseHover(elementToClick);
                await Humanize.sleep(800);
                await Humanize.mouseClick(elementToClick);
              }
            }
            
            // Đợt một khoảng thời gian
            await Humanize.sleep(1000);
            
            // Điền form nếu có
            const formElements = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
            
            if (formElements.length > 0) {
              const formElement = formElements[Math.floor(Math.random() * formElements.length)];
              
              if (formElement) {
                const randomText = CookieUtil && CookieUtil.generateRandomString ? 
                  CookieUtil.generateRandomString(8) : 
                  Math.random().toString(36).substring(2, 10);
                
                await Humanize.typeText(formElement, randomText);
              }
            }
          } else {
            // Nếu không có Humanize, sử dụng phương thức tự tạo
            console.log('Cookie Generator Page: Không tìm thấy Humanize, sử dụng mô phỏng đơn giản');
            
            // Cuộn trang
            function sleep(ms) {
              return new Promise(resolve => setTimeout(resolve, ms));
            }
            
            // Cuộn trang
            for (let i = 0; i < 5; i++) {
              window.scrollBy({
                top: Math.random() * 300 + 100,
                behavior: 'smooth'
              });
              await sleep(Math.random() * 1000 + 500);
            }
            
            // Nhấp vào một phần tử ngẫu nhiên
            const safeElements = Array.from(document.querySelectorAll('a, button'))
              .filter(el => {
                const href = el.getAttribute('href');
                return !href || (href && !href.startsWith('http') && !href.startsWith('//'));
              });
              
            if (safeElements.length > 0) {
              const element = safeElements[Math.floor(Math.random() * safeElements.length)];
              element.click();
              await sleep(1000);
            }
            
            // Điền vào một form nếu có
            const inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
            if (inputs.length > 0) {
              const input = inputs[Math.floor(Math.random() * inputs.length)];
              input.value = Math.random().toString(36).substring(2, 10);
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          
          console.log('Cookie Generator Page: Đã hoàn thành mô phỏng người dùng');
          
          // Thông báo đã hoàn thành
          window.postMessage({
            from: 'cookiegen_page',
            action: 'simulation_complete'
          }, '*');
          
        } catch (error) {
          console.error('Cookie Generator Page: Lỗi khi mô phỏng người dùng', error);
          
          // Thông báo lỗi
          window.postMessage({
            from: 'cookiegen_page',
            action: 'simulation_error',
            error: error.message
          }, '*');
        }
      })();
    `;
    
    // Chèn script vào trang
    (document.head || document.documentElement).appendChild(script);
    script.remove();
    
    // Đợi kết quả thông báo
    return new Promise((resolve, reject) => {
      // Đặt timeout để không đợi mãi mãi
      const timeout = setTimeout(() => {
        window.removeEventListener('message', messageListener);
        console.log('Cookie Generator: Đã hết thời gian đợi mô phỏng, coi như hoàn thành');
        resolve(true);
      }, 30000); // Timeout sau 30 giây
      
      // Lắng nghe thông báo từ trang
      const messageListener = function(event) {
        if (event.source !== window) return;
        const message = event.data;
        
        if (message && message.from === 'cookiegen_page') {
          if (message.action === 'simulation_complete') {
            clearTimeout(timeout);
            window.removeEventListener('message', messageListener);
            console.log('Cookie Generator: Đã nhận thông báo hoàn thành mô phỏng');
            resolve(true);
          } else if (message.action === 'simulation_error') {
            clearTimeout(timeout);
            window.removeEventListener('message', messageListener);
            console.warn('Cookie Generator: Lỗi khi mô phỏng người dùng:', message.error);
            resolve(false); // Vẫn resolve để tiếp tục quy trình
          }
        }
      };
      
      window.addEventListener('message', messageListener);
    });
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi thực hiện mô phỏng người dùng', error);
    return false;
  }
}

// Thực hiện lấy cookies thông qua bridge
function extractCookies() {
  try {
    console.log('Cookie Generator: Yêu cầu trích xuất cookies');
    
    // Gửi yêu cầu trích xuất cookies đến trang
    const script = document.createElement('script');
    script.textContent = `
      if (window.cookiegenBridge) {
        window.cookiegenBridge.extractCookies();
      }
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
    
    return true;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi trích xuất cookies', error);
    return false;
  }
}

/**
 * Mô phỏng trang web hiện tại
 * @returns {Promise<boolean>}
 */
async function spoofSite() {
  if (spoofingInProgress) {
    console.log('Cookie Generator: Đang trong quá trình mô phỏng, bỏ qua yêu cầu');
    return false;
  }

  spoofingInProgress = true;
  spoofComplete = false;

  try {
    // Lưu domain hiện tại vào storage
    try {
      const domain = extractMainDomain(window.location.hostname);
      console.log(`Cookie Generator: Bắt đầu mô phỏng trên domain ${domain}`);
      localStorage.setItem('cookiegen_last_domain', domain);
    } catch (domainError) {
      console.error('Cookie Generator: Lỗi khi xử lý domain', domainError);
      // Tiếp tục xử lý ngay cả khi có lỗi domain
    }

    // Tạo bridge kết nối với trang
    console.log('Cookie Generator: Tạo bridge với trang web...');
    createBridge();
    
    // Áp dụng spoofing cho fingerprint
    console.log('Cookie Generator: Áp dụng giả mạo fingerprint...');
    try {
      spoofBrowserFingerprint();
    } catch (fingerprintError) {
      console.error('Cookie Generator: Lỗi khi giả mạo fingerprint, tiếp tục xử lý', fingerprintError);
      // Tiếp tục xử lý ngay cả khi có lỗi fingerprint
    }

    // Thêm các thư viện vào trang
    console.log('Cookie Generator: Đang tải thư viện...');
    let librariesLoaded = false;
    try {
      librariesLoaded = await injectLibraries();
      console.log(`Cookie Generator: Trạng thái tải thư viện: ${librariesLoaded ? 'Thành công' : 'Thất bại'}`);
    } catch (libraryError) {
      console.error('Cookie Generator: Lỗi khi tải thư viện, tiếp tục với chức năng cơ bản', libraryError);
      // Tiếp tục xử lý ngay cả khi không tải được thư viện
    }

    // Thực hiện mô phỏng người dùng
    console.log('Cookie Generator: Đang mô phỏng người dùng...');
    try {
      await simulateUser();
      console.log('Cookie Generator: Hoàn thành mô phỏng người dùng');
    } catch (simulationError) {
      console.error('Cookie Generator: Lỗi khi mô phỏng người dùng, tiếp tục trích xuất cookie', simulationError);
      // Tiếp tục xử lý ngay cả khi mô phỏng thất bại
    }

    // Trích xuất cookie
    console.log('Cookie Generator: Đang trích xuất cookie...');
    try {
      const cookiesExtracted = await extractCookies();
      console.log(`Cookie Generator: Trạng thái trích xuất cookie: ${cookiesExtracted ? 'Thành công' : 'Thất bại'}`);
    } catch (cookieError) {
      console.error('Cookie Generator: Lỗi khi trích xuất cookie', cookieError);
    }

    // Đánh dấu đã hoàn thành
    spoofComplete = true;
    spoofingInProgress = false;
    
    console.log('Cookie Generator: Đã hoàn thành quy trình mô phỏng');
    return true;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi mô phỏng trang', error);
    
    // Đánh dấu đã hoàn thành kể cả khi có lỗi
    spoofComplete = true;
    spoofingInProgress = false;
    
    // Vẫn cố gắng trích xuất cookie ngay cả khi có lỗi
    try {
      console.log('Cookie Generator: Cố gắng trích xuất cookie sau lỗi...');
      await extractCookies();
    } catch (cookieError) {
      console.error('Cookie Generator: Không thể trích xuất cookie sau lỗi', cookieError);
    }
    
    return false;
  }
}

// Lắng nghe tin nhắn từ background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Cookie Generator: Nhận tin nhắn', message.action);
  
  if (message.action === 'save_cookies') {
    try {
      extractCookies();
      sendResponse({ success: true });
    } catch (error) {
      console.error('Cookie Generator: Lỗi khi lưu cookies', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  
  if (message.action === 'check_spoof_status') {
    console.log('Cookie Generator: Trạng thái spoofing:', spoofComplete, 'Đang xử lý:', spoofingInProgress);
    sendResponse({ 
      success: true, 
      completed: spoofComplete,
      inProgress: spoofingInProgress,
      domain: window.location.hostname
    });
    return true;
  }
  
  if (message.action === 'spoof_site') {
    console.log('Cookie Generator: Bắt đầu giả mạo theo yêu cầu');
    
    // Đặt lại trạng thái
    spoofComplete = false;
    
    // Bắt đầu quá trình giả mạo
    const result = spoofSite();
    
    // Trả về kết quả ban đầu
    sendResponse({ 
      success: result, 
      started: true,
      domain: window.location.hostname
    });
    
    return true;
  }
  
  if (message.action === 'start_process') {
    console.log('Cookie Generator: Nhận yêu cầu bắt đầu xử lý');
    
    // Bắt đầu xử lý nếu chưa đang trong quá trình xử lý
    if (!spoofingInProgress && !spoofComplete) {
      spoofSite();
      sendResponse({ success: true, started: true });
    } else {
      console.log('Cookie Generator: Không bắt đầu xử lý vì đang xử lý hoặc đã hoàn thành');
      sendResponse({ 
        success: false, 
        error: 'Đang xử lý hoặc đã hoàn thành',
        inProgress: spoofingInProgress,
        completed: spoofComplete
      });
    }
    
    return true;
  }
  
  if (message.action === 'reload_extension') {
    console.log('Cookie Generator: Đang tải lại extension...');
    // Xóa các biến toàn cục và lắng nghe sự kiện
    try {
      // Đặt lại trạng thái
      spoofComplete = false;
      spoofingInProgress = false;
      
      // Xóa event listeners không cần thiết
      // Thêm một thẻ script để xóa các biến toàn cục
      const cleanupScript = document.createElement('script');
      cleanupScript.textContent = `
        // Xóa các biến toàn cục do extension tạo ra
        window.COOKIEGEN_FINGERPRINT_SPOOFED = undefined;
        window.COOKIEGEN_LIBRARIES_LOADED = undefined;
        window.cookiegenBridge = undefined;
        
        // Xóa các listener do extension tạo ra
        document.removeEventListener('cookiegen_libraries_loaded', () => {});
        
        console.log('Cookie Generator: Đã xóa các biến toàn cục');
      `;
      document.head.appendChild(cleanupScript);
      setTimeout(() => cleanupScript.remove(), 100);
      
      // Thông báo cho người dùng
      sendResponse({ 
        success: true, 
        message: 'Đã đặt lại trạng thái extension, vui lòng làm mới trang để hoàn tất'
      });
    } catch (error) {
      console.error('Cookie Generator: Lỗi khi tải lại extension', error);
      sendResponse({ success: false, error: error.message });
    }
    
    return true;
  }
  
  return false;
});
