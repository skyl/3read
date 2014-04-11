version = chrome.app.getDetails().version
if localStorage['lastVersionUsed'] isnt version
  localStorage['lastVersionUsed'] = version
  chrome.tabs.create {
    url: chrome.extension.getURL('options.html')
  }


funcToInject = () ->
  return window.getSelection().toString()

jsCodeStr = ";(" + funcToInject + ")();"


start_callback = (e) ->
  details = {
    code: jsCodeStr,
    allFrames:true
  }
  cb = (arr) ->
    if (chrome.runtime.lastError)
      console.log chrome.runtime.lastError
      read chrome.runtime.lastError.message
    else
      read arr[0]
  chrome.tabs.executeScript details, cb


read = (text) ->
  text = encodeURIComponent text
  opts = {
    url: chrome.extension.getURL("main.html?text=#{text}")
    # TODO - save width and height
    width: 960
    height: 600
    type: "popup"
    #state: "fullscreen"
  }
  cb = (wind) ->
    if localStorage['fullscreen'] is "true"
      chrome.windows.update wind.id, {state: "fullscreen"}
  chrome.windows.create opts, cb


context_read = (context) ->
  read context.selectionText


chrome.commands.onCommand.addListener start_callback
chrome.browserAction.onClicked.addListener start_callback
chrome.contextMenus.create {
  "title": "3read",
  "contexts": ["selection"],
  "onclick": context_read,
}
