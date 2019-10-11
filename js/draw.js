window.addEventListener("DOMContentLoaded", function() {
  var object_to_treelet = {};
  var treelet_stack = [];
  var must_redraw = false;

  /* CONTAINER */
  var container = document.createElement('div');
  document.body.appendChild(container);

  var back_button = document.querySelector("#back");
  back_button.onclick = function(e) {
    e.preventDefault();
    treelet_stack.pop();
    must_redraw = true;

    if (treelet_stack.length == 0) {
      back_button.style.visibility = "hidden";
    }
  };

  /* SCENE */
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  /* CAMERA */
  var camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.z = 5;

  /* LIGHT */
  var light = new THREE.AmbientLight(0x404040);
  // light.position.set(0, 0, 0).normalize();
  scene.add(light);

  /* CUBES */
  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);

  for (var id in treelets) {
    let treelet = treelets[id];

    var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
      color : Math.random() * 0xffffff,
      opacity : 0.8,
      transparent : true
    }));

    object.position.x = (treelet.bounds[0][0] + treelet.bounds[1][0]) / 2;
    object.position.y = (treelet.bounds[0][1] + treelet.bounds[1][1]) / 2;
    object.position.z = (treelet.bounds[0][2] + treelet.bounds[1][2]) / 2;

    object.scale.x = (treelet.bounds[1][0] - treelet.bounds[0][0]) * 0.95;
    object.scale.y = (treelet.bounds[1][1] - treelet.bounds[0][1]) * 0.95;
    object.scale.z = (treelet.bounds[1][2] - treelet.bounds[0][2]) * 0.95;

    scene.add(object);
    treelets[id].object_id = object.id;
    object_to_treelet[object.id] = id;

    object.visible = (treelets[id].parent === null);
  }

  /* MOUSE */
  var mouse = new THREE.Vector2();
  var intersected;
  var offset = new THREE.Vector3(10, 10, 10);

  /* RENDERED */
  var renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  document.addEventListener('mousemove', on_mouse_move, false);
  document.addEventListener('resize', on_window_resize, false);
  document.addEventListener('mouseup', on_mouse_up, false);

  /* RAYCASTER */
  var raycaster = new THREE.Raycaster();

  /* CONTROLS */
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.update();

  var highlight_treelet =
      function() {
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      if (intersected != intersects[0].object) {
        if (intersected) {
          intersected.material.emissive.setHex(intersected.current_hex);
        }

        intersected = intersects[0].object;
        intersected.current_hex = intersected.material.emissive.getHex();
        intersected.material.emissive.setHex(0xff0000);
      }
    } else {
      if (intersected) {
        intersected.material.emissive.setHex(intersected.current_hex);
      }

      intersected = null;
    }
  }

  var animate = function() {
    requestAnimationFrame(animate);

    if (must_redraw) {
      for (var id in treelets) {
        scene.getObjectById(treelets[id].object_id).visible =
            (treelets[id].parent == treelet_stack.slice(-1)[0]);
      }

      must_redraw = false;
    }

    highlight_treelet();
    controls.update();
    renderer.render(scene, camera);
  };

  function on_mouse_move(e) {
    e.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function on_mouse_up(e) {
    e.preventDefault();

    if (intersected !== null) {
      treelet_stack.push(object_to_treelet[intersected.id]);
      must_redraw = true;
      back_button.style.visibility = "visible";
    }
  }

  function on_window_resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate();
}, false);
