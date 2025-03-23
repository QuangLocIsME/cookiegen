document.addEventListener('DOMContentLoaded', function() {
  const startButton = document.getElementById('start');
  const pauseButton = document.getElementById('pause');
  const stopButton = document.getElementById('stop');
  const statusElement = document.getElementById('status');
  const statusDetailsElement = document.getElementById('statusDetails');
  const currentUrlElement = document.getElementById('currentUrl');
  const progressInfoElement = document.getElementById('progressInfo');
  const processingStatusElement = document.getElementById('processingStatus');
  const urlListElement = document.getElementById('urlList');
  const urlCountElement = document.getElementById('urlCount');
  const processedCountElement = document.getElementById('processedCount');
  const errorCountElement = document.getElementById('errorCount');
  const remainingCountElement = document.getElementById('remainingCount');

  // Kiểm tra các phần tử có tồn tại không
  if (!startButton || !stopButton || !pauseButton || !statusElement || !urlListElement || 
      !urlCountElement || !processedCountElement || !errorCountElement || !remainingCountElement ||
      !statusDetailsElement || !currentUrlElement || !progressInfoElement || !processingStatusElement) {
    console.error("Không thể tìm thấy các phần tử UI cần thiết");
    return;
  }

  // Cập nhật số lượng URL khi nhập
  urlListElement.addEventListener('input', function() {
    const urls = this.value.split('\n').filter(url => url.trim() !== '');
    urlCountElement.textContent = urls.length;
    updateRemainingCount();
  });

  // Cập nhật số lượng URL còn lại
  function updateRemainingCount() {
    const totalUrls = parseInt(urlCountElement.textContent) || 0;
    const processed = parseInt(processedCountElement.textContent) || 0;
    const errors = parseInt(errorCountElement.textContent) || 0;
    remainingCountElement.textContent = totalUrls - processed - errors;
  }

  // Cập nhật trạng thái của các nút
  function updateButtonStates(isRunning, isPaused) {
    startButton.disabled = isRunning;
    pauseButton.disabled = !isRunning || isPaused;
    stopButton.disabled = !isRunning;
    
    if (isPaused) {
      pauseButton.textContent = "Tiếp tục";
    } else {
      pauseButton.textContent = "Tạm dừng";
    }
  }

  // Cập nhật trạng thái UI
  function updateStatus(statusData, isRunning = false, isPaused = false) {
    // Xử lý dữ liệu trạng thái theo định dạng mới
    let statusText = '';
    let statusClass = "status";
    
    // Xử lý định dạng đầu vào khác nhau
    if (typeof statusData === 'string') {
      statusText = statusData;
    } else if (typeof statusData === 'object' && statusData !== null) {
      if (statusData.message) {
        statusText = statusData.message;
      } else if (statusData.status) {
        statusText = statusData.status;
      }
      
      // Áp dụng class dựa trên trạng thái
      if (statusData.status === 'error') {
        statusClass += " error";
      } else if (statusData.status === 'complete') {
        statusClass += " complete";
      } else if (statusData.status === 'paused') {
        statusClass += " paused";
        isPaused = true;
      } else if (statusData.status === 'processing') {
        statusClass += " running";
        isRunning = true;
      }
    }
    
    // Áp dụng class dựa trên trạng thái chung
    if (isRunning) {
      statusClass += " running";
      // Thêm biểu tượng quay để chỉ ra đang xử lý
      if (!isPaused) {
        const processingIndicator = '<span class="processing-indicator"></span>';
        statusText = processingIndicator + statusText;
      }
    } else if (isPaused) {
      statusClass += " paused";
    } else {
      statusClass += " stopped";
    }
    
    statusElement.innerHTML = statusText;
    statusElement.className = statusClass;
    
    // Hiển thị chi tiết trạng thái nếu đang xử lý
    if (isRunning) {
      statusDetailsElement.classList.remove('hidden');
      
      // Cập nhật URL hiện tại từ đối tượng statusData hoặc argument
      if (typeof statusData === 'object' && statusData.currentUrl) {
        currentUrlElement.textContent = statusData.currentUrl;
      }
      
      // Cập nhật trạng thái xử lý (processing, paused, etc)
      if (isPaused) {
        processingStatusElement.textContent = "Tạm dừng";
      } else {
        processingStatusElement.textContent = "Đang xử lý";
      }
    } else {
      statusDetailsElement.classList.add('hidden');
    }
    
    // Cập nhật trạng thái nút
    updateButtonStates(isRunning, isPaused);
  }

  // Cập nhật thống kê
  function updateStats(stats) {
    processedCountElement.textContent = stats.processed || 0;
    errorCountElement.textContent = stats.errors || 0;
    updateRemainingCount();
    
    // Cập nhật tiến độ
    const totalUrls = parseInt(urlCountElement.textContent) || 0;
    const processed = parseInt(processedCountElement.textContent) || 0;
    const errors = parseInt(errorCountElement.textContent) || 0;
    const percent = totalUrls > 0 ? Math.round((processed + errors) / totalUrls * 100) : 0;
    
    progressInfoElement.textContent = `${processed + errors}/${totalUrls} (${percent}%)`;
  }

  // Xử lý nút Bắt đầu
  startButton.addEventListener('click', function() {
    console.log("Nút Bắt đầu được nhấn");
    const urls = urlListElement.value.split('\n').filter(url => url.trim() !== '');
    console.log("URLs đã nhập:", urls);
    
    if (urls.length === 0) {
      updateStatus('Vui lòng nhập danh sách URL');
      return;
    }

    // Chuẩn hóa URLs
    const normalizedUrls = urls.map(url => {
      if (!url.match(/^https?:\/\//i)) {
        return "https://" + url;
      }
      return url;
    });
    
    console.log("URLs đã chuẩn hóa:", normalizedUrls);

    // Gửi tin nhắn đến background script
    chrome.runtime.sendMessage({
      action: 'start_visits',
      urls: normalizedUrls
    }, function(response) {
      console.log("Phản hồi từ background:", response);
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi bắt đầu:", chrome.runtime.lastError);
        updateStatus('Lỗi: ' + chrome.runtime.lastError.message);
      } else if (response && response.success) {
        updateStatus('Đang xử lý...', true, false);
        updateStats({ processed: 0, errors: 0 });
      } else {
        updateStatus(response?.error || 'Không thể bắt đầu quét');
      }
    });
  });

  // Xử lý nút Tạm dừng
  pauseButton.addEventListener('click', function() {
    const isPaused = pauseButton.textContent === "Tiếp tục";
    
    chrome.runtime.sendMessage({
      action: isPaused ? 'resume_visits' : 'pause_visits'
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi tạm dừng/tiếp tục:", chrome.runtime.lastError);
        updateStatus('Lỗi: ' + chrome.runtime.lastError.message);
      } else if (response && response.success) {
        if (isPaused) {
          updateStatus('Đang tiếp tục...', true, false);
          pauseButton.textContent = "Tạm dừng";
        } else {
          updateStatus('Đã tạm dừng', true, true);
          pauseButton.textContent = "Tiếp tục";
        }
      } else {
        updateStatus(response?.error || 'Không thể tạm dừng/tiếp tục');
      }
    });
  });

  // Xử lý nút Dừng
  stopButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({
      action: 'stop_visits'
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi dừng:", chrome.runtime.lastError);
        updateStatus('Lỗi: ' + chrome.runtime.lastError.message);
      } else if (response && response.success) {
        updateStatus('Đã dừng');
      } else {
        updateStatus(response?.error || 'Không thể dừng quét');
      }
    });
  });

  // Lắng nghe cập nhật từ background script
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("Tin nhắn nhận được từ background:", message);
    if (message.type === 'status_update') {
      // Xử lý thông điệp trạng thái với định dạng mới
      if (message.status) {
        // Truyền cả đối tượng status
        updateStatus(message.status, message.isRunning, message.isPaused);
      } else {
        // Tương thích ngược với định dạng cũ
        updateStatus(message.message || "Đang cập nhật...", message.isRunning, message.isPaused);
      }
      
      // Cập nhật thống kê
      if (message.stats) {
        updateStats(message.stats);
      }
      
      // Cập nhật URL hiện tại nếu không có trong message.status
      if (message.currentUrl && (!message.status || !message.status.currentUrl)) {
        currentUrlElement.textContent = message.currentUrl;
      }
      
      // Cập nhật thông tin progress nếu có
      if (message.status && message.status.progress) {
        const progress = message.status.progress;
        processedCountElement.textContent = progress.processed || 0;
        errorCountElement.textContent = progress.errors || 0;
        remainingCountElement.textContent = progress.remaining || 0;
        
        // Tính toán tổng số URL
        const total = (progress.processed || 0) + (progress.errors || 0) + (progress.remaining || 0);
        urlCountElement.textContent = total;
        
        // Cập nhật phần trăm
        const percent = total > 0 ? Math.round((progress.processed + progress.errors) / total * 100) : 0;
        progressInfoElement.textContent = `${progress.processed + progress.errors}/${total} (${percent}%)`;
      }
    }
  });

  // Kiểm tra trạng thái hiện tại khi mở popup
  chrome.runtime.sendMessage({ action: 'get_status' }, function(response) {
    console.log("Trạng thái hiện tại:", response);
    if (response) {
      // Xử lý phản hồi với định dạng mới
      if (response.status) {
        // Định dạng mới, status là một đối tượng
        if (typeof response.status === 'object') {
          updateStatus(response.status, response.isRunning, response.isPaused);
        } else {
          // Định dạng cũ, status là một chuỗi
          updateStatus(response.status, response.isRunning, response.isPaused);
        }
      } else {
        // Fallback nếu không có trường status
        updateStatus("Không có trạng thái", response.isRunning || false, response.isPaused || false);
      }
      
      // Cập nhật thống kê
      if (response.stats) {
        updateStats(response.stats);
      }
      
      // Cập nhật URL hiện tại nếu có
      if (response.currentUrl) {
        currentUrlElement.textContent = response.currentUrl;
      }
      
      // Cập nhật thông tin progress nếu có
      if (response.progress) {
        const progress = response.progress;
        processedCountElement.textContent = progress.processed || 0;
        errorCountElement.textContent = progress.errors || 0;
        remainingCountElement.textContent = progress.remaining || 0;
        
        // Tính toán tổng số URL
        const total = (progress.processed || 0) + (progress.errors || 0) + (progress.remaining || 0);
        urlCountElement.textContent = total;
        
        // Cập nhật phần trăm
        const percent = total > 0 ? Math.round((progress.processed + progress.errors) / total * 100) : 0;
        progressInfoElement.textContent = `${progress.processed + progress.errors}/${total} (${percent}%)`;
      }
    }
  });
}); 