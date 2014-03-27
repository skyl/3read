(function() {
  var initBackground, onClicked, onRequest, read;

  read = function(text) {
    var cb, opts;
    text = encodeURIComponent(text);
    console.log("READING!", text);
    opts = {
      url: chrome.extension.getURL("main.html?text=" + text),
      width: 960,
      height: 600,
      type: "popup"
    };
    cb = function(wind) {};
    return chrome.windows.create(opts, cb);
  };

  onRequest = function(request, sender, sendResponse) {
    if (request['init']) {
      return sendResponse({
        'key': localStorage['speakKey']
      });
    } else if (request['read']) {
      return read(request['read']);
    }
  };

  onClicked = function(tab) {
    return chrome.tabs.sendRequest(tab.id, {
      'readSelection': true
    });
  };

  initBackground = function() {
    var defaultKeyString, keyString;
    loadContentScriptInAllTabs();
    defaultKeyString = getDefaultKeyString();
    keyString = localStorage['speakKey'];
    if (keyString === void 0) {
      keyString = defaultKeyString;
      localStorage['speakKey'] = keyString;
    }
    sendKeyToAllTabs(keyString);
    chrome.extension.onRequest.addListener(onRequest);
    return chrome.browserAction.onClicked.addListener(onClicked);
  };

  initBackground();

}).call(this);
