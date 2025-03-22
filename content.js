console.log("Content script running on:", window.location.href);

// Reset any previous state when a new URL is loaded
let pageProcessed = false;

/**
 * Utilities to create natural human-like interactions
 */
const Human = {
  // Random delay between min and max milliseconds
  delay: async function(min, max) {
    const delayTime = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delayTime));
  },
  
  // Simulate human-like scrolling (smooth, with pauses)
  scrollNaturally: async function() {
    console.log("Starting natural scrolling");
    
    const viewportHeight = window.innerHeight;
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    
    if (pageHeight <= viewportHeight) {
      console.log("Page too small to scroll");
      return;
    }
    
    // Scroll down in steps with pauses (like a human reading)
    let currentPosition = 0;
    const maxScrolls = Math.min(Math.floor(pageHeight / (viewportHeight / 2)), 8); // Limit scrolls
    const scrollsToPerform = 3 + Math.floor(Math.random() * (maxScrolls - 2));
    
    for (let i = 0; i < scrollsToPerform; i++) {
      // Scroll down by a variable amount (between 30% and 80% of viewport)
      const scrollAmount = Math.floor(viewportHeight * (0.3 + Math.random() * 0.5));
      currentPosition += scrollAmount;
      
      // Don't scroll past the bottom
      if (currentPosition > pageHeight) {
        currentPosition = pageHeight;
      }
      
      window.scrollTo({
        top: currentPosition,
        behavior: 'smooth'
      });
      
      // Pause like a human reading content
      await this.delay(1500, 4000);
    }
    
    // Sometimes scroll back up partially
    if (Math.random() > 0.5 && currentPosition > viewportHeight) {
      const upScrollAmount = Math.floor(currentPosition * (0.3 + Math.random() * 0.4));
      currentPosition -= upScrollAmount;
      
      window.scrollTo({
        top: currentPosition,
        behavior: 'smooth'
      });
      
      await this.delay(1200, 2500);
    }
    
    console.log("Finished scrolling");
  },
  
  // Find interactive elements like links, buttons, inputs
  findInteractiveElements: function() {
    // Common interactive elements to look for
    const elements = {
      links: Array.from(document.querySelectorAll('a')).filter(el => el.offsetParent !== null),
      buttons: Array.from(document.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"]')).filter(el => el.offsetParent !== null),
      inputs: Array.from(document.querySelectorAll('input[type="text"], input[type="email"], textarea')).filter(el => el.offsetParent !== null),
      checkboxes: Array.from(document.querySelectorAll('input[type="checkbox"]')).filter(el => el.offsetParent !== null),
      dropdowns: Array.from(document.querySelectorAll('select')).filter(el => el.offsetParent !== null)
    };
    
    // Count all visible interactive elements
    const totalElements = Object.values(elements).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`Found ${totalElements} interactive elements:`, 
      Object.entries(elements).map(([type, arr]) => `${type}: ${arr.length}`).join(', '));
    
    return elements;
  },
  
  // Simulate mouse movement to an element (no actual mouse movement, but adds delay)
  moveMouseTo: async function(element) {
    // We can't actually move the mouse with content scripts,
    // but we can simulate the timing it would take
    if (!element) return;
    
    try {
      const rect = element.getBoundingClientRect();
      console.log(`Simulating mouse movement to: ${element.tagName} (${element.textContent?.substring(0, 20) || 'no text'}...)`);
      
      // Simulate the time it takes to move a mouse
      await this.delay(300, 800);
    } catch (e) {
      console.error("Error in moveMouseTo:", e);
    }
  },
  
  // Fill an input field with realistic typing
  typeIntoField: async function(inputElement, text) {
    if (!inputElement || !text) return;
    
    try {
      console.log(`Typing into ${inputElement.tagName} ${inputElement.id || inputElement.name || ''}`);
      inputElement.focus();
      
      // Clear existing value
      inputElement.value = '';
      
      // Type each character with a random delay
      for (const char of text) {
        inputElement.value += char;
        // Dispatch input event to trigger any listeners
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        // Human typing delay (faster typists: 30-100ms per character)
        await this.delay(30, 100); 
      }
      
      // Dispatch change event
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Sometimes unfocus after typing
      if (Math.random() > 0.5) {
        await this.delay(300, 700);
        inputElement.blur();
      }
    } catch (e) {
      console.error("Error in typeIntoField:", e);
    }
  },
  
  // Click on an element with human-like behavior
  clickElement: async function(element) {
    if (!element) return;
    
    try {
      await this.moveMouseTo(element);
      
      // Extract element info for logging
      const elementText = element.textContent?.trim().substring(0, 30) || '';
      const elementType = element.tagName.toLowerCase();
      const elementId = element.id ? `#${element.id}` : '';
      const elementClass = element.className && typeof element.className === 'string' ? `.${element.className.split(' ')[0]}` : '';
      
      console.log(`Clicking on ${elementType}${elementId}${elementClass}: "${elementText}"`);
      
      // Small delay before click (like a human hesitating)
      await this.delay(200, 500);
      
      // Click the element
      element.click();
      
      // Wait after clicking
      await this.delay(1000, 2500);
    } catch (e) {
      console.error("Error clicking element:", e);
    }
  },
  
  // Select an option from a dropdown
  selectFromDropdown: async function(selectElement) {
    if (!selectElement || !selectElement.options || selectElement.options.length === 0) return;
    
    try {
      await this.moveMouseTo(selectElement);
      
      // Click to open dropdown
      selectElement.focus();
      await this.delay(300, 800);
      
      // Select a random option (excluding first if it's often a placeholder)
      const startIndex = selectElement.options.length > 1 ? 1 : 0;
      const optionIndex = startIndex + Math.floor(Math.random() * (selectElement.options.length - startIndex));
      const option = selectElement.options[optionIndex];
      
      console.log(`Selecting option "${option.text}" from dropdown`);
      selectElement.selectedIndex = optionIndex;
      
      // Trigger change event
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      await this.delay(500, 1200);
    } catch (e) {
      console.error("Error in selectFromDropdown:", e);
    }
  },
  
  // Toggle a checkbox or radio button
  toggleCheckbox: async function(checkboxElement) {
    if (!checkboxElement) return;
    
    try {
      await this.moveMouseTo(checkboxElement);
      
      const isChecked = checkboxElement.checked;
      console.log(`${isChecked ? 'Unchecking' : 'Checking'} checkbox ${checkboxElement.name || checkboxElement.id || ''}`);
      
      await this.delay(200, 600);
      checkboxElement.click();
      
      await this.delay(500, 1000);
    } catch (e) {
      console.error("Error in toggleCheckbox:", e);
    }
  },
  
  // Main function to interact with the page in a human-like way
  interact: async function() {
    // Initial wait for page to settle
    await this.delay(1000, 2000);
    
    // Scroll like a human reading the page
    await this.scrollNaturally();
    
    // Find all interactive elements
    const elements = this.findInteractiveElements();
    
    // Start with 2-4 random interactions
    const interactionCount = 2 + Math.floor(Math.random() * 3);
    console.log(`Performing ${interactionCount} random interactions`);
    
    for (let i = 0; i < interactionCount; i++) {
      // Determine which type of element to interact with
      const elementTypes = Object.keys(elements).filter(type => elements[type].length > 0);
      
      if (elementTypes.length === 0) {
        console.log("No interactive elements available");
        break;
      }
      
      const randomType = elementTypes[Math.floor(Math.random() * elementTypes.length)];
      const elementsOfType = elements[randomType];
      const randomElement = elementsOfType[Math.floor(Math.random() * elementsOfType.length)];
      
      // Pop this element so we don't interact with it again
      elementsOfType.splice(elementsOfType.indexOf(randomElement), 1);
      
      // Perform different actions based on element type
      switch (randomType) {
        case 'links':
          if (Math.random() > 0.7) { // Only click some links to avoid leaving page too often
            await this.clickElement(randomElement);
          }
          break;
        case 'buttons':
          await this.clickElement(randomElement);
          break;
        case 'inputs':
          // Generate sample text based on input type
          let sampleText = "Sample text";
          if (randomElement.type === 'email') {
            sampleText = "test@example.com";
          } else if (randomElement.name && randomElement.name.includes('search')) {
            sampleText = "product information";
          }
          await this.typeIntoField(randomElement, sampleText);
          break;
        case 'checkboxes':
          await this.toggleCheckbox(randomElement);
          break;
        case 'dropdowns':
          await this.selectFromDropdown(randomElement);
          break;
      }
      
      // Wait between interactions
      await this.delay(1000, 3000);
    }
    
    // Final scrolling to see results of interactions
    await this.scrollNaturally();
    
    console.log("Completed human-like interactions");
  }
};

