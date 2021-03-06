/*
  Game 0
  This is a ThreeJS program which implements a simple game
  The user moves a cube around the board trying to knock balls into a cone

*/

// First we declare the variables that hold the objects we need
// in the animation code
var scene, renderer;  // all threejs programs need these
var camera, avatarCam;  // we have two cameras in the main scene
var avatar, enemy, bonus;
var dangerZone = 30; // vector distance between avatar and enemy to trigger enemy reaction
var creep = 2;
var clock;

// here are some mesh objects ...
var cone;
var endScene, endCamera, endText;
var endScene2, endCamera2, endText2;

var startScene, startCamera, startText;


var scoreBoardColor, x;

var controls =
    {fwd:false, bwd:false, left:false, right:false,
     speed:10, fly:false, reset:false,
     camera:camera}

var gameState =
    {startTime:0, bonusTime:0, score:0, health:3, scene:'start', camera:'none' }



function createEndScene(){
    endScene = initScene();
    endText = createSkyBox('youwon.png',10);
    endScene.add(endText);
    var light1 = createPointLight();
    light1.position.set(0,200,20);
    endScene.add(light1);
    endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
    endCamera.position.set(0,50,1);
    endCamera.lookAt(0,0,0);
}

function createEndScene2(){
    endScene2 = initScene();
    endText2 = createSkyBox('youlose.jpg',10);
    endScene2.add(endText2);
    var light2 = createPointLight();
    light2.position.set(0,200,20);
    endScene2.add(light2);
    endCamera2 = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
    endCamera2.position.set(0,50,1);
    endCamera2.lookAt(0,0,0);
}

/**
   To initialize the scene, we initialize each of its components
*/
function init(){
    initPhysijs();
    scene = initScene();
    createEndScene();
    createEndScene2();
    initRenderer();
    createMainScene();
}

function createMainScene(){
    // setup lighting
    var light1 = createPointLight();
    light1.position.set(0,200,20);
    scene.add(light1);
    var light0 = new THREE.AmbientLight( 0xffffff,0.25);
    scene.add(light0);

    // create main camera
    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0,50,0);
    camera.lookAt(0,0,0);

    // create the ground and the skybox
    var ground = createGround('grass.png');
    scene.add(ground);
    var skybox = createSkyBox('sky.jpg',1);
    scene.add(skybox);

    // create the avatar
    avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    //avatar = initSuzanne();
    avatar = createAvatar();
    avatar.translateY(20);
    avatarCam.translateY(-4);
    avatarCam.translateZ(3);
    scene.add(avatar);
    loadMoneky();
    setAvatar();
    gameState.camera = avatarCam;

    // create the enemy
    enemy = createEnemy();
    enemy.position.set(0, 4, 60);
    enemy.rotation.set(0, Math.PI / 4, 0);
    enemy.__dirtyPosition = true;
    enemy.__dirtyRotation = true;
    scene.add(enemy);
    loadSkull();

    // create the time plus clock
    bonus = createClock();
    bonus.position.set(randN(20)+15,0,randN(20)+15);
    //enemy.rotation.set(0, Math.PI / 4, 0);
    bonus.__dirtyPosition = true;
    //enemy.__dirtyRotation = true;
    scene.add(bonus);
    loadClock();

    addBalls(10);

    addMedBalls(2);


    cone = createConeMesh(4,6);
    cone.position.set(10,3,7);
    scene.add(cone);

    //playGameMusic();
}

function randN(n){
    return Math.random()*n;
}

function addBalls(numBalls){

    for(i=0;i<numBalls;i++){
	var ball = createBall();
	ball.position.set(randN(20)+15,30,randN(20)+15);
	scene.add(ball);

	ball.addEventListener( 'collision',
			       function( other_object, relative_velocity, relative_rotation, contact_normal ) {
				   if (other_object==cone){
				       console.log("ball "+i+" hit the cone");
				       soundEffect('good.wav');
				       gameState.score += 1;  // add one to the score
				       if (gameState.score==numBalls) {
					   gameState.scene='youwon';
				       }
				       // make the ball drop below the scene ..
				       // threejs doesn't let us remove it from the schene...
				       this.position.y = this.position.y - 100;
				       this.__dirtyPosition = true;
				   }
			       }
			     )
    }
}

function addMedBalls(numBalls){

    for(i=0;i<numBalls;i++){
	var ball = createMedBall();
	ball.position.set(randN(20)+15,30,randN(20)+15);
	scene.add(ball);

	ball.addEventListener( 'collision',
			       function( other_object, relative_velocity, relative_rotation, contact_normal ) {
				   if (other_object==avatar){
				       console.log("ball "+i+" hit the avatar");
				       soundEffect('good.wav');
				       gameState.health += 1;  // add one to the score
				       // make the ball drop below the scene ..
				       // threejs doesn't let us remove it from the schene...
				       this.position.y = this.position.y - 100;
				       this.__dirtyPosition = true;
				   }
			       }
			     )
    }
}


function playGameMusic(){
    // create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    var sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.05 );
	sound.play();
    });
}

function soundEffect(file){
    // create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    var sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( '/sounds/'+file, function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( false );
	sound.setVolume( 0.5 );
	sound.play();
    });
}


	

x = 0;
	scoreBoardColor = new Array("#FFCCFF","#FFCC99","#00FFFF","#FFFF00", "#00FF66","#FFFF99","#FFCC00","#FF00FF");

	changeColors();
	


	// Here is the main game control
	createOpenScene()
  	init();
	initControls();
	animate();  // start the animation loop!

	

	function createOpenScene(){
			
		startScene = new THREE.Scene();
		startText = createBackground('welcome.png',1);

		startScene.add(startText);
		var startlight = createPointLight();
		startlight.position.set(0,200,20);
		startScene.add(startlight);
		startCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		startCamera.position.set(0,50,1);
		startCamera.lookAt(0,0,0);
	}

	function changeColors(){

  		x++;
  		if (x==( scoreBoardColor.length-1)) 
  		{x=0; }

  			document.bgColor = scoreBoardColor[x];

  			setTimeout("changeColors()",900);
			}


	




/*
   We don't do much here, but we could do more!
*/
function initScene(){
    //scene = new THREE.Scene();
    var scene = new Physijs.Scene();
    return scene;
}

function initPhysijs(){
    Physijs.scripts.worker = '/js/physijs_worker.js';
    Physijs.scripts.ammo = '/js/ammo.js';
}

/*
  The renderer needs a size and the actual canvas we draw on
  needs to be added to the body of the webpage. We also specify
  that the renderer will be computing soft shadows
*/
function initRenderer(){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight-50 );
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function createPointLight(){
    var light;
    light = new THREE.PointLight( 0xffffff);
    light.castShadow = true;
    //Set up shadow properties for the light
    light.shadow.mapSize.width = 2048;  // default
    light.shadow.mapSize.height = 2048; // default
    light.shadow.camera.near = 0.5;       // default
    light.shadow.camera.far = 500      // default
    return light;
}

