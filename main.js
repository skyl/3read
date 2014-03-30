(function() {
  var TextScene, material, options, wpm,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.TEXT = urlParams['text'];

  wpm = parseFloat(localStorage['rate'] || 350);

  options = {
    size: 10,
    height: 0,
    curveSegments: 2,
    font: "ubuntu",
    style: "normal",
    bevelThickness: 2,
    bevelSize: 1.5,
    bevelEnabled: false,
    material: 0,
    extrudeMaterial: 1,
    delta: 10,
    axis: "z",
    wpm: wpm
  };

  window.origin = new THREE.Vector3(0, 0, 0);

  window.focus = new THREE.Vector3(0, 0, 40);

  TextScene = (function() {
    function TextScene(text, material, options) {
      this.text = text;
      this.material = material;
      this.options = options;
      this.onResize = __bind(this.onResize, this);
      this.onKeyup = __bind(this.onKeyup, this);
      this.render = __bind(this.render, this);
      this.words = this.text.trim().split(/\s+/g);
      this.word_place = 0;
      this.create_pos = new THREE.Vector3(0, 0, this.options.delta * 10);
      this.init();
    }

    TextScene.prototype.init = function() {
      var ratio;
      this.scene = new THREE.Scene();
      ratio = window.innerWidth / window.innerHeight;
      window.camera = this.camera = new THREE.PerspectiveCamera(75, ratio, 0.1, 4000);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
      if (this.options.debug) {
        console.log("DEBUG");
        this.init_debug_axis();
        this.init_debug_stats();
      }
      this.camera.position.x = 0;
      this.camera.position.y = 100;
      this.camera.position.z = 100;
      this.camera.lookAt(origin);
      this.group = new THREE.Object3D();
      this.scene.add(this.group);
      return this.init_text();
    };

    TextScene.prototype.init_debug_stats = function() {
      this.stats = new Stats();
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.top = '0px';
      return document.body.appendChild(this.stats.domElement);
    };

    TextScene.prototype.init_debug_axis = function() {
      var l, make_line, mat, self;
      mat = new THREE.LineBasicMaterial({
        linewidth: 3,
        color: 0xffffff
      });
      self = this;
      make_line = function(start, end) {
        var axis, geom;
        geom = new THREE.Geometry();
        axis = new THREE.Line(geom, mat, THREE.LinePieces);
        geom.vertices.push(start.clone());
        geom.vertices.push(end.clone());
        return self.scene.add(axis);
      };
      l = 1000;
      make_line(new THREE.Vector3(-l, 0, 0), new THREE.Vector3(l, 0, 0));
      make_line(new THREE.Vector3(0, -l, 0), new THREE.Vector3(0, l, 0));
      return make_line(new THREE.Vector3(0, 0, -l), new THREE.Vector3(0, 0, l));
    };

    TextScene.prototype.init_text = function(per, advance) {
      var next, tm, word, _i, _len, _ref;
      if (per == null) {
        per = 1;
      }
      if (advance == null) {
        advance = 0;
      }
      next = this.word_place + per;
      _ref = this.words.slice(this.word_place, next);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        word = _ref[_i];
        this.create_pos.z += advance;
        tm = this.create_word(word, this.create_pos);
        if ((word.indexOf(".") !== -1) && (word.split('.').length - 1 === 1)) {
          this.create_pos.z += advance * 4;
        }
        if (word.indexOf(",") !== -1) {
          this.create_pos.z += advance * 2;
        }
      }
      return this.word_place = next;
    };

    TextScene.prototype.create_word = function(word, pos) {
      var textGeo, textMesh;
      textGeo = new THREE.TextGeometry(word, this.options);
      textGeo.computeBoundingBox();
      textGeo.computeVertexNormals();
      textMesh = new THREE.Mesh(textGeo, this.material.clone());
      textMesh.position = pos.clone();
      textMesh.position.x = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
      textMesh.position.z -= this.group.position.z;
      textMesh.quaternion = this.camera.quaternion;
      this.group.add(textMesh);
      return textMesh;
    };

    TextScene.prototype.rewind = function(zunits) {
      if (zunits == null) {
        zunits = 200;
      }
      this.create_pos.z += zunits;
      this.group.position.z += zunits;
      return this.set_opacities;
    };

    TextScene.prototype.advance_words = function() {
      var advance, diff_sec, new_time, num_words, words_per_second;
      new_time = new Date().getTime();
      diff_sec = (new_time - this.time) / 1000.0;
      words_per_second = this.options.wpm / 60.0;
      this.time = new_time;
      num_words = words_per_second * diff_sec;
      advance = num_words * this.options.delta;
      this.init_text(num_words, advance);
      this.group.position.z -= advance;
      return this.set_opacities();
    };

    TextScene.prototype.set_opacities = function() {
      var distance_to_focus, mesh, opacity, x, y, z, _i, _len, _ref, _results;
      _ref = this.group.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mesh = _ref[_i];
        x = 0;
        y = 0;
        z = mesh.position.z + this.group.position.z;
        distance_to_focus = (new THREE.Vector3(x, y, z)).distanceTo(window.focus);
        opacity = this.options.delta / distance_to_focus;
        _results.push(mesh.material.opacity = opacity);
      }
      return _results;
    };

    TextScene.prototype.render = function() {
      requestAnimationFrame(this.render);
      if (!this.paused) {
        this.advance_words();
      }
      if (this.options.debug) {
        this.stats.update();
      }
      return this.renderer.render(this.scene, this.camera);
    };

    TextScene.prototype.start = function() {
      this.time = new Date().getTime();
      this.paused = false;
      return this.render();
    };

    TextScene.prototype.pause = function() {
      return this.paused = true;
    };

    TextScene.prototype.onKeyup = function(ev) {
      if (ev.altKey) {
        if (ev.keyCode === 38) {
          this.rewind();
          return;
        }
      }
      switch (ev.keyCode) {
        case 32:
          if (this.paused) {
            return this.start();
          } else {
            return this.pause();
          }
          break;
        case 38:
          this.options.wpm += 10;
          return localStorage['rate'] = parseFloat(localStorage['rate']) + 10;
        case 40:
          this.options.wpm -= 10;
          return localStorage['rate'] = parseFloat(localStorage['rate']) - 10;
        case 27:
        case 81:
          return window.close();
      }
    };

    TextScene.prototype.onResize = function(ev) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      return camera.updateProjectionMatrix();
    };

    return TextScene;

  })();

  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
  });

  window.ts = new TextScene(TEXT, material, options);

  window.addEventListener("keyup", ts.onKeyup, false);

  window.addEventListener('resize', ts.onResize, false);

  ts.start();

}).call(this);
