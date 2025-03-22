document.addEventListener('DOMContentLoaded', function() {
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const statusElement = document.getElementById('status');
  const urlListElement = document.getElementById('urlList');
  const urlCountElement = document.getElementById('urlCount');
  const processedCountElement = document.getElementById('processedCount');
  const errorCountElement = document.getElementById('errorCount');
  const remainingCountElement = document.getElementById('remainingCount');

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

  // Cập nhật trạng thái UI
  function updateStatus(status, isRunning = false) {
    statusElement.textContent = status;
    statusElement.className = 'status ' + (isRunning ? 'running' : 'stopped');
    startButton.disabled = isRunning;
    stopButton.disabled = !isRunning;
  }

  // Cập nhật thống kê
  function updateStats(stats) {
    processedCountElement.textContent = stats.processed || 0;
    errorCountElement.textContent = stats.errors || 0;
    updateRemainingCount();
  }

  // Xử lý nút Bắt đầu
  startButton.addEventListener('click', function() {
    const urls = urlListElement.value.split('\n').filter(url => url.trim() !== '');
    
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

    // Gửi tin nhắn đến background script
    chrome.runtime.sendMessage({
      action: 'start_visits',
      urls: normalizedUrls
    }, response => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi bắt đầu:", chrome.runtime.lastError);
        updateStatus('Lỗi: ' + chrome.runtime.lastError.message);
      } else if (response && response.success) {
        updateStatus('Đang xử lý...', true);
        updateStats({ processed: 0, errors: 0 });
      } else {
        updateStatus(response?.error || 'Không thể bắt đầu quét');
      }
    });
  });

  // Xử lý nút Dừng
  stopButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({
      action: 'stop_visits'
    }, response => {
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
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'status_update') {
      updateStatus(message.status, message.isRunning);
      if (message.stats) {
        updateStats(message.stats);
      }
    }
  });

  // Kiểm tra trạng thái hiện tại khi mở popup
  chrome.runtime.sendMessage({ action: 'get_status' }, response => {
    if (response) {
      updateStatus(response.status, response.isRunning);
      if (response.stats) {
        updateStats(response.stats);
      }
    }
  });
}); 