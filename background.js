// Cài đặt mặc định
let settings = {
  blockMedia: false,
  showActiveTab: false,
  keepTabOpen: false,
  delay: 2000 // Delay mặc định 2 giây
};

// Trạng thái xử lý
let urlQueue = [];
let processing = false;
let isPaused = false;
let currentUrl = "";
let errorCount = 0;
let processedCount = 0;
let rulesetEnabled = false; // Fix: Added missing variable declaration
const MAX_ERRORS = 5; // Fix: Added missing constant

// Lưu trạng thái hiện tại vào storage
function saveState() {
  chrome.storage.local.set({
    'cookie_generator_state': {
      urlQueue,
      processing,
      isPaused,
      currentUrl,
      errorCount,
      processedCount,
      timestamp: Date.now()
    }
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Cookie Generator: Lỗi khi lưu trạng thái', chrome.runtime.lastError);
    } else {
      console.log('Cookie Generator: Đã lưu trạng thái');
    }
  });
}

// Khôi phục trạng thái từ storage
function restoreState() {
  chrome.storage.local.get('cookie_generator_state', (result) => {
    if (chrome.runtime.lastError) {
      console.error('Cookie Generator: Lỗi khi phục hồi trạng thái', chrome.runtime.lastError);
      return;
    }

    const state = result.cookie_generator_state;
    if (!state) {
      console.log('Cookie Generator: Không có trạng thái được lưu');
      return;
    }

    // Kiểm tra xem trạng thái có quá cũ không (1 giờ)
    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - state.timestamp > ONE_HOUR) {
      console.log('Cookie Generator: Trạng thái đã lưu quá cũ, không khôi phục');
      return;
    }

    // Khôi phục trạng thái
    urlQueue = state.urlQueue || [];
    processing = state.processing || false;
    isPaused = state.isPaused || false;
    currentUrl = state.currentUrl || '';
    errorCount = state.errorCount || 0;
    processedCount = state.processedCount || 0;

    console.log('Cookie Generator: Đã khôi phục trạng thái', {
      urlCount: urlQueue.length,
      processing,
      isPaused
    });

    // Nếu đang xử lý và không tạm dừng, tiếp tục xử lý
    if (processing && !isPaused && urlQueue.length > 0) {
      console.log('Cookie Generator: Tiếp tục xử lý sau khi khôi phục');
      processNextUrl();
    }
  });
}

// Gọi khôi phục trạng thái khi extension khởi động
restoreState();

// Tải cài đặt từ storage
chrome.storage.local.get(["blockMedia", "showActiveTab", "keepTabOpen", "delay"], (result) => {
  if (chrome.runtime.lastError) {
    console.error("Lỗi khi tải cài đặt:", chrome.runtime.lastError);
    return;
  }
  
  if (result.blockMedia !== undefined) settings.blockMedia = result.blockMedia;
  if (result.showActiveTab !== undefined) settings.showActiveTab = result.showActiveTab;
  if (result.keepTabOpen !== undefined) settings.keepTabOpen = result.keepTabOpen;
  if (result.delay !== undefined) settings.delay = result.delay;
  
  // Thiết lập chặn media dựa trên cài đặt
  updateMediaBlocking(settings.blockMedia);
});

// Cập nhật trạng thái và gửi thông tin đến popup
function updateStatus(statusData, isRunning = processing) {
  // Xử lý tham số nếu là string (tương thích với các lệnh gọi cũ)
  let status = statusData;
  if (typeof statusData === 'string') {
    status = {
      status: 'info',
      message: statusData
    };
  } else if (typeof statusData === 'object' && statusData !== null) {
    // Nếu đã là object, giữ nguyên
    status = statusData;
  }
  
  // Thêm các thông tin bổ sung
  const messageData = {
    type: 'status_update',
    isRunning: isRunning,
    isPaused: isPaused,
    currentUrl: currentUrl,
    stats: {
      processed: processedCount,
      errors: errorCount,
      remaining: urlQueue.length
    },
    ...status // Merge với status object
  };
  
  console.log('Cookie Generator: Cập nhật trạng thái', messageData);
  
  // Gửi thông điệp đến popup
  chrome.runtime.sendMessage(messageData).catch(error => {
    // Bỏ qua lỗi khi không có popup đang mở
    if (!error.message.includes("Could not establish connection") && 
        !error.message.includes("Receiving end does not exist")) {
      console.error('Cookie Generator: Lỗi khi gửi trạng thái', error);
    }
  });
}

// Thiết lập chặn media sử dụng declarativeNetRequest
async function updateMediaBlocking(block) {
  try {
    if (block && !rulesetEnabled) {
      updateStatus("Đang bật chặn media...", true);
      
      // Kiểm tra xem ruleset đã tồn tại chưa
      try {
        // Đầu tiên, tắt tất cả rulesets
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: ["media_blocking"]
        });
        
        // Sau đó, bật lại ruleset
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: ["media_blocking"]
        });
        
        // Kiểm tra trạng thái ruleset
        const rulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
        if (rulesets.includes("media_blocking")) {
          console.log("Đã bật chặn media thành công");
          rulesetEnabled = true;
          updateStatus("Đã bật chặn media", false);
        } else {
          throw new Error("Không thể bật ruleset media_blocking");
        }
      } catch (rulesetError) {
        console.error("Lỗi khi thiết lập ruleset:", rulesetError);
        updateStatus("Lỗi khi bật chặn media", false);
        errorCount++;
      }
    } else if (!block && rulesetEnabled) {
      updateStatus("Đang tắt chặn media...", true);
      
      try {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: ["media_blocking"]
        });
        
        // Kiểm tra trạng thái ruleset
        const rulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
        if (!rulesets.includes("media_blocking")) {
          console.log("Đã tắt chặn media thành công");
          rulesetEnabled = false;
          updateStatus("Đã tắt chặn media", false);
        } else {
          throw new Error("Không thể tắt ruleset media_blocking");
        }
      } catch (rulesetError) {
        console.error("Lỗi khi tắt ruleset:", rulesetError);
        updateStatus("Lỗi khi tắt chặn media", false);
        errorCount++;
      }
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật chặn media:", error);
    errorCount++;
    if (errorCount >= MAX_ERRORS) {
      console.error("Đã vượt quá số lỗi tối đa cho phép");
      processing = false;
      updateStatus("Lỗi khi cập nhật chặn media", false);
    }
  }
}

// Hàm kiểm tra xem tab có tồn tại không
async function tabExists(tabId) {
  try {
    // Lưu ý: khi tab không tồn tại, chrome.tabs.get sẽ ném lỗi
    await chrome.tabs.get(tabId);
    return true;
  } catch (error) {
    // Nếu có lỗi, tab không tồn tại
    console.log(`Tab ${tabId} không tồn tại:`, error.message);
    return false;
  }
}

// Hàm gửi thông báo đến tab cụ thể, với kiểm tra trước
async function sendMessageToTab(tabId, message) {
  try {
    // Kiểm tra xem tab có tồn tại không
    const exists = await tabExists(tabId);
    if (!exists) {
      console.log(`Không thể gửi tin nhắn vì tab ${tabId} không tồn tại`);
      return false;
    }
    
    // Gửi tin nhắn đến tab
    await chrome.tabs.sendMessage(tabId, message);
    return true;
  } catch (error) {
    console.error(`Lỗi khi gửi tin nhắn đến tab ${tabId}:`, error.message);
    return false;
  }
}

/**
 * Xử lý URL tiếp theo trong danh sách
 */
