
var treelet_material = new THREE.MeshLambertMaterial({
    color : 0xe6194b,
    polygonOffset : true,
    polygonOffsetFactor : 1,
    polygonOffsetUnits : 1,
    opacity : 0.0,
    transparent : true,
    side: THREE.DoubleSide
  });

var node_material = new THREE.MeshLambertMaterial({
    color : 0x808080,
    polygonOffset : true,
    polygonOffsetFactor : 1,
    polygonOffsetUnits : 1,
    opacity : 0.001,
    transparent : true,
    side: THREE.DoubleSide
  });

var geometry = new THREE.BoxBufferGeometry(1, 1, 1);

var create_cube = function(treelet_id,id, is_treelet, x_min, x_max) {
    var object = new THREE.Mesh(
        geometry, is_treelet ? treelet_material: node_material);

    object.position.x = (x_min[0] + x_max[0]) / 2;
    object.position.y = (x_min[1] + x_max[1]) / 2;
    object.position.z = (x_min[2] + x_max[2]) / 2;
    object.scale.x = (x_max[0] - x_min[0]) * .99
    object.scale.y = (x_max[1] - x_min[1]) * .99
    object.scale.z = (x_max[2] - x_min[2]) * .99

    scene.add(object);

    var geo = new THREE.EdgesGeometry(object.geometry);
    if(!is_treelet && id != treelet_id){
          var mat = new THREE.LineBasicMaterial({color : 0x808080, opacity : 0.4,transparent: true});
    }
    else if(is_treelet && treelet_id != null){
      var mat = new THREE.LineBasicMaterial({color : 0xff0000, opacity : 1,transparent: true});
    }
    else{
      var mat = new THREE.LineBasicMaterial({color : 0xff0000, opacity : 1,transparent: true});
    }
    var wireframe = new THREE.LineSegments(geo, mat);

    object.add(wireframe);
  };

//instantiate scene 
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var light = new THREE.AmbientLight(0xcccccc);
scene.add(light);
scene.background = new THREE.Color(0xf0f0f0);
camera.position.z = 5;
var must_redraw = false


//instantiate renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.context.disable(renderer.context.DEPTH_TEST);
document.body.appendChild( renderer.domElement );

//instantiate controls 
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.update();

//Root 
var treelet_id_stack = [];
treelet_id_stack.push(treelets[0].id);
let treelet = treelets[treelet_id_stack.slice(-1)[0]];
var BaseBVHNodes = treelet.nodes;
// create_cube(0,0, true, treelet.bounds[0], treelet.bounds[1]);
//internal BVH
renderInternals(0)

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    let curr_id = treelet_id_stack.slice(-1)[0];
    let current_treelet = treelets[curr_id];
    if(keyCode == 83){
      treelet_id_stack.pop();
      if (treelet_id_stack.length == 0){
        treelet_id_stack.push(0);
      }
      must_redraw = true
      // animate();
    } // "s"
    else if(keyCode == 87){
      if(curr_id + 1 < treelets.length){
        treelet_id_stack.push(curr_id + 1)
      }
      must_redraw = true
      // animate();

    } // "w"

}
//renders internal nodes with red outline on the treelet id chosen
function renderInternals(treelet_id,depth_lvl = 8,beginning_idx = 1){
  let righttmost_idx = Math.pow(2, depth_lvl - 1);
  let nodes_subset = BaseBVHNodes.slice(beginning_idx,2 * righttmost_idx + 1);
  for(var node_idx in nodes_subset) {
    let node = nodes_subset[node_idx]
    if(node != null){
      let node_id = node[1]
      let node_bound_0 = node[0][0]
      let node_bound_1 = node[0][1]
      create_cube(treelet_id,node_id,false,node_bound_0,node_bound_1)
    }
  }
  let new_nodes = treelets[treelet_id].nodes.slice(beginning_idx,2 * righttmost_idx + 1);
  for (var node_idx in new_nodes){
    let node = new_nodes[node_idx]
    if (node != null){
    // console.log(node[1])
      let node_id = node[1]
      let node_bound_0 = node[0][0]
      let node_bound_1 = node[0][1]
      create_cube(treelet_id,node_id,false,node_bound_0,node_bound_1)
    }
  }

}
function animate() {
  requestAnimationFrame( animate );
  controls.update();
  if(must_redraw){
     while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      scene.add(light);
      let current_treelet_id = treelet_id_stack.slice(-1)[0]
      let current_treelet = treelets[current_treelet_id] 
      // create_cube(current_treelet_id,0, true, treelet.bounds[0], treelet.bounds[1]);
      renderInternals(current_treelet_id)
      must_redraw = false;

  }
  renderer.render( scene, camera );
}
animate();