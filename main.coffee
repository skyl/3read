window.TEXT = urlParams['text']
wpm = parseFloat(localStorage['rate'] or 350)


options = {
  size: 10
  height: 0
  curveSegments: 2

  #font: "optimer"
  font: "ubuntu"
  #weight: "bold"
  style: "normal"

  bevelThickness: 2
  bevelSize: 1.5
  bevelEnabled: false

  material: 0
  extrudeMaterial: 1

  delta: 10
  debug: true

  axis: "z"
  wpm: wpm

}

window.origin = new THREE.Vector3 0, 0, 0


class TextScene

  constructor: (@text, @material, @options) ->
    @meshes = []
    @words = @text.trim().split /\s+/g
    @word_place = 0
    @create_pos = new THREE.Vector3 0, 0, 250
    @init()

  init: () ->
    @scene = new THREE.Scene()
    ratio = window.innerWidth / window.innerHeight
    window.camera = @camera = new THREE.PerspectiveCamera 75, ratio, 0.1, 4000
    @renderer = new THREE.WebGLRenderer();
    @renderer.setSize window.innerWidth, window.innerHeight
    document.body.appendChild @renderer.domElement

    if @options.debug
      console.log "DEBUG"
      @init_debug_axis()
      @init_debug_stats()

    @camera.position.x = 0
    @camera.position.y = 100
    @camera.position.z = 100
    @camera.lookAt origin

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
        @create_pos.z += advance * 3
      if word.indexOf(",") isnt -1
        @create_pos.z += advance * 1
    @word_place = next

  create_word: (word, pos) ->
    console.log pos
    textGeo = new THREE.TextGeometry word, @options
    textGeo.computeBoundingBox()
    textGeo.computeVertexNormals()

    textMesh = new THREE.Mesh textGeo, @material.clone()
    textMesh.position = pos.clone()

    textMesh.position.x = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x)

    @meshes.push textMesh
    @scene.add textMesh
    textMesh

  # 20 * 10 with 1 advance
  rewind: (zunits=200) ->
    @create_pos.z += zunits
    for word in @meshes
      word.position.z += zunits
      @doctor_word word

  advance_words: () ->
    #console.log "ADVANCE", @meshes[0].material
    new_time = new Date().getTime()
    diff_sec = (new_time - @time) / 1000.0
    words_per_second = @options.wpm / 60.0
    @time = new_time

    num_words = words_per_second * diff_sec
    advance = num_words * @options.delta
    @init_text num_words, advance

    for word in @meshes
      p = word.position.z -= advance
      @doctor_word word

  doctor_word: (word) ->
      # set opacity based on distance to origin
      centeredp = word.position.clone()
      centeredp.x = 0
      centeredp.y = 0
      lighten = 3.0  # magic
      distance_to_origin = centeredp.distanceTo origin
      opacity = @options.delta / (distance_to_origin * lighten)
      word.material.opacity = opacity
      word.quaternion = @camera.quaternion

  render: () =>
    requestAnimationFrame @render
    if not @paused
      @advance_words()
    if @options.debug
      @stats.update()
    @renderer.render @scene, @camera

  start: () ->
    @time = new Date().getTime()
    @paused = false
    @render()

  pause: () ->
    @paused = true

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


material = new THREE.MeshBasicMaterial color: 0xffffff, transparent: true, opacity: 0.5
window.ts = new TextScene TEXT, material, options
window.addEventListener "keyup", ts.onKeyup, false
window.addEventListener 'resize', ts.onResize, false
ts.start()
