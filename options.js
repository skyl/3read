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
  fs = localStorage['fullscreen'] || "false";
  fsElement = document.getElementById('fullscreen');
  fsElement.checked = localStorage['fullscreen'] = (fs === "true");
  function fslistener(evt) {
    localStorage['fullscreen'] = fs = fsElement.checked
  }
  fsElement.addEventListener('change', fslistener, false);

  document.getElementById("extensions").addEventListener('click', function() {
    chrome.tabs.update({url: 'chrome://extensions'});
  });
}

document.addEventListener('DOMContentLoaded', load);
