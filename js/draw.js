let colors = [
  0xe6194b, 0x3cb44b, 0xffe119, 0x4363d8, 0xf58231, 0x911eb4, 0x42d4f4,
  0xf032e6, 0xbfef45, 0xfabebe, 0x469990, 0xe6beff, 0x9A6324, 0xfffac8,
  0x800000, 0xaaffc3, 0x808000, 0xffd8b1, 0x000075, 0xa9a9a9
];

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
    update_breadcrumbs();
    must_redraw = true;

    if (treelet_stack.length == 0) {
      back_button.style.visibility = "hidden";
    }
  };

  /* BREADCRUMBS */
  var breadcrumbs = document.querySelector("#breadcrumbs");

  /* SCENE */
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  /* CAMERA */
  var camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.z = 5;

  /* LIGHT */
  var light = new THREE.AmbientLight(0xcccccc);
  // light.position.set(0, 0, 0).normalize();
  scene.add(light);

  /* CUBES */
  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);

  for (var id in treelets) {
    let treelet = treelets[id];

    var lambert_material = new THREE.MeshLambertMaterial({
      color : colors[id % colors.length],
      polygonOffset : true,
      polygonOffsetFactor : 1,
      polygonOffsetUnits : 1,
      opacity : 1.0,
      transparent : true
    })

    var object = new THREE.Mesh(geometry, lambert_material );
    object.position.x = (treelet.bounds[0][0] + treelet.bounds[1][0]) / 2;
    object.position.y = (treelet.bounds[0][1] + treelet.bounds[1][1]) / 2;
    object.position.z = (treelet.bounds[0][2] + treelet.bounds[1][2]) / 2;

    object.scale.x = (treelet.bounds[1][0] - treelet.bounds[0][0]) * 0.95;
    object.scale.y = (treelet.bounds[1][1] - treelet.bounds[0][1]) * 0.95;
    object.scale.z = (treelet.bounds[1][2] - treelet.bounds[0][2]) * 0.95;

    scene.add(object);


    var geo = new THREE.EdgesGeometry(object.geometry);
    var mat = new THREE.LineBasicMaterial({color : 0x000000, opacity: 1});
    var wireframe = new THREE.LineSegments(geo, mat);

    object.add( wireframe );
    treelets[id].object_id = object.id;
    object_to_treelet[object.id] = id;

    object.visible = (treelets[id].parent === null);
  }

  /* MOUSE */
  var mouse = new THREE.Vector2();
  var intersected;
  var offset = new THREE.Vector3(10, 10, 10);

  /* RENDERED */
  var renderer = new THREE.WebGLRenderer({antialias: true});
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
        scene.traverse( function( node ) {
          if ( node instanceof THREE.Mesh ) {
            node.material.opacity = 0.8;
          }
        });

        intersected = intersects[0].object;
        intersected.material.opacity = 1.0;
      }
    } else {
      scene.traverse( function( node ) {
        if ( node instanceof THREE.Mesh ) {
          node.material.opacity = 1.0;
        }
      });

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

  function update_breadcrumbs() {
    breadcrumbs.innerHTML = treelet_stack.join(" &#8594; ");
  }

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
      update_breadcrumbs();
    }
  }

  function on_window_resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate();
}, false);
