window.addEventListener("DOMContentLoaded", function() {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 10000);

  scene.background = new THREE.Color(0xf0f0f0);

  var light = new THREE.AmbientLight( 0x404040 );
  //light.position.set(0, 0, 0).normalize();
  scene.add(light);

  /* drawing cubes */
  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);

  for (var id in treelets) {
    let treelet = treelets[id];

    var object = new THREE.Mesh(
        geometry, new THREE.MeshLambertMaterial(
                      {color : Math.random() * 0xffffff, opacity : 0.5, transparent: true}));

    object.position.x = (treelet.bounds[0][0] + treelet.bounds[1][0]) / 2;
    object.position.y = (treelet.bounds[0][1] + treelet.bounds[1][1]) / 2;
    object.position.z = (treelet.bounds[0][2] + treelet.bounds[1][2]) / 2;

    object.scale.x = (treelet.bounds[1][0] - treelet.bounds[0][0]) * 0.95;
    object.scale.y = (treelet.bounds[1][1] - treelet.bounds[0][1]) * 0.95;
    object.scale.z = (treelet.bounds[1][2] - treelet.bounds[0][2]) * 0.95;

    scene.add(object);
  }

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 5;

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.update();

  var animate = function() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
}, false);
