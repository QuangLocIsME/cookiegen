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
  const keepTabOpenToggle = document.getElementById("keepTabOpenToggle");

  // Kiểm tra các phần tử có tồn tại không
  if (!settingsToggle || !settingsPanel || !blockMediaToggle || !activeTabToggle || 
      !startButton || !pauseButton || !stopButton || !exportButton || !urlInput || 
      !statusElement || !currentUrlElement || !progressElement || !progressFillElement || 
      !errorElement || !errorCountElement || !stepDetailsElement || !keepTabOpenToggle) {
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
  chrome.storage.local.get(["blockMedia", "showActiveTab", "keepTabOpen"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Lỗi khi tải cài đặt:", chrome.runtime.lastError);
      showError("Không thể tải cài đặt");
      return;
    }
    
    blockMediaToggle.checked = result.blockMedia === true;
    activeTabToggle.checked = result.showActiveTab === true;
    keepTabOpenToggle.checked = result.keepTabOpen === true;
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

  keepTabOpenToggle.addEventListener("change", () => {
    chrome.storage.local.set({ keepTabOpen: keepTabOpenToggle.checked }, () => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi lưu cài đặt:", chrome.runtime.lastError);
        showError("Không thể lưu cài đặt");
        keepTabOpenToggle.checked = !keepTabOpenToggle.checked;
      } else {
        chrome.runtime.sendMessage({ 
          action: "update_settings", 
          settings: { keepTabOpen: keepTabOpenToggle.checked } 
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

  // Tải danh sách URLs đã lưu
  chrome.storage.local.get("urls", (result) => {
    if (chrome.runtime.lastError) {
      console.error("Lỗi khi tải danh sách URLs:", chrome.runtime.lastError);
      return;
    }
    
    if (result.urls && Array.isArray(result.urls) && result.urls.length > 0) {
      urlInput.value = result.urls.join("\n");
      console.log("Đã tải " + result.urls.length + " URLs từ storage");
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
      
      chrome.runtime.sendMessage({ 
        action: "start_visits",
        urls: urls  // Thêm danh sách URLs vào message
      }, response => {
        if (chrome.runtime.lastError) {
          console.error("Lỗi khi gửi tin nhắn:", chrome.runtime.lastError);
          showError("Không thể bắt đầu quét");
        } else if (response && !response.success) {
          showError(response.error || "Không thể bắt đầu quét");
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

  // Thêm vào hàm loadSettings
  function loadSettings() {
    chrome.storage.local.get({
      // Các option hiện có
      urls: [],
      urlInput: '',
      delay: 2000,
      blockMedia: false,
      autoStart: false,
      
      // Thêm các option AI mới
      enableHumanSimulation: true,
      simulationIntensity: 'medium',
      simulationTime: 25,
      fillForms: true
      
    }, function(items) {
      // Các code hiện có để load các option cũ
      
      // Load các option AI mới
      document.getElementById('enable-human-simulation').checked = items.enableHumanSimulation;
      document.getElementById('simulation-intensity').value = items.simulationIntensity;
      document.getElementById('simulation-time').value = items.simulationTime;
      document.getElementById('simulation-time-value').textContent = items.simulationTime;
      document.getElementById('fill-forms').checked = items.fillForms;
    });
  }

  // Thêm vào hàm saveSettings
  function saveSettings() {
    // Lấy các giá trị AI mới
    const enableHumanSimulation = document.getElementById('enable-human-simulation').checked;
    const simulationIntensity = document.getElementById('simulation-intensity').value;
    const simulationTime = document.getElementById('simulation-time').value;
    const fillForms = document.getElementById('fill-forms').checked;
    
    chrome.storage.local.set({
      // Các option hiện có
      
      // Thêm các option AI mới
      enableHumanSimulation: enableHumanSimulation,
      simulationIntensity: simulationIntensity,
      simulationTime: parseInt(simulationTime),
      fillForms: fillForms
    }, function() {
      showMessage('Đã lưu thiết lập.', 'success');
    });
  }

  // Kiểm tra tab hoạt động từ storage
  chrome.storage.local.get(['activeOptionsTab'], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Lỗi khi tải tab hoạt động:", chrome.runtime.lastError);
      return;
    }
    
    if (result.activeOptionsTab) {
      console.log(`Mở tab được chỉ định: ${result.activeOptionsTab}`);
      
      // Kích hoạt tab tương ứng
      if (result.activeOptionsTab === 'cookies') {
        // Chuyển sang tab cookie nếu được yêu cầu
        document.getElementById('cookiesTab').click();
      }
      
      // Xóa thông tin tab hoạt động sau khi sử dụng
      chrome.storage.local.remove(['activeOptionsTab'], () => {
        console.log("Đã xóa thông tin tab hoạt động");
      });
    }
  });

  // Phần tử AI settings
  const enableHumanSimulationToggle = document.getElementById("enable-human-simulation");
  const simulationIntensitySelect = document.getElementById("simulation-intensity");
  const simulationTimeSlider = document.getElementById("simulation-time");
  const simulationTimeValue = document.getElementById("simulation-time-value");
  const fillFormsToggle = document.getElementById("fill-forms");
  const mouseMovementSelect = document.getElementById("mouse-movement");
  const scrollBehaviorSelect = document.getElementById("scroll-behavior");

  // Cập nhật giá trị time slider khi thay đổi
  if (simulationTimeSlider) {
    simulationTimeSlider.addEventListener("input", () => {
      if (simulationTimeValue) {
        simulationTimeValue.textContent = simulationTimeSlider.value;
      }
    });
  }

  // Lưu cài đặt AI khi thay đổi
  function saveAISettings() {
    const settings = {
      enableHumanSimulation: enableHumanSimulationToggle?.checked || true,
      simulationIntensity: simulationIntensitySelect?.value || 'medium',
      simulationTime: parseInt(simulationTimeSlider?.value || 30),
      fillForms: fillFormsToggle?.checked || true,
      mouseMovement: mouseMovementSelect?.value || 'natural',
      scrollBehavior: scrollBehaviorSelect?.value || 'natural'
    };

    chrome.storage.local.set(settings, () => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi lưu cài đặt AI:", chrome.runtime.lastError);
        showError("Không thể lưu cài đặt AI");
      } else {
        console.log("Đã lưu cài đặt AI:", settings);
      }
    });
  }

  // Lắng nghe sự kiện thay đổi cho các phần tử AI settings
  if (enableHumanSimulationToggle) {
    enableHumanSimulationToggle.addEventListener("change", saveAISettings);
  }
  if (simulationIntensitySelect) {
    simulationIntensitySelect.addEventListener("change", saveAISettings);
  }
  if (simulationTimeSlider) {
    simulationTimeSlider.addEventListener("change", saveAISettings); // Chỉ lưu khi người dùng thả thanh trượt
  }
  if (fillFormsToggle) {
    fillFormsToggle.addEventListener("change", saveAISettings);
  }
  if (mouseMovementSelect) {
    mouseMovementSelect.addEventListener("change", saveAISettings);
  }
  if (scrollBehaviorSelect) {
    scrollBehaviorSelect.addEventListener("change", saveAISettings);
  }

  // Tải cài đặt AI từ storage khi trang được tải
  function loadAISettings() {
    chrome.storage.local.get([
      "enableHumanSimulation",
      "simulationIntensity",
      "simulationTime",
      "fillForms",
      "mouseMovement",
      "scrollBehavior"
    ], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi tải cài đặt AI:", chrome.runtime.lastError);
        showError("Không thể tải cài đặt AI");
        return;
      }

      // Áp dụng cài đặt đã lưu
      if (enableHumanSimulationToggle && result.enableHumanSimulation !== undefined) {
        enableHumanSimulationToggle.checked = result.enableHumanSimulation;
      }
      if (simulationIntensitySelect && result.simulationIntensity) {
        simulationIntensitySelect.value = result.simulationIntensity;
      }
      if (simulationTimeSlider && result.simulationTime) {
        simulationTimeSlider.value = result.simulationTime;
        if (simulationTimeValue) {
          simulationTimeValue.textContent = result.simulationTime;
        }
      }
      if (fillFormsToggle && result.fillForms !== undefined) {
        fillFormsToggle.checked = result.fillForms;
      }
      if (mouseMovementSelect && result.mouseMovement) {
        mouseMovementSelect.value = result.mouseMovement;
      }
      if (scrollBehaviorSelect && result.scrollBehavior) {
        scrollBehaviorSelect.value = result.scrollBehavior;
      }

      console.log("Đã tải cài đặt AI:", result);
    });
  }

  // Tải cài đặt AI khi trang được tải
  loadAISettings();
  
  // Thêm event listener cho input simulation-time
  if (simulationTimeSlider) {
    simulationTimeSlider.addEventListener('input', function() {
      const simulationTimeValue = document.getElementById('simulation-time-value');
      if (simulationTimeValue) {
        simulationTimeValue.textContent = this.value;
      }
    });
  }

  // Thêm sự kiện cho nút lưu cài đặt AI
  const saveAISettingsButton = document.getElementById("save-ai-settings");
  if (saveAISettingsButton) {
    saveAISettingsButton.addEventListener("click", () => {
      saveAISettings();
      showMessage('Đã lưu cài đặt AI.', 'success');
    });
  }
  
  // Thêm hàm để bật/tắt mô phỏng người dùng ngay khi chuyển toggle
  if (enableHumanSimulationToggle) {
    enableHumanSimulationToggle.addEventListener("change", function() {
      const isEnabled = this.checked;
      console.log(`Mô phỏng người dùng đã được ${isEnabled ? 'BẬT' : 'TẮT'}`);
      
      // Ẩn hiện các tùy chọn khác dựa trên trạng thái toggle
      const simulationOptions = document.querySelectorAll('.simulation-option');
      simulationOptions.forEach(option => {
        option.style.opacity = isEnabled ? '1' : '0.5';
        const inputs = option.querySelectorAll('input, select');
        inputs.forEach(input => {
          input.disabled = !isEnabled;
        });
      });
      
      // Lưu cài đặt ngay lập tức
      saveAISettings();
    });
  }
  
  // Thêm hàm để kiểm tra trạng thái toggle khi tải trang
  function updateSimulationOptionsVisibility() {
    if (enableHumanSimulationToggle) {
      const isEnabled = enableHumanSimulationToggle.checked;
      const simulationOptions = document.querySelectorAll('.simulation-option');
      simulationOptions.forEach(option => {
        option.style.opacity = isEnabled ? '1' : '0.5';
        const inputs = option.querySelectorAll('input, select');
        inputs.forEach(input => {
          input.disabled = !isEnabled;
        });
      });
    }
  }
  
  // Gọi hàm cập nhật hiển thị sau khi tải cài đặt
  document.addEventListener('DOMContentLoaded', () => {
    loadAISettings();
    
    // Đợi một chút để đảm bảo cài đặt đã được áp dụng
    setTimeout(updateSimulationOptionsVisibility, 500);
  });
});
