

readSelection = () ->
  focused = document.activeElement
  if focused
    try
      selectedText = focused.value.substring focused.selectionStart, focused.selectionEnd
    catch err
      #console.log err

  if selectedText is undefined
    sel = window.getSelection()
    selectedText = sel.toString()
  #console.log "readSelection sending"
  chrome.extension.sendRequest {'read': selectedText}


onExtensionMessage = (request) ->
  #console.log "onExtensionMessage", request
  if request is undefined
    return
  if request['readSelection'] isnt undefined
    if !document.hasFocus()
      return
    readSelection()
  else if request['key'] isnt undefined
    window.speakKeyStr = request['key']


onKeyDown = (evt) ->
  if !document.hasFocus()
    return true
  keyStr = keyEventToString(evt)
  if (keyStr is window.speakKeyStr and window.speakKeyStr.length > 0)
    readSelection()
    evt.stopPropagation()
    evt.preventDefault()
    return false
  return true


initContentScript = () ->
  chrome.extension.onRequest.addListener onExtensionMessage
  chrome.extension.sendRequest({'init': true}, onExtensionMessage)
  document.addEventListener 'keydown', onKeyDown, false

initContentScript();
