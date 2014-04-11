window.TEXT = urlParams['text']
wpm = parseFloat(localStorage['rate'] or 350)


options = {
  color: new THREE.Color(0xffffff)
  #color: new THREE.Color 0x000000
  size: 10
  height: 0
  curveSegments: 2

  font: "ubuntu"
  style: "normal"

  bevelThickness: 2
  bevelSize: 1.5
  bevelEnabled: false

  material: 0
  extrudeMaterial: 1

  delta: 12
  #debug: true

  axis: "z"
  wpm: wpm

  # first iteration had "away" == true
  # so, away = false means the words come at you.
  #away: false
  away: true

}

window.origin = new THREE.Vector3 0, 0, 0
window.focus = new THREE.Vector3 0, 0, 40



class TextScene

  constructor: (@text, @material, @options) ->
    @words = @text.trim().split /\s+/g
    @word_place = 0
    if @options.away
      @create_pos = new THREE.Vector3 0, 0, @options.delta * 10
      @limit = -500
    else
      @create_pos = new THREE.Vector3 0, 0, -(@options.delta * 10)
      @limit = 500

    @init()

  init: () ->
    @scene = new THREE.Scene()
    ratio = window.innerWidth / window.innerHeight
    window.camera = @camera = new THREE.PerspectiveCamera 75, ratio, 0.1, 4000
    @renderer = new THREE.WebGLRenderer()
    @renderer.setSize window.innerWidth, window.innerHeight
    #@renderer.setClearColorHex 0xffffff, 1
    document.body.appendChild @renderer.domElement

    if @options.debug
      console.log "DEBUG"
      @init_debug_axis()
      @init_debug_stats()

    @camera.position.x = 0
    @camera.position.y = 100
    @camera.position.z = 100
    @camera.lookAt origin
    @group = new THREE.Object3D()
    @scene.add @group
    @init_text()

  init_debug_stats: () ->
    @stats = new Stats()
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.top = '0px'
    document.body.appendChild @stats.domElement

  init_debug_axis: () ->
    mat = new THREE.LineBasicMaterial {linewidth: 3, color: 0xffffff}
    self = @
    make_line = (start, end) ->
      geom = new THREE.Geometry()
      axis = new THREE.Line geom, mat, THREE.LinePieces
      geom.vertices.push start.clone()
      geom.vertices.push end.clone()
      self.scene.add axis
    l = 1000
    make_line new THREE.Vector3(-l, 0, 0), new THREE.Vector3(l, 0, 0)
    make_line new THREE.Vector3(0, -l, 0), new THREE.Vector3(0, l, 0)
    make_line new THREE.Vector3(0, 0, -l), new THREE.Vector3(0, 0, l)

  init_text: (per=1, advance=0) ->
    next = @word_place + per
    for word in @words.slice @word_place, next
      @create_pos.z += advance
      tm = @create_word word, @create_pos
      # add extra space for punctuation
      if (word.indexOf(".") isnt -1) and (word.split('.').length - 1 == 1)
        @create_pos.z += advance * 4
      if word.indexOf(",") isnt -1
        @create_pos.z += advance * 2
    @word_place = next

  create_word: (word, pos) ->
    textGeo = new THREE.TextGeometry word, @options
    textGeo.computeBoundingBox()
    textGeo.computeVertexNormals()

    textMesh = new THREE.Mesh textGeo, @material
    textMesh.position = pos.clone()
    textMesh.position.x = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x)
    textMesh.position.z -= @group.position.z
    textMesh.quaternion = @camera.quaternion

    @group.add textMesh
    textMesh

  # 20 * 10 with 1 advance
  rewind: (zunits=200) ->
    if @options.away
      @create_pos.z += zunits
      @group.position.z += zunits
    else
      @create_pos.z -= zunits
      @group.position.z -= zunits
    if @paused
      @renderer.render @scene, @camera

  advance_words: () ->
    new_time = new Date().getTime()
    diff_sec = (new_time - @time) / 1000.0
    words_per_second = @options.wpm / 60.0
    @time = new_time

    num_words = words_per_second * diff_sec
    advance = num_words * @options.delta
    if not @options.away
      advance = -advance
    @init_text num_words, advance

    @group.position.z -= advance

    if @group.children.length > 0
      @clear()

  clear: () ->
    # this is a performance thing
    # but, then we can't rewind too much ...
    # not sure where to go with this.
    if @options.away
      while (@group.children[0].position.z + @group.position.z) < @limit
        @group.remove(@group.children[0])
    else
      while (@group.children[0].position.z + @group.position.z) > @limit
        @group.remove(@group.children[0])

  animate: () =>
    @animation_id = requestAnimationFrame @animate
    @render()

  render: () ->
    @advance_words()
    @renderer.render @scene, @camera
    if @options.debug
      @stats.update()

  start: () ->
    @time = new Date().getTime()
    @paused = false
    @animate()

  pause: () ->
    @paused = true
    cancelAnimationFrame @animation_id

  onKeyup: (ev) =>
    # Alt+UP is rewind
    if ev.altKey
      if ev.keyCode is 38
        @rewind()
        return

    switch ev.keyCode
      when 32  # space
        if @paused
          @start()
        else
          @pause()
      when 38  # up arrow
        @options.wpm += 10
        localStorage['rate'] = parseFloat(localStorage['rate']) + 10
      when 40  # down arrow
        @options.wpm -= 10
        localStorage['rate'] = parseFloat(localStorage['rate']) - 10
      when 27, 81  # escape or q
        window.close()

  onResize: (ev) =>
    @renderer.setSize window.innerWidth, window.innerHeight
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();


main = () ->
  xhr = new XMLHttpRequest()
  xhr.open "get", "shaders.c", false
  xhr.send null
  window.shaders = xhr.responseText.split "//FRAGMENT"
  window.vertex_shader = shaders[0]
  window.fragment_shader = shaders[1]
  #console.log "OK"
  #console.log "shaders", shaders
  #console.log "vertex_shader", vertex_shader
  #console.log "fragment_shader", fragment_shader

  # attributes
  attributes = {
    alpha: {type: 'f', value: []}
  }
  # uniforms
  uniforms = {
    color: {type: "c", value: options.color}
    # these are in 2d y, for now ...
    delta: {type: "f", value: options.delta / 10.0}
    focus: {type: "f", value: -40.0}
  }
  shaderMaterial = new THREE.ShaderMaterial {
    uniforms: uniforms
    attributes: attributes
    vertexShader: vertex_shader
    fragmentShader: fragment_shader
    transparent: true
  }

  material = shaderMaterial
  window.ts = new TextScene TEXT, material, options
  window.addEventListener "keyup", ts.onKeyup, false
  window.addEventListener 'resize', ts.onResize, false
  ts.start()

window.onload = main