function createBoxMesh(color){
    var geometry = new THREE.BoxGeometry( 1, 1, 1);
    var material = new THREE.MeshLambertMaterial( { color: color} );
    mesh = new Physijs.BoxMesh( geometry, material );
    //mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}



	function createGround(image){
		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 15, 15 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

		mesh.receiveShadow = true;

		mesh.rotateX(Math.PI/2);
		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
	}

	function createBackground(image,k){
		
		var planeGeometry = new THREE.PlaneGeometry( 200, 200, 128 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		var planeMaterial = new THREE.MeshLambertMaterial( { color: 0xaaaaaa,  map: texture ,side:THREE.DoubleSide} );
			planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
			startScene.add(planeMesh);
			planeMesh.position.x = 0;
			planeMesh.position.y = 0;
			planeMesh.position.z = 0;
			planeMesh.rotation.x = -Math.PI/2;
			planeMesh.receiveShadow = true;

		return planeMesh


	}




	function createSkyBox(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.SphereGeometry( 80, 80, 80 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new THREE.Mesh( geometry, material, 0 );

		mesh.receiveShadow = false;


		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical


	}


	function createConeMesh(r,h){
		var geometry = new THREE.ConeGeometry( r, h, 32);
		var texture = new THREE.TextureLoader().load( '../images/tile.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
		mesh.castShadow = true;
		return mesh;
	}


	function createBall(){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    	var mesh = new Physijs.BoxMesh( geometry, material );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}





	// var clock;

	// function initControls(){
	// 	// here is where we create the eventListeners to respond to operations

	// 	  //create a clock for the time-based animation ...
	// 		clock = new THREE.Clock();
	// 		clock.start();

	// 		window.addEventListener( 'keydown', keydown);
	// 		window.addEventListener( 'keyup',   keyup );
 //  }

	// function keydown(event){
	// 	console.log("Keydown:"+event.key);
	// 	//console.dir(event);
	// 	// first we handle the "play again" key in the "youwon" scene

		

	// 	if (gameState.scene == 'youwon' && event.key=='r') {
	// 					gameState.scene = 'start';

	// 		//gameState.scene = 'main';
	// 		gameState.score = 0;
	// 		addBalls();
	// 		return;
	// 	}

	// 	// this is the regular scene
	// 	switch (event.key){
	// 		// change the way the avatar is moving
	// 		case "w": controls.fwd = true;  break;
	// 		case "s": controls.bwd = true; break;
	// 		case "a": controls.left = true; break;
	// 		case "d": controls.right = true; break;
	// 		case "r": controls.up = true; break;
	// 		case "f": controls.down = true; break;
	// 		case "m": controls.speed = 30; break;
 //      case " ": controls.fly = true; break;
 //      case "h": controls.reset = true; break;

 //    //  case "p": controls.openScene = true; break;




	// 		// switch cameras
	// 		case "1": gameState.camera = camera; break;
	// 		case "2": gameState.camera = avatarCam; break;

	// 		// move the camera around, relative to the avatar
	// 		case "ArrowLeft": avatarCam.translateY(1);break;
	// 		case "ArrowRight": avatarCam.translateY(-1);break;
	// 		case "ArrowUp": avatarCam.translateZ(-1);break;
	// 		case "ArrowDown": avatarCam.translateZ(1);break;

	// 	}

	// }

	// function keyup(event){
	// 	//console.log("Keydown:"+event.key);
	// 	//console.dir(event);
	// 	switch (event.key){
	// 		case "w": controls.fwd   = false;  break;
	// 		case "s": controls.bwd   = false; break;
	// 		case "a": controls.left  = false; break;
	// 		case "d": controls.right = false; break;
	// 		case "r": controls.up    = false; break;
	// 		case "f": controls.down  = false; break;
	// 		case "m": controls.speed = 10; break;
 //      case " ": controls.fly = false; break;
 //      case "h": controls.reset = false; break;


 //           // case "p": controls.openScene = true; break;

	// 	}
	// }


function createGround(image){
    // creating a textured plane which receives shadows
    var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
    var texture = new THREE.TextureLoader().load( '../images/'+image );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 15, 15 );
    var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
    var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    //var mesh = new THREE.Mesh( geometry, material );
    var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

    mesh.receiveShadow = true;

    mesh.rotateX(Math.PI/2);
    return mesh;
    // we need to rotate the mesh 90 degrees to make it horizontal not vertical
}

function createSkyBox(image,k){
    // creating a textured plane which receives shadows
    var geometry = new THREE.SphereGeometry( 80, 80, 80 );
    var texture = new THREE.TextureLoader().load( '../images/'+image );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( k, k );
    var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
    //var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    //var mesh = new THREE.Mesh( geometry, material );
    var mesh = new THREE.Mesh( geometry, material, 0 );

    mesh.receiveShadow = false;

    return mesh;
    // we need to rotate the mesh 90 degrees to make it horizontal not vertical
}



function createAvatar(){
   
    var geometry = new THREE.BoxGeometry( 5, 5, 6);
    var material = new THREE.MeshLambertMaterial( { color: 0xffffff,opacity : 0, transparent :true} );
    var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    var mesh = new Physijs.BoxMesh( geometry, pmaterial );


    mesh.setDamping(0.1,0.1);
    mesh.castShadow = true;

    avatarCam.position.set(0,8,2);
    avatarCam.lookAt(0,8,10);
    mesh.add(avatarCam);

    return mesh; 
}

function loadMoneky() {
    var loader = new THREE.OBJLoader();
    loader.load("../models/suzanne/suzanne.obj",
        function(obj) {
            console.log("loading obj file");
            obj.scale.x=2;
            obj.scale.y=2;
            obj.scale.z=2;
            obj.position.y = 1;
            obj.position.z = 0;
            obj.castShadow = true;
            avatar.add(obj);
        },
        function(xhr){
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},

        function(err){
            console.log("error in loading: "+err);}
           )
}


function setAvatar() {
  avatar.addEventListener( 'collision',
			       function( other_object, relative_velocity, relative_rotation, contact_normal ) {
				   if (other_object==enemy){
				       console.log("avatar hit enemy");
				       soundEffect('die.wav');
				       gameState.health -= 1;  // deduct one from the score
               if(gameState.health == 0){
                 gameState.scene='youlose';
               }
               addBalls(1);
               enemy.__dirtyPosition = true;
             	 enemy.position.set(randN(20)+15,20,randN(20)+15);
				   } else if (other_object==bonus){
             console.log("avatar hit clock");
             soundEffect('coin.wav');
             gameState.bonusTime += 3;
             bonus.position.y -= 100;
             bonus.__dirtyPosition = true;
           }
			   }
			)
}

function createEnemy(){
    var geometry = new THREE.BoxGeometry(5, 0.1, 5);
    var material = new THREE.MeshLambertMaterial({ color: 0x800000});
    material.transparent = true;
    var pmaterial = new Physijs.createMaterial(material, 0.9, 0.5);
    var mesh = new Physijs.BoxMesh(geometry, pmaterial);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
}

function loadSkull() {
    var loader = new THREE.OBJLoader();
    loader.load("../models/skull/skull.obj",
		function(obj) {
		    console.log("loading obj file");
		    obj.scale.x=1;
		    obj.scale.y=1;
		    obj.scale.z=1;
		    obj.position.y = 1;
		    obj.position.z = 0;
		    obj.castShadow = true;
		    enemy.add(obj);
		},
		function(xhr){
		    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},

		function(err){
		    console.log("error in loading: "+err);}
	       )
}

function createClock(){
    var geometry = new THREE.BoxGeometry(5, 0.1, 5);
    var material = new THREE.MeshLambertMaterial({ color: 0x800000});
    material.transparent = true;
    var pmaterial = new Physijs.createMaterial(material, 0.9, 0.5);
    var mesh = new Physijs.BoxMesh(geometry, pmaterial, 0);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
}

function loadClock() {
    var loader = new THREE.OBJLoader();
    loader.load("../models/clock/clock.obj",
		function(obj) {
		    console.log("loading obj file");
		    obj.scale.x=0.003;
		    obj.scale.y=0.003;
		    obj.scale.z=0.003;

		    obj.castShadow = true;
		    bonus.add(obj);
		},
		function(xhr){
		    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},

		function(err){
		    console.log("error in loading: "+err);}
	       )
}


function createConeMesh(r,h){
    var geometry = new THREE.ConeGeometry( r, h, 32);
    var texture = new THREE.TextureLoader().load( '../images/tile.jpg' );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1, 1 );
    var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
    var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
    mesh.castShadow = true;
    return mesh;
}

function createBall(){
    //var geometry = new THREE.SphereGeometry( 4, 20, 20);
    var geometry = new THREE.SphereGeometry( 1, 16, 16);
    var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
    var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    var mesh = new Physijs.BoxMesh( geometry, material );
    mesh.setDamping(0.1,0.1);
    mesh.castShadow = true;
    return mesh;
}

function createMedBall(){
    //var geometry = new THREE.SphereGeometry( 4, 20, 20);
    var geometry = new THREE.SphereGeometry( 1, 10, 10);
    var material = new THREE.MeshLambertMaterial( { color: 0x0D0DD7} );
    var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    var mesh = new Physijs.BoxMesh( geometry, material );
    mesh.setDamping(0.1,0.1);
    mesh.castShadow = true;
    return mesh;
}

function initControls(){
    // here is where we create the eventListeners to respond to operations

    //create a clock for the time-based animation ...
    clock = new THREE.Clock();
    clock.start();
    gameState.startTime = clock.getElapsedTime()

    window.addEventListener( 'keydown', keydown);
    window.addEventListener( 'keyup',   keyup );
}

function keydown(event){
    console.log("Keydown:"+event.key);
    //console.dir(event);

    if (gameState.scene == 'start' && event.key=='p') {
            gameState.scene = 'main';
            // gameState.score = 0;
            //addBalls();
addBalls(gameState.score);
    gameState.score = 0;
  gameState.health = 3;
  gameState.startTime = clock.getElapsedTime();
  gameState.timeLeft = 60;


            return;
        }



    // first we handle the "play again" key in the "youwon" scene
    if (gameState.scene == 'youwon' || gameState.scene == 'youlose' && event.key=='r') {

        gameState.scene = 'start';
  addBalls(gameState.score);
	gameState.score = 0;
  gameState.health = 3;
  gameState.startTime = clock.getElapsedTime();
  gameState.timeLeft = 60;
	return;
    }


    // this is the regular scene
    switch (event.key){
	// change the way the avatar is moving
    case "w": controls.fwd = true;  break;
    case "s": controls.bwd = true; break;
    case "a": controls.left = true; break;
    case "d": controls.right = true; break;
    case "r": controls.up = true; break;
    case "f": controls.down = true; break;
    case "m": controls.speed = 30; break;
    case " ": controls.fly = true; break;
    case "h": controls.reset = true; break;

	// switch cameras
    case "1": gameState.camera = camera; break;
    case "2": gameState.camera = avatarCam; break;

	// move the camera around, relative to the avatar
    case "ArrowLeft": avatarCam.translateY(1);break;
    case "ArrowRight": avatarCam.translateY(-1);break;
    case "ArrowUp": avatarCam.translateZ(-1);break;
    case "ArrowDown": avatarCam.translateZ(1);break;

    case "q": avatarCam.rotateY(0.1); break;
    case "e": avatarCam.rotateY(-0.1); break;
    }
}

function keyup(event){
    //console.log("Keydown:"+event.key);
    //console.dir(event);
    switch (event.key){
    case "w": controls.fwd   = false;  break;
    case "s": controls.bwd   = false; break;
    case "a": controls.left  = false; break;
    case "d": controls.right = false; break;
    case "r": controls.up    = false; break;
    case "f": controls.down  = false; break;
    case "m": controls.speed = 10; break;
    case " ": controls.fly = false; break;
    case "h": controls.reset = false; break;
    }
}

function updateAvatar(){
    "change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

    var forward = avatar.getWorldDirection();

    if (controls.fwd){
	avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
    } else if (controls.bwd){
	avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
    } else {
	var velocity = avatar.getLinearVelocity();
	velocity.x=velocity.z=0;
	avatar.setLinearVelocity(velocity); //stop the xz motion
    }

    if (controls.fly){
	avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
    }

    if (controls.left){
	avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
    } else if (controls.right){
	avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
    }

    if (controls.reset){
	avatar.__dirtyPosition = true;
	avatar.position.set(40,10,40);
    }
}

function updateEnemy() {
    var avatarPosition = new THREE.Vector3().setFromMatrixPosition(avatar.matrixWorld);
    var enemyPosition = new THREE.Vector3().setFromMatrixPosition(enemy.matrixWorld);
    var diff = avatarPosition.distanceTo(enemyPosition);
    //console.log(diff);
    if (diff > 0 && diff <= dangerZone) {
	enemy.lookAt(avatarPosition);
	var forward = avatar.getWorldDirection();
	enemy.setLinearVelocity(forward.multiplyScalar(-creep));
    }
}

function updateMedBall() {
    var avatarPosition = new THREE.Vector3().setFromMatrixPosition(avatar.matrixWorld);
    var medBallPosition = new THREE.Vector3().setFromMatrixPosition(enemy.matrixWorld);
    var diff = avatarPosition.distanceTo(medBallPosition);
    //console.log(diff);
    if (diff > 0 && diff <= dangerZone) {
	enemy.lookAt(avatarPosition);
	var forward = avatar.getWorldDirection();
	enemy.setLinearVelocity(forward.multiplyScalar(-creep));
    }
}

function animate() {

    requestAnimationFrame( animate );

    switch(gameState.scene) {

    

			case "start":
				//startText.rotateY(0.005);
				renderer.setSize(window.innerWidth, window.innerHeight);

				renderer.render( startScene, startCamera );
				break;

			case "youwon":
				endText.rotateY(0.005);
				renderer.render( endScene, endCamera );
			//	 var info = document.getElementById("info");
		//info.innerHTML='<div style="font-size:24pt">Score: ' + gameState.score + '</div>';
				break;

		
		  case "youlose":
endText2.rotateY(0.005);
renderer.render( endScene2, endCamera2 );
break;

    case "main":

    var info = document.getElementById("info");

	updateAvatar();
	updateEnemy();
	scene.simulate();
  gameState.timeLeft = Math.round(60 - (clock.getElapsedTime() - gameState.startTime) + gameState.bonusTime)
	if (gameState.camera!= 'none'){
		renderer.setSize(window.innerWidth, window.innerHeight - info.offsetHeight);

	    renderer.render( scene, gameState.camera );
	}
  if (gameState.timeLeft <= 0){
	    gameState.scene='youlose';
	}
info.innerHTML='<div style="font-size:24pt">Score: ' + gameState.score + '</div>';

	break;

    default:
	console.log("don't know the scene "+gameState.scene);

    }

		//draw heads up display ..
	 //  var info = document.getElementById("info");
		// info.innerHTML='<div style="font-size:24pt">Score: ' + gameState.score + '</div>';
    var info = document.getElementById("info");
    info.innerHTML='<div style="font-size:24pt">Score: ' + gameState.score + '  Health: ' + gameState.health +'  Time left: ' + gameState.timeLeft +'</div>';

}
