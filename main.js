(function() {
  var TextScene, material, options, wpm,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.TEXT = urlParams['text'];

  wpm = localStorage['rate'] || 350;

  options = {
    size: 16,
    height: 1,
    curveSegments: 2,
    font: "ubuntu",
    style: "normal",
    bevelThickness: 2,
    bevelSize: 1.5,
    bevelEnabled: false,
    material: 0,
    extrudeMaterial: 1,
    delta: 20,
    axis: "z",
    wpm: wpm
  };

  window.origin = new THREE.Vector3(0, 0, 0);

  TextScene = (function() {
    function TextScene(text, material, options) {
      this.text = text;
      this.material = material;
      this.options = options;
      this.onKeyup = __bind(this.onKeyup, this);
      this.render = __bind(this.render, this);
      this.meshes = [];
      this.words = this.text.trim().split(/\s+/g);
      this.word_place = 0;
      this.create_pos = new THREE.Vector3(0, 0, 100);
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
        advance = 1;
      }
      next = this.word_place + per;
      _ref = this.words.slice(this.word_place, next);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        word = _ref[_i];
        this.create_pos.z += advance;
        tm = this.create_word(word, this.create_pos);
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
      this.meshes.push(textMesh);
      this.scene.add(textMesh);
      return textMesh;
    };

    TextScene.prototype.advance_words = function() {
      var advance, centeredp, diff_sec, distance_to_origin, lighten, new_time, num_words, opacity, p, word, words_per_second, _i, _len, _ref, _results;
      new_time = new Date().getTime();
      diff_sec = (new_time - this.time) / 1000.0;
      words_per_second = this.options.wpm / 60.0;
      this.time = new_time;
      num_words = words_per_second * diff_sec;
      advance = num_words * this.options.delta;
      this.init_text(num_words, advance);
      _ref = this.meshes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        word = _ref[_i];
        p = word.position;
        centeredp = word.position.clone();
        p.z -= advance;
        centeredp.x = 0;
        centeredp.y = 0;
        lighten = 3.2;
        distance_to_origin = centeredp.distanceTo(origin);
        if (distance_to_origin < this.options.delta / 2) {
          opacity = 1;
        } else {
          opacity = this.options.delta / (distance_to_origin * lighten);
        }
        word.material.opacity = opacity;
        _results.push(word.quaternion = this.camera.quaternion);
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
      switch (ev.keyCode) {
        case 32:
          if (this.paused) {
            return this.start();
          } else {
            return this.pause();
          }
      }
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

  ts.start();

}).call(this);