// Main function to handle the page
async function handlePage() {
  // Avoid processing the same page multiple times
  if (pageProcessed) {
    console.log("This page has already been processed");
    return;
  }
  
  console.log("Starting human-like page interaction for:", window.location.href);
  pageProcessed = true;
  
  try {
    // Perform human-like interactions
    await Human.interact();
    
    // Wait a bit more for any cookies to be set after interaction
    await Human.delay(2000, 4000);
    
    // Signal we're done with this URL
    chrome.runtime.sendMessage({
      action: "save_cookies",
      domain: window.location.hostname,
      url: window.location.href
    });
    
  } catch (e) {
    console.error("Error during page handling:", e);
    // Still try to save cookies even if there was an error
    chrome.runtime.sendMessage({
      action: "save_cookies",
      domain: window.location.hostname,
      url: window.location.href
    });
  }
}

// Start the process when the page loads
// But also handle history navigation events
handlePage();

// Listen for navigation events within the same tab
window.addEventListener('popstate', () => {
  pageProcessed = false;
  handlePage();
});

// We also need to listen for navigations triggered programmatically
// (unfortunately we can't detect all of them without a background script)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    pageProcessed = false;
    handlePage();
  }
}).observe(document, {subtree: true, childList: true});

// Hàm spoof site
function spoofSite() {
  try {
    // Lấy domain hiện tại
    const currentDomain = window.location.hostname;
    console.log("Domain hiện tại:", currentDomain);
    
    // Lưu domain gốc vào storage
    chrome.storage.local.set({ originalDomain: currentDomain }, () => {
      if (chrome.runtime.lastError) {
        console.error("Lỗi khi lưu domain:", chrome.runtime.lastError);
        return false;
      }
    });
    
    // Thay đổi các thuộc tính của window.location
    const originalLocation = window.location;
    const spoofedLocation = {
      hostname: "example.com",
      host: "example.com",
      href: "https://example.com",
      origin: "https://example.com",
      protocol: "https:",
      pathname: "/",
      search: "",
      hash: ""
    };
    
    // Ghi đè các thuộc tính của location
    Object.defineProperties(window, {
      location: {
        get: function() {
          return {
            ...originalLocation,
            ...spoofedLocation,
            toString: function() {
              return spoofedLocation.href;
            }
          };
        }
      }
    });
    
    // Ghi đè document.domain
    Object.defineProperty(document, "domain", {
      get: function() {
        return "example.com";
      }
    });
    
    // Ghi đè document.cookie
    const originalCookie = document.cookie;
    Object.defineProperty(document, "cookie", {
      get: function() {
        return originalCookie;
      },
      set: function(value) {
        // Lưu cookie vào storage
        chrome.storage.local.get("cookieData", (data) => {
          if (chrome.runtime.lastError) {
            console.error("Lỗi khi lấy cookieData:", chrome.runtime.lastError);
            return;
          }
          
          let cookieData = data.cookieData || {};
          if (!cookieData[currentDomain]) {
            cookieData[currentDomain] = [];
          }
          
          // Thêm cookie mới
          cookieData[currentDomain].push({
            name: value.split("=")[0],
            value: value.split("=")[1].split(";")[0],
            domain: currentDomain,
            path: "/",
            timestamp: new Date().getTime()
          });
          
          chrome.storage.local.set({ cookieData }, () => {
            if (chrome.runtime.lastError) {
              console.error("Lỗi khi lưu cookieData:", chrome.runtime.lastError);
            }
          });
        });
      }
    });
    
    // Ghi đè các hàm liên quan đến domain
    window.navigator.__defineGetter__("language", function() {
      return "en-US";
    });
    
    // Ghi đè các thuộc tính của navigator
    const originalNavigator = window.navigator;
    Object.defineProperties(window.navigator, {
      userAgent: {
        get: function() {
          return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
        }
      },
      platform: {
        get: function() {
          return "Win32";
        }
      },
      vendor: {
        get: function() {
          return "Google Inc.";
        }
      }
    });
    
    // Ghi đè các hàm liên quan đến storage
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      get: function() {
        return {
          getItem: function(key) {
            return originalLocalStorage.getItem(key);
          },
          setItem: function(key, value) {
            originalLocalStorage.setItem(key, value);
          },
          removeItem: function(key) {
            originalLocalStorage.removeItem(key);
          },
          clear: function() {
            originalLocalStorage.clear();
          },
          length: originalLocalStorage.length,
          key: function(index) {
            return originalLocalStorage.key(index);
          }
        };
      }
    });
    
    // Ghi đè các hàm liên quan đến sessionStorage
    const originalSessionStorage = window.sessionStorage;
    Object.defineProperty(window, "sessionStorage", {
      get: function() {
        return {
          getItem: function(key) {
            return originalSessionStorage.getItem(key);
          },
          setItem: function(key, value) {
            originalSessionStorage.setItem(key, value);
          },
          removeItem: function(key) {
            originalSessionStorage.removeItem(key);
          },
          clear: function() {
            originalSessionStorage.clear();
          },
          length: originalSessionStorage.length,
          key: function(index) {
            return originalSessionStorage.key(index);
          }
        };
      }
    });
    
    console.log("Đã spoof thành công!");
    return true;
  } catch (error) {
    console.error("Lỗi khi spoof site:", error);
    return false;
  }
}

// Lắng nghe tin nhắn từ popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "spoof_site") {
    console.log("Nhận được yêu cầu spoof site");
    try {
      const success = spoofSite();
      console.log("Kết quả spoof:", success);
      sendResponse({ success });
    } catch (error) {
      console.error("Lỗi khi xử lý yêu cầu spoof:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});

// Thông báo khi content script được load
console.log("Content script đã được load");