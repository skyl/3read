#console.log "BACKGROUND!"

if localStorage['lastVersionUsed'] isnt '0.0.1'
  localStorage['lastVersionUsed'] = '0.0.1'
  chrome.tabs.create {
    url: chrome.extension.getURL('options.html')
  }


read = (text) ->
  text = encodeURIComponent text
  console.log "READING!", text
  opts = {
    url: chrome.extension.getURL("main.html?text=#{text}")
    width: 960
    height: 600
    type: "popup"
  }
  cb = (wind) ->
    if localStorage['fullscreen'] is "true"
      chrome.windows.update wind.id, {state: "fullscreen"}
  chrome.windows.create opts, cb


onRequest = (request, sender, sendResponse) ->
  #console.log "background onRequest!"
  if request['init']
    sendResponse {'key': localStorage['speakKey']}
  else if request['read']
    read request['read']


onClicked = (tab) ->
  #console.log "background onClicked"
  chrome.tabs.sendRequest tab.id, {'readSelection': true}


initBackground = () ->
  #console.log "initBackground"
  # ???
  loadContentScriptInAllTabs()
  defaultKeyString = getDefaultKeyString();
  keyString = localStorage['speakKey']
  if keyString is undefined
    keyString = defaultKeyString
    localStorage['speakKey'] = keyString
  sendKeyToAllTabs keyString

  chrome.extension.onRequest.addListener onRequest

  chrome.browserAction.onClicked.addListener onClicked

initBackground();
