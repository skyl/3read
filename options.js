// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function load() {

  // wpm
  var rateElement = document.getElementById('rate');
  var rate = localStorage['rate'] || 300;
  localStorage['rate'] = rate;
  document.getElementById('wpm_feedback').innerHTML = rate;
  rateElement.value = rate;

  function listener(evt) {
    rate = rateElement.value;
    localStorage['rate'] = rate;
    document.getElementById('wpm_feedback').innerHTML = rate;
  }
  rateElement.addEventListener('change', listener, false);
  rateElement.addEventListener('keyup', listener, false);
  rateElement.addEventListener('mouseup', listener, false);


  // fullscreen
  fs = localStorage['fullscreen'] || "true";
  fsElement = document.getElementById('fullscreen');
  fsElement.checked = localStorage['fullscreen'] = (fs === "true");
  function fslistener(evt) {
    localStorage['fullscreen'] = fs = fsElement.checked
  }
  fsElement.addEventListener('change', fslistener, false);





  // getDefaultKeyString is from keycodes.js
  var defaultKeyString = getDefaultKeyString();

  var keyString = localStorage['speakKey'];
  if (keyString == undefined) {
    keyString = defaultKeyString;
  }

  var hotKeyElement = document.getElementById('hotkey');
  hotKeyElement.value = keyString;
  hotKeyElement.addEventListener('keydown', function(evt) {
    switch (evt.keyCode) {
      case 27:  // Escape
        evt.stopPropagation();
        evt.preventDefault();
        hotKeyElement.blur();
        return false;
      case 8:   // Backspace
      case 46:  // Delete
        evt.stopPropagation();
        evt.preventDefault();
        hotKeyElement.value = '';
        localStorage['speakKey'] = '';
        sendKeyToAllTabs('');
        window.speakKeyStr = '';
        return false;
      case 9:  // Tab
        return false;
      case 16:  // Shift
      case 17:  // Control
      case 18:  // Alt/Option
      case 91:  // Meta/Command
        evt.stopPropagation();
        evt.preventDefault();
        return false;
    }
    var keyStr = keyEventToString(evt);
    if (keyStr) {
      hotKeyElement.value = keyStr;
      localStorage['speakKey'] = keyStr;
      sendKeyToAllTabs(keyStr);

      // Set the key used by the content script running in the options page.
      window.speakKeyStr = keyStr;
    }
    evt.stopPropagation();
    evt.preventDefault();
    return false;
  }, true);
}

document.addEventListener('DOMContentLoaded', load);
