
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
//instantiate text buffers
var treelet_info_id = document.getElementById("treelet_info_id");
var treelet_info_level =  document.getElementById("treelet_info_level");

//instantiate scene 
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
var light = new THREE.AmbientLight(0xcccccc);
scene.add(light);
scene.background = new THREE.Color(0xf0f0f0);
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
must_redraw = true
camera.position.z = 5 * treelet.nodes[0][0][1][2] ;

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
    } // "s"
    else if(keyCode == 87){
      if(curr_id + 1 < treelets.length){
        treelet_id_stack.push(curr_id + 1)
      }
      must_redraw = true

    } // "w"

}
//renders internal nodes with red outline on the treelet id chosen
function renderInternals(treelet_id,depth_lvl = 8,beginning_idx = 1){
  let righttmost_idx = Math.pow(2, depth_lvl - 1);
  let nodes_subset = BaseBVHNodes.slice(beginning_idx,2 * righttmost_idx + 1);
  //render BaseBVHNodes
  if(treelet_id != 0){
    for(var node_idx in nodes_subset) {
      let node = nodes_subset[node_idx]
      if(node != null){
        let node_id = node[1]
        let node_bound_0 = node[0][0]
        let node_bound_1 = node[0][1]
        create_cube(treelet_id,node_id,false,node_bound_0,node_bound_1)
      }
    }
  }
  //render BVHNodes with red outline 
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
  let current_treelet_id = treelet_id_stack.slice(-1)[0]
  let current_treelet = treelets[current_treelet_id]  
  if(must_redraw){
     while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      scene.add(light);
         renderInternals(current_treelet_id)
      must_redraw = false;
  }

  treelet_info_id.textContent = "Treelet ID: " + current_treelet_id.toString(10)
  treelet_info_level.textContent = "Treelet Level: " + current_treelet.level
  renderer.render( scene, camera );
}
animate();