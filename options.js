// Khởi tạo các biến UI khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  const settingsToggle = document.getElementById("settingsToggle");
  const settingsPanel = document.getElementById("settingsPanel");
  const blockMediaToggle = document.getElementById("blockMediaToggle");
  const activeTabToggle = document.getElementById("activeTabToggle");
  const startButton = document.getElementById("start");
  const pauseButton = document.getElementById("pause");
  const stopButton = document.getElementById("stop");
  const exportButton = document.getElementById("export");
  const urlInput = document.getElementById("urlList");
  const statusElement = document.getElementById("status");
  const currentUrlElement = document.getElementById("currentUrl");
  const progressElement = document.getElementById("progress");
  const progressFillElement = document.getElementById("progressFill");
  const errorElement = document.getElementById("error");
  const errorCountElement = document.getElementById("errorCount");
  const stepDetailsElement = document.getElementById("stepDetails");

  // Kiểm tra các phần tử có tồn tại không
  if (!settingsToggle || !settingsPanel || !blockMediaToggle || !activeTabToggle || 
      !startButton || !pauseButton || !stopButton || !exportButton || !urlInput || 
      !statusElement || !currentUrlElement || !progressElement || !progressFillElement || 
      !errorElement || !errorCountElement || !stepDetailsElement) {
    console.error("Không thể tìm thấy các phần tử UI cần thiết");
    showError("Lỗi: Không thể tải giao diện người dùng");
    return;
  }

  // Hiển thị lỗi
  function showError(message) {
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
      setTimeout(() => {
        errorElement.style.display = "none";
      }, 5000);
    }
  }

  // Cập nhật trạng thái nút
  function updateButtonStates(isProcessing, isPaused) {
    startButton.disabled = isProcessing;
    pauseButton.disabled = !isProcessing;
    stopButton.disabled = !isProcessing;
    pauseButton.textContent = isPaused ? "Tiếp tục" : "Tạm dừng";
  }

  // Toggle menu cài đặt
  settingsToggle.addEventListener("click", () => {
    settingsPanel.style.display = settingsPanel.style.display === "none" ? "block" : "none";
  });

  // Đọc và áp dụng cài đặt từ storage
  chrome.storage.local.get(["blockMedia", "showActiveTab"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Lỗi khi tải cài đặt:", chrome.runtime.lastError);
      showError("Không thể tải cài đặt");
      return;
    }
    
    blockMediaToggle.checked = result.blockMedia !== false;
    activeTabToggle.checked = result.showActiveTab === true;
  });

  // Lưu cài đặt khi thay đổi
  blockMediaToggle.addEventListener("change", () => {
    chrome.storage.local.set({ blockMedia: blockMediaToggle.checked }, () => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi lưu cài đặt:", chrome.runtime.lastError);
        showError("Không thể lưu cài đặt");
        blockMediaToggle.checked = !blockMediaToggle.checked;
      } else {
        chrome.runtime.sendMessage({ 
          action: "update_settings", 
          settings: { blockMedia: blockMediaToggle.checked } 
        });
      }
    });
  });

  activeTabToggle.addEventListener("change", () => {
    chrome.storage.local.set({ showActiveTab: activeTabToggle.checked }, () => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi lưu cài đặt:", chrome.runtime.lastError);
        showError("Không thể lưu cài đặt");
        activeTabToggle.checked = !activeTabToggle.checked;
      } else {
        chrome.runtime.sendMessage({ 
          action: "update_settings", 
          settings: { showActiveTab: activeTabToggle.checked } 
        });
      }
    });
  });

  // Cập nhật UI trạng thái
  function updateStatus(show, currentUrl, current, total, errorCount, status, isPaused, currentStep) {
    statusElement.textContent = status || "-";
    currentUrlElement.textContent = currentUrl || "-";
    progressElement.textContent = `${current}/${total}`;
    errorCountElement.textContent = errorCount || "0";
    stepDetailsElement.textContent = currentStep || "-";
    
    // Cập nhật thanh tiến độ
    if (total > 0) {
      const progress = (current / total) * 100;
      progressFillElement.style.width = `${progress}%`;
    } else {
      progressFillElement.style.width = "0%";
    }
    
    updateButtonStates(show, isPaused);
  }

  // Lắng nghe cập nhật trạng thái từ background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "status_update") {
      updateStatus(
        message.isProcessing,
        message.currentUrl,
        message.current,
        message.total,
        message.errorCount,
        message.status,
        message.isPaused,
        message.currentStep
      );
    }
  });

  // Kiểm tra trạng thái hiện tại khi mở trang
  chrome.runtime.sendMessage({ action: "get_status" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Lỗi khi lấy trạng thái:", chrome.runtime.lastError);
      showError("Không thể lấy trạng thái");
      return;
    }
    
    if (response) {
      updateStatus(
        response.isProcessing,
        response.currentUrl,
        response.current,
        response.total,
        response.errorCount,
        response.status,
        response.isPaused,
        response.currentStep
      );
    }
  });

  // Chức năng bắt đầu quét
  startButton.addEventListener("click", () => {
    if (!urlInput) {
      console.error("URL input element not found");
      showError("Không tìm thấy trường nhập URL");
      return;
    }
    
    // Parse và chuẩn hóa URLs
    let urls = urlInput.value.split("\n")
      .filter(url => url.trim() !== "")
      .map(url => {
        // Thêm https:// nếu URL không bắt đầu bằng http:// hoặc https://
        if (!url.match(/^https?:\/\//i)) {
          return "https://" + url;
        }
        return url;
      });
    
    if (urls.length === 0) {
      showError("Vui lòng nhập ít nhất một URL");
      return;
    }
    
    chrome.storage.local.set({ urls }, () => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi lưu URLs:", chrome.runtime.lastError);
        showError("Không thể lưu danh sách URL");
        return;
      }
      
      chrome.runtime.sendMessage({ action: "start_visits" }, response => {
        if (chrome.runtime.lastError) {
          console.error("Lỗi khi gửi tin nhắn:", chrome.runtime.lastError);
          showError("Không thể bắt đầu quét");
        }
      });
    });
  });

  // Chức năng tạm dừng/tiếp tục
  pauseButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "pause_visits" }, response => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi gửi tin nhắn pause:", chrome.runtime.lastError);
        showError("Không thể tạm dừng quét");
      }
    });
  });

  // Chức năng dừng quét
  stopButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "stop_visits" }, response => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi gửi tin nhắn dừng:", chrome.runtime.lastError);
        showError("Không thể dừng quét");
      }
    });
  });

  // Chức năng xuất cookies
  exportButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "export_cookies" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi xuất cookies:", chrome.runtime.lastError);
        showError("Không thể xuất cookies");
      }
    });
  });
});
