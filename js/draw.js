let colors = [
  0xe6194b, 0x3cb44b, 0xffe119, 0x4363d8, 0xf58231, 0x911eb4, 0x42d4f4,
  0xf032e6, 0xbfef45, 0xfabebe, 0x469990, 0xe6beff, 0x9A6324, 0xfffac8,
  0x800000, 0xaaffc3, 0x808000, 0xffd8b1, 0x000075, 0xa9a9a9
];

let node_colors = [0xff0000, 0x0000ff];

var materials = [];
var node_materials = [];

for (var id in colors) {
  materials.push(new THREE.MeshLambertMaterial({
      color : colors[id],
      polygonOffset : true,
      polygonOffsetFactor : 1,
      polygonOffsetUnits : 1,
      opacity : 1.0,
      transparent : true
    }));
}

for (var id in node_colors) {
  node_materials.push(new THREE.MeshLambertMaterial({
      color : node_colors[id],
      polygonOffset : true,
      polygonOffsetFactor : 1,
      polygonOffsetUnits : 1,
      opacity : 1.0,
      transparent : true
    }));
}

window.addEventListener("DOMContentLoaded", function() {
  var object_info = {};
  var treelet_stack = [];
  var internals_stack = [];
  var must_redraw = false;
  var show_internals = false;

  /* CONTAINER */
  var container = document.createElement('div');
  document.body.appendChild(container);

  var back_button = document.querySelector("#back");
  var show_internals_checkbox = document.querySelector("#show-internals");

  back_button.onclick = function(e) {
    e.preventDefault();

    if (show_internals) {
      internals_stack.pop();
    }
    else {
      treelet_stack.pop();
    }

    update_breadcrumbs();
    must_redraw = true;

    if (treelet_stack.length == 0) {
      back_button.style.visibility = "hidden";
      show_internals_checkbox.style.visibility = "hidden";
    }
  };

  show_internals_checkbox.onclick = function(e) {
    show_internals = show_internals_checkbox.checked;
    update_breadcrumbs();
    must_redraw = true;

    if (!show_internals) {
      internals_stack = [];
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

  var create_cube = function(id, is_treelet, x_min, x_max) {
    var object = new THREE.Mesh(geometry,
                                is_treelet ? materials[id % materials.length]
                                           : node_materials[id % node_materials.length]);

    object.position.x = (x_min[0] + x_max[0]) / 2;
    object.position.y = (x_min[1] + x_max[1]) / 2;
    object.position.z = (x_min[2] + x_max[2]) / 2;
    object.scale.x = (x_max[0] - x_min[0]) * 0.95;
    object.scale.y = (x_max[1] - x_min[1]) * 0.95;
    object.scale.z = (x_max[2] - x_min[2]) * 0.95;

    scene.add(object);

    var geo = new THREE.EdgesGeometry(object.geometry);
    var mat = new THREE.LineBasicMaterial({color : 0x000000, opacity: 1});
    var wireframe = new THREE.LineSegments(geo, mat);

    object.add(wireframe);
    object_info[object.id] = {id: id, is_treelet: is_treelet};
  };

  create_cube(0, true, treelets[0].bounds[0], treelets[0].bounds[1]);

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

  var highlight_treelet = function() {
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
      while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
      }

      object_info = {}; // clear out objects
      scene.add(light);

      if (show_internals) {
        let current_treelet_id = treelet_stack.slice(-1)[0];
        let current_node_index = internals_stack.slice(-1)[0];

        let treelet = treelets[current_treelet_id];
        let nodes = treelet.nodes;

        if (current_node_index == null) {
          current_node_index = 0;
          create_cube(current_node_index, false, nodes[current_node_index][0], nodes[current_node_index][1]);
        }
        else {
          let left_index = 2 * (current_node_index + 1) - 1;
          let right_index = 2 * (current_node_index + 1);

          if (nodes[left_index]) {
            create_cube(left_index, false, nodes[left_index][0], nodes[left_index][1]);
          }

          if (nodes[right_index]) {
            create_cube(right_index, false, nodes[right_index][0], nodes[right_index][1]);
          }
        }
      }
      else {
        for (var id in treelets) {
          let treelet = treelets[id];
          if (treelet.parent == treelet_stack.slice(-1)[0]) {
            create_cube(id, true, treelet.bounds[0], treelet.bounds[1]);
          }
        }
      }

      must_redraw = false;
    }

    highlight_treelet();
    controls.update();
    renderer.render(scene, camera);
  };

  function update_breadcrumbs() {
    breadcrumbs.innerHTML = treelet_stack.join(" &#8594; ") +
                            (show_internals ? (" [" + internals_stack.join(" &#8594; ") + "]") : "");
  }

  function on_mouse_move(e) {
    e.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function on_mouse_up(e) {
    e.preventDefault();

    if (intersected !== null) {
      let info = object_info[intersected.id];

      if (info.is_treelet) {
        treelet_stack.push(info.id);
      }
      else {
        internals_stack.push(info.id);
      }
      
      must_redraw = true;
      back_button.style.visibility = "visible";
      show_internals_checkbox.style.visibility = "visible";
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
