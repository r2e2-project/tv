
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

//load_scene 
//instantiate text buffers
var treelet_info_id = document.getElementById("treelet_info_id");
// var treelet_info_level =  document.getElementById("treelet_info_level");

//insantiate variables
var treelets = data[0].treelet_data;
var base_bvh_nodes = data[0].base_nodes_data;

//instantiate scene 
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000000 );
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
treelet_id_stack = []
treelet_id_stack.push(0);
// renderBaseBVH(depth_limit = 10)
must_redraw = true
camera.position.z = 10000;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    let curr_id = treelet_id_stack.slice(-1)[0];
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

    } // "w"w

}
//render the base bvh nodes in overall bvh structure
function renderBaseBVH(depth_limit = 10){
  var nodes_to_render = base_bvh_nodes.filter(function(base_bvh_nodes){
    return base_bvh_nodes.depth < depth_limit
  });
  for (let idx = 0; idx < nodes_to_render.length; idx++){
    min_bounds = nodes_to_render[idx].Bounds[0]
    max_bounds = nodes_to_render[idx].Bounds[1]
    create_cube(-1,0,false,min_bounds,max_bounds)
  }


}
//renders internal nodes with red outline on the treelet id chosen
function renderInternals(treelet_id,node_limit=1000){
  //always render baseBVH to a certain depth, then render treelet_id nodes 
  renderBaseBVH();
  let treelet = treelets[treelet_id]
  // console.log(treelet)
  min_nodes = Math.min(node_limit,treelet.nodes.length)
  for(let idx = 0; idx < min_nodes; idx++){
    let node = treelet.nodes[idx];
    // console.log(node.Bounds[0])
    create_cube(treelet_id,-1,true,node.Bounds[0][0],node.Bounds[0][1]);
  }

}
function animate() {
  requestAnimationFrame( animate );
  controls.update();
  let current_treelet_id = treelet_id_stack.slice(-1)[0]
  if(must_redraw){
     while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      scene.add(light);
      renderInternals(current_treelet_id,1000)
      must_redraw = false;
  }

  treelet_info_id.textContent = "Treelet ID: " + current_treelet_id.toString(10)
  // treelet_info_level.textContent = "Treelet Level: " + current_treelet.level
  renderer.render( scene, camera );
}
animate();