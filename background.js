// Cài đặt mặc định
let settings = {
  blockMedia: true,
  showActiveTab: false,
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

// Tải cài đặt từ storage
chrome.storage.local.get(["blockMedia", "showActiveTab", "delay"], (result) => {
  if (chrome.runtime.lastError) {
    console.error("Lỗi khi tải cài đặt:", chrome.runtime.lastError);
    return;
  }
  
  if (result.blockMedia !== undefined) settings.blockMedia = result.blockMedia;
  if (result.showActiveTab !== undefined) settings.showActiveTab = result.showActiveTab;
  if (result.delay !== undefined) settings.delay = result.delay;
  
  // Thiết lập chặn media dựa trên cài đặt
  updateMediaBlocking(settings.blockMedia);
});

// Cập nhật trạng thái và gửi thông tin đến popup
function updateStatus(status, isRunning = false) {
  chrome.runtime.sendMessage({
    type: 'status_update',
    status: status,
    isRunning: isRunning,
    stats: {
      processed: processedCount,
      errors: errorCount
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

// Xử lý URL tiếp theo trong hàng đợi
async function processNextUrl() {
  if (!processing || urlQueue.length === 0) {
    processing = false;
    updateStatus("Hoàn thành", false);
    return;
  }

  if (isPaused) {
    setTimeout(processNextUrl, 1000);
    return;
  }

  currentUrl = urlQueue.shift();
  updateStatus(`Đang xử lý: ${currentUrl}`, true);

  try {
    // Tạo tab mới
    const tab = await chrome.tabs.create({ url: currentUrl, active: settings.showActiveTab }); // Fix: Use showActiveTab setting
    
    // Đợi tab load xong - sử dụng settings.delay thay vì hardcoded 5000
    await new Promise(resolve => setTimeout(resolve, settings.delay));
    
    // Gửi tin nhắn đến content script để lưu cookie
    chrome.tabs.sendMessage(tab.id, { action: "save_cookies" }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi lưu cookie:", chrome.runtime.lastError);
        errorCount++;
      } else if (response && response.success) {
        processedCount++;
      } else {
        errorCount++;
      }

      // Đóng tab sau khi xử lý xong
      try {
        await chrome.tabs.remove(tab.id);
      } catch (tabError) {
        console.error("Lỗi khi đóng tab:", tabError);
      }
      
      // Xử lý URL tiếp theo - sử dụng settings.delay thay vì hardcoded 2000
      setTimeout(processNextUrl, settings.delay);
    });
  } catch (error) {
    console.error("Lỗi khi xử lý URL:", error);
    errorCount++;
    setTimeout(processNextUrl, settings.delay); // Fix: Use settings.delay
  }
}

// Lắng nghe tin nhắn từ popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start_visits') {
    if (processing) {
      sendResponse({ success: false, error: "Đang xử lý..." });
      return true;
    }

    if (!message.urls || message.urls.length === 0) {
      sendResponse({ success: false, error: "Vui lòng nhập danh sách URL" });
      return true;
    }

    urlQueue = [...message.urls];
    processing = true;
    processedCount = 0;
    errorCount = 0;
    isPaused = false;
    
    sendResponse({ success: true });
    processNextUrl();
  }
  
  else if (message.action === 'stop_visits') {
    processing = false;
    urlQueue = [];
    currentUrl = "";
    isPaused = false;
    
    sendResponse({ success: true });
    updateStatus("Đã dừng", false);
  }
  
  else if (message.action === 'pause_visits') {
    isPaused = !isPaused;
    sendResponse({ success: true });
    updateStatus(isPaused ? "Đã tạm dừng" : "Đang xử lý...", !isPaused);
  }
  
  else if (message.action === 'get_status') {
    sendResponse({
      status: currentUrl ? `Đang xử lý: ${currentUrl}` : "Sẵn sàng",
      isRunning: processing,
      stats: {
        processed: processedCount,
        errors: errorCount
      }
    });
  }
  
  return true;
});