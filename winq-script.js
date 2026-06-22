(function () {
  "use strict";

  var observer;
  var scheduled = false;
  var delayedRun = 0;
  var initializedAttr = "data-winq-auth-tabs-initialized";

  function getButtonText(button) {
    return (button && button.textContent ? button.textContent : "").trim().toLowerCase();
  }

  function findButtons(tablist) {
    // Selects all role="tab" elements safely inside the container
    var buttons = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"], button'));
    
    // Comprehensive language keywords for email and phone registration tabs
    var emailKeywords = ["email", "ኢሜይል", "ኢሜል", "በኢሜይል"];
    var phoneKeywords = ["phone", "ስልክ", "ስልክ ቁጥር", "በስልክ"];

    var emailButton = buttons.find(function (button) {
      var text = getButtonText(button);
      return emailKeywords.some(function(keyword) { return text.indexOf(keyword) !== -1; });
    });
    
    var phoneButton = buttons.find(function (button) {
      var text = getButtonText(button);
      return phoneKeywords.some(function(keyword) { return text.indexOf(keyword) !== -1; });
    });

    return {
      emailButton: emailButton,
      phoneButton: phoneButton
    };
  }

  function reorderTabs(tablist, phoneButton, emailButton) {
    var phoneItem = phoneButton.closest('li') || phoneButton;
    var emailItem = emailButton.closest('li') || emailButton;

    if (!phoneItem || !emailItem || phoneItem === emailItem) {
      return;
    }

    // Swaps the node layout placement natively inside the list
    if (tablist.firstElementChild !== phoneItem) {
      tablist.insertBefore(phoneItem, emailItem);
    }
  }

  function initializeTabState(tablist) {
    if (!tablist) return;

    var buttonSet = findButtons(tablist);
    var emailButton = buttonSet.emailButton;
    var phoneButton = buttonSet.phoneButton;

    if (!emailButton || !phoneButton) return;

    // Correct structural tab ordering layout positioning
    reorderTabs(tablist, phoneButton, emailButton);

    if (tablist.getAttribute(initializedAttr) === "true") return;

    // Automates programmatic selection fallback focus if phone isn't highlighted
    var isCurrent = phoneButton.getAttribute("aria-current") === "page" || 
                    phoneButton.getAttribute("aria-selected") === "true" ||
                    phoneButton.classList.contains("active");

    if (!isCurrent) {
      phoneButton.click();
    }

    tablist.setAttribute(initializedAttr, "true");
  }

  function run() {
    scheduled = false;

    // Scans globally for generic tab lists inside modals or registration sections
    var tablists = Array.prototype.slice.call(document.querySelectorAll('[role="tablist"], ul'));
    tablists.forEach(function (tablist) {
      // Makes sure it's an authentic registration/login component container
      var text = tablist.textContent.toLowerCase();
      if (text.indexOf("сልክ") !== -1 || text.indexOf("phone") !== -1 || text.indexOf("ስልክ") !== -1 || text.indexOf("email") !== -1) {
        initializeTabState(tablist);
      }
    });
  }

  function scheduleRun() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(run);
  }

  function init() {
    scheduleRun();

    // Setup an observer to run logic dynamically when modals open/render on screen
    observer = new MutationObserver(function () {
      scheduleRun();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
