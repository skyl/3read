(function() {
  var initContentScript, onExtensionMessage, onKeyDown, readSelection;

  readSelection = function() {
    var err, focused, sel, selectedText;
    focused = document.activeElement;
    if (focused) {
      try {
        selectedText = focused.value.substring(focused.selectionStart, focused.selectionEnd);
      } catch (_error) {
        err = _error;
      }
    }
    if (selectedText === void 0) {
      sel = window.getSelection();
      selectedText = sel.toString();
    }
    return chrome.extension.sendRequest({
      'read': selectedText
    });
  };

  onExtensionMessage = function(request) {
    if (request === void 0) {
      return;
    }
    if (request['readSelection'] !== void 0) {
      if (!document.hasFocus()) {
        return;
      }
      return readSelection();
    } else if (request['key'] !== void 0) {
      return window.speakKeyStr = request['key'];
    }
  };

  onKeyDown = function(evt) {
    var keyStr;
    if (!document.hasFocus()) {
      return true;
    }
    keyStr = keyEventToString(evt);
    if (keyStr === window.speakKeyStr && window.speakKeyStr.length > 0) {
      readSelection();
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }
    return true;
  };

  initContentScript = function() {
    chrome.extension.onRequest.addListener(onExtensionMessage);
    chrome.extension.sendRequest({
      'init': true
    }, onExtensionMessage);
    return document.addEventListener('keydown', onKeyDown, false);
  };

  initContentScript();

}).call(this);