async function processNextUrl() {
  if (isPaused) {
    console.log('Cookie Generator: Quá trình đang tạm dừng');
    updateStatus({
      status: 'paused',
      message: 'Quá trình tạo cookie đang tạm dừng'
    });
    return;
  }
  
  if (urlQueue.length === 0) {
    console.log('Cookie Generator: Đã hoàn thành tất cả URL');
    processing = false;
    updateStatus({
      status: 'complete',
      message: 'Đã hoàn thành tất cả URL',
      currentUrl: '',
      progress: {
        processed: processedCount,
        errors: errorCount,
        remaining: urlQueue.length
      }
    });
    // Lưu trạng thái cuối cùng
    saveState();
    return;
  }
  
  const url = urlQueue.shift();
  currentUrl = url;
  console.log(`Cookie Generator: Đang xử lý ${url} (${processedCount + 1}/${processedCount + errorCount + urlQueue.length + 1})`);
  
  try {
    // Cập nhật trạng thái
    updateStatus({
      status: 'processing',
      message: 'Đang xử lý...',
      currentUrl: url,
      progress: {
        processed: processedCount,
        errors: errorCount,
        remaining: urlQueue.length + 1 // +1 vì đang xử lý currentUrl
      }
    });
    
    // Lưu trạng thái
    saveState();
    
    // Tạo tab mới cho URL hiện tại
    let tab;
    try {
      tab = await chrome.tabs.create({ url: url, active: false });
      console.log(`Cookie Generator: Đã tạo tab ${tab.id} cho ${url}`);
    } catch (tabError) {
      console.error(`Cookie Generator: Lỗi khi tạo tab cho ${url}`, tabError);
      throw new Error(`Không thể tạo tab cho ${url}: ${tabError.message}`);
    }
    
    // Thời gian tối thiểu để đợi trang tải
    const minLoadTime = 15000; // 15 giây
    console.log(`Cookie Generator: Đợi tối thiểu ${minLoadTime/1000} giây cho trang tải`);
    await new Promise(resolve => setTimeout(resolve, minLoadTime));
    
    // Kiểm tra trạng thái tab (đảm bảo tab còn tồn tại)
    try {
      await chrome.tabs.get(tab.id);
    } catch (tabError) {
      console.error(`Cookie Generator: Tab ${tab.id} không còn tồn tại`, tabError);
      throw new Error(`Tab đã đóng trước khi xử lý hoàn tất: ${tabError.message}`);
    }
    
    // Gửi tin nhắn bắt đầu quá trình giả mạo
    let retries = 0;
    const maxRetries = 3;
    let spoofingStarted = false;
    
    while (retries < maxRetries && !spoofingStarted) {
      try {
        console.log(`Cookie Generator: Gửi yêu cầu giả mạo đến tab ${tab.id} (lần thử ${retries + 1}/${maxRetries})`);
        
        // Lấy cài đặt AI từ storage
        const aiSettings = await new Promise((resolveSettings) => {
          chrome.storage.local.get([
            "enableHumanSimulation",
            "simulationIntensity", 
            "simulationTime",
            "fillForms",
            "mouseMovement",
            "scrollBehavior",
            "tempAISettings"
          ], (result) => {
            // Sử dụng tempAISettings nếu có sẵn, nếu không sử dụng các cài đặt riêng lẻ
            const settings = result.tempAISettings || {
              enableHumanSimulation: result.enableHumanSimulation !== undefined ? result.enableHumanSimulation : true,
              simulationIntensity: result.simulationIntensity || 'medium',
              simulationTime: result.simulationTime || 30,
              fillForms: result.fillForms !== undefined ? result.fillForms : true,
              mouseMovement: result.mouseMovement || 'natural',
              scrollBehavior: result.scrollBehavior || 'natural'
            };
            
            console.log("Cài đặt AI để gửi đến content script:", settings);
            resolveSettings(settings);
          });
        });
        
        // Thiết lập timeout cho việc gửi tin nhắn
        const spoofPromise = new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Hết thời gian chờ phản hồi từ content script'));
          }, 10000); // 10 giây timeout
          
          chrome.tabs.sendMessage(tab.id, { 
            action: 'spoof_site',
            settings: aiSettings  // Thêm cài đặt AI vào message
          })
            .then(response => {
              clearTimeout(timeoutId);
              resolve(response);
            })
            .catch(error => {
              clearTimeout(timeoutId);
              reject(error);
            });
        });
        
        const response = await spoofPromise;
        
        if (response && response.success) {
          spoofingStarted = true;
          console.log(`Cookie Generator: Đã bắt đầu giả mạo trên tab ${tab.id}`);
        } else {
          throw new Error(`Lỗi khi bắt đầu giả mạo: ${response?.error || 'Không xác định'}`);
        }
      } catch (error) {
        retries++;
        console.log(`Cookie Generator: Lỗi khi gửi yêu cầu giả mạo (lần thử ${retries}/${maxRetries})`, error);
        
        if (retries >= maxRetries) {
          console.error(`Cookie Generator: Đã vượt quá số lần thử lại cho việc bắt đầu giả mạo`);
          throw new Error(`Không thể bắt đầu quá trình giả mạo sau ${maxRetries} lần thử: ${error.message}`);
        }
        
        // Đợi thêm chút thời gian trước khi thử lại
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Đợi quá trình giả mạo hoàn thành
    let attempts = 0;
    const maxAttempts = 20; // Số lần kiểm tra tối đa
    let spoofCompleted = false;
    
    console.log(`Cookie Generator: Bắt đầu kiểm tra trạng thái giả mạo (tối đa ${maxAttempts} lần)`);
    
    while (attempts < maxAttempts && !spoofCompleted) {
      try {
        // Kiểm tra trạng thái tab trước khi gửi tin nhắn
        try {
          await chrome.tabs.get(tab.id);
        } catch (tabError) {
          console.error(`Cookie Generator: Tab ${tab.id} đã đóng trong quá trình chờ`, tabError);
          throw new Error(`Tab đã đóng trong quá trình chờ hoàn thành: ${tabError.message}`);
        }
        
        // Đợi giữa các lần kiểm tra
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Thiết lập timeout cho việc kiểm tra trạng thái
        const statusPromise = new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Hết thời gian chờ phản hồi trạng thái'));
          }, 5000); // 5 giây timeout
          
          chrome.tabs.sendMessage(tab.id, { action: 'check_spoof_status' })
            .then(response => {
              clearTimeout(timeoutId);
              resolve(response);
            })
            .catch(error => {
              clearTimeout(timeoutId);
              reject(error);
            });
        });
        
        const status = await statusPromise;
        console.log(`Cookie Generator: Kiểm tra trạng thái (lần ${attempts + 1}/${maxAttempts})`, status);
        
        if (status && status.completed) {
          spoofCompleted = true;
          console.log(`Cookie Generator: Giả mạo đã hoàn thành trên tab ${tab.id}`);
        } else if (attempts >= maxAttempts - 1) {
          // Nếu đã đến lần kiểm tra cuối cùng mà vẫn chưa hoàn thành
          console.log(`Cookie Generator: Hết thời gian đợi giả mạo, lưu cookie và tiếp tục`);
          spoofCompleted = true; // Đánh dấu hoàn thành để tiếp tục quá trình
        }
      } catch (error) {
        attempts++;
        console.log(`Cookie Generator: Lỗi khi kiểm tra trạng thái (lần ${attempts}/${maxAttempts})`, error);
        
        if (attempts >= maxAttempts) {
          console.error(`Cookie Generator: Đã vượt quá số lần kiểm tra trạng thái`);
          // Không throw error ở đây, tiếp tục xử lý cookie để không bỏ lỡ
        }
      }
      
      attempts++;
    }
    
    // Lưu cookies từ tab
    try {
      // Kiểm tra trạng thái tab trước khi lưu cookie
      try {
        await chrome.tabs.get(tab.id);
      } catch (tabError) {
        console.error(`Cookie Generator: Tab ${tab.id} đã đóng trước khi lưu cookie`, tabError);
        throw new Error(`Tab đã đóng trước khi lưu cookie: ${tabError.message}`);
      }
      
      // Thêm độ trễ để đảm bảo tất cả cookies đã được thiết lập
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Cookie Generator: Bắt đầu lưu cookies từ tab ${tab.id}`);
      
      // Thiết lập timeout cho việc lưu cookie
      const cookieSavePromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Hết thời gian chờ lưu cookie'));
        }, 10000); // 10 giây timeout
        
        chrome.tabs.sendMessage(tab.id, { action: 'save_cookies' })
          .then(response => {
            clearTimeout(timeoutId);
            resolve(response);
          })
          .catch(error => {
            clearTimeout(timeoutId);
            reject(error);
          });
      });
      
      const saveResult = await cookieSavePromise;
      console.log(`Cookie Generator: Kết quả lưu cookie`, saveResult);
    } catch (cookieError) {
      console.error(`Cookie Generator: Lỗi khi lưu cookies`, cookieError);
      // Vẫn tiếp tục xử lý các URL khác ngay cả khi không lưu được cookies
    }
    
    // Thay vì đóng tab, chỉ đánh dấu là đã xử lý
    try {
      console.log(`Cookie Generator: Đã xử lý xong tab ${tab.id}, giữ tab mở`);
      
      // Kiểm tra cài đặt keepTabOpen
      if (settings.keepTabOpen) {
        console.log(`[Cookie Generator] Tab ${tab.id} đã được xử lý và sẽ được giữ mở`);
        
        // Gửi thông báo đến content script với kiểm tra trước
        const messageSent = await sendMessageToTab(tab.id, {
          action: "processing_completed",
          message: "Xử lý hoàn tất! Tab này sẽ được giữ mở theo cài đặt của bạn."
        });
        
        // Nếu gửi tin nhắn thành công và cài đặt hiển thị tab đang hoạt động được bật
        if (messageSent && settings.showActiveTab) {
          await chrome.tabs.update(tab.id, { active: true });
        }
      } else {
        // Đóng tab như cũ
        try {
          await chrome.tabs.remove(tab.id);
        } catch (error) {
          console.error(`[Cookie Generator] Lỗi khi đóng tab: ${error.message}`);
        }
      }
    } catch (tabError) {
      console.error(`Cookie Generator: Lỗi khi xử lý tab sau khi hoàn thành ${tab.id}`, tabError);
      // Vẫn tiếp tục xử lý các URL khác 
    }
    
    // Đánh dấu URL đã được truy cập
    processedCount++;
    saveState();
    
    // Cập nhật trạng thái
    updateStatus({
      status: 'waiting',
      message: 'Đã xử lý xong URL, chuẩn bị cho URL tiếp theo',
      currentUrl: '',
      progress: {
        processed: processedCount,
        errors: errorCount,
        remaining: urlQueue.length
      }
    });
    
    // Đợi thời gian ngắn trước khi xử lý URL tiếp theo
    await new Promise(resolve => setTimeout(resolve, 3000)); // Đợi 3 giây
    
    // Xử lý URL tiếp theo
    if (processing && !isPaused) {
      processNextUrl();
    }
  } catch (error) {
    console.error(`Cookie Generator: Lỗi khi xử lý ${url}`, error);
    errorCount++;
    
    // Cập nhật trạng thái
    updateStatus({
      status: 'error',
      message: `Lỗi: ${error.message}`,
      currentUrl: url,
      progress: {
        processed: processedCount,
        errors: errorCount,
        remaining: urlQueue.length
      }
    });
    
    // Lưu trạng thái
    saveState();
    
    // Đợi thời gian ngắn trước khi xử lý URL tiếp theo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Xử lý URL tiếp theo
    if (processing && !isPaused) {
      processNextUrl();
    }
  }
}

// Lắng nghe tin nhắn từ popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`Cookie Generator: Nhận message: ${message.action}`);
  
  if (message.action === 'start_visits') {
    if (processing) {
      console.log("Từ chối bắt đầu vì đang xử lý");
      sendResponse({ success: false, error: "Đang xử lý..." });
      return true;
    }

    if (!message.urls || message.urls.length === 0) {
      console.log("Từ chối bắt đầu vì không có URL");
      sendResponse({ success: false, error: "Vui lòng nhập danh sách URL" });
      return true;
    }

    // Thiết lập hàng đợi URL và bắt đầu xử lý
    urlQueue = message.urls;
    processing = true;
    isPaused = false;
    errorCount = 0;
    processedCount = 0;
    
    console.log("Bắt đầu xử lý URLs:", message.urls);
    
    // Tải cài đặt AI từ storage để chuẩn bị gửi cho content script
    chrome.storage.local.get([
      "enableHumanSimulation",
      "simulationIntensity",
      "simulationTime",
      "fillForms",
      "mouseMovement",
      "scrollBehavior"
    ], (aiSettings) => {
      console.log("Đã tải cài đặt AI:", aiSettings);
      
      // Lưu cài đặt AI vào biến tạm thời để sử dụng sau
      chrome.storage.local.set({ 
        "tempAISettings": aiSettings 
      }, () => {
        console.log("Đã lưu cài đặt AI tạm thời");
        
        // Trả lời thành công cho popup
        sendResponse({ success: true });
        
        // Bắt đầu xử lý
        processNextUrl();
      });
    });
    
    return true;
  }
  
  if (message.action === 'pause_visits') {
    if (!processing) {
      console.log("Từ chối tạm dừng vì không đang xử lý");
      sendResponse({ success: false, error: "Không có quá trình đang chạy" });
      return true;
    }
    
    isPaused = true;
    console.log("Tạm dừng xử lý");
    updateStatus("Đã tạm dừng", true);
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'resume_visits') {
    if (!processing) {
      console.log("Từ chối tiếp tục vì không đang xử lý");
      sendResponse({ success: false, error: "Không có quá trình đang chạy" });
      return true;
    }
    
    isPaused = false;
    console.log("Tiếp tục xử lý");
    updateStatus(currentUrl ? `Đang xử lý: ${currentUrl}` : "Đang xử lý...", true);
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'stop_visits') {
    if (!processing) {
      console.log("Từ chối dừng vì không đang xử lý");
      sendResponse({ success: false, error: "Không có quá trình đang chạy" });
      return true;
    }
    
    // Dừng xử lý
    processing = false;
    isPaused = false;
    urlQueue = [];
    currentUrl = "";
    
    console.log("Dừng xử lý");
    updateStatus("Đã dừng", false);
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'get_status') {
    console.log("Gửi trạng thái hiện tại");
    sendResponse({
      status: {
        status: isPaused ? 'paused' : (processing ? 'processing' : 'ready'),
        message: currentUrl ? `Đang xử lý: ${currentUrl}` : (processing ? "Đang xử lý..." : "Sẵn sàng"),
        currentUrl: currentUrl
      },
      isRunning: processing,
      isPaused: isPaused,
      progress: {
        processed: processedCount,
        errors: errorCount,
        remaining: urlQueue.length
      },
      stats: {
        processed: processedCount,
        errors: errorCount,
        remaining: urlQueue.length
      }
    });
    return true;
  }
  
  if (message.action === "update_settings") {
    // Cập nhật cài đặt
    console.log(`[Cookie Generator] Cập nhật cài đặt:`, message.settings);
    
    if (message.settings.hasOwnProperty("blockMedia")) {
      settings.blockMedia = message.settings.blockMedia;
    }
    
    if (message.settings.hasOwnProperty("showActiveTab")) {
      settings.showActiveTab = message.settings.showActiveTab;
    }
    
    if (message.settings.hasOwnProperty("keepTabOpen")) {
      settings.keepTabOpen = message.settings.keepTabOpen;
    }
    
    // Lưu cài đặt vào storage
    chrome.storage.local.set(settings, () => {
      console.log(`[Cookie Generator] Đã lưu cài đặt:`, settings);
    });
    
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === "get_state") {
    console.log("Gửi trạng thái hiện tại");
    sendResponse({
      status: {
        status: isPaused ? 'paused' : (processing ? 'processing' : 'ready'),
        message: currentUrl ? `Đang xử lý: ${currentUrl}` : (processing ? "Đang xử lý..." : "Sẵn sàng"),
        currentUrl: currentUrl
      },
      isRunning: processing,
      isPaused: isPaused,
      progress: {
        processed: processedCount,
        errors: errorCount,
        remaining: urlQueue.length
      },
      stats: {
        processed: processedCount,
        errors: errorCount,
        remaining: urlQueue.length
      }
    });
    return true;
  }
  
  if (message.action === "open_options") {
    console.log("Cookie Generator: Mở trang tùy chọn");
    
    try {
      // Mở trang tùy chọn của extension
      chrome.runtime.openOptionsPage(() => {
        console.log("Cookie Generator: Đã mở trang tùy chọn");
        
        // Nếu yêu cầu mở tab cụ thể (cookies)
        if (message.data && message.data.tab) {
          // Lưu tab cần mở vào storage để options page có thể đọc
          chrome.storage.local.set({ activeOptionsTab: message.data.tab }, () => {
            console.log(`Cookie Generator: Đã thiết lập tab hoạt động: ${message.data.tab}`);
          });
        }
      });
      
      sendResponse({ success: true });
    } catch (error) {
      console.error("Cookie Generator: Lỗi khi mở trang tùy chọn", error);
      sendResponse({ success: false, error: error.message });
    }
    
    return true;
  }
  
  if (message.action === 'update_webhook_settings') {
    console.log('Cập nhật cài đặt Discord webhook:', message.data);
    
    chrome.storage.local.set({
      'webhook_url': message.data.webhookUrl || '',
      'auto_export_discord': message.data.autoExport || false
    }, function() {
      console.log('Đã lưu cài đặt Discord webhook');
      sendResponse({ success: true });
    });
    
    return true; // Giữ kết nối mở cho sendResponse không đồng bộ
  }
  
  return false;
});

// Khởi tạo storage
chrome.runtime.onInstalled.addListener(function() {
  // ... existing code ...
  
  // Thêm cài đặt mặc định cho Discord Webhook
  chrome.storage.local.get(['webhook_url', 'auto_export_discord'], function(result) {
    const defaults = {};
    
    if (result.webhook_url === undefined) {
      defaults.webhook_url = '';
    }
    
    if (result.auto_export_discord === undefined) {
      defaults.auto_export_discord = false;
    }
    
    if (Object.keys(defaults).length > 0) {
      chrome.storage.local.set(defaults, function() {
        console.log('Cookie Generator: Đã khởi tạo cài đặt Discord webhook mặc định');
      });
    }
  });
});