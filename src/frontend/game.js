import * as generateMap from "./generateMap.js";
import * as constants from "./parameters.js";
import { randomInt } from "./utils.js";
import Hunter from "./classes/Hunter.js";

let Sprite = PIXI.Sprite,
	loader = PIXI.Loader.shared;

const app = new PIXI.Application();
export const map = [];
export let hunter, state;

function getStartPoint() {
	let x = 0; 
	let y = 0;	
	map.forEach( (entries, index) => {
		let found = entries.findIndex(e => ( e.types && e.types.includes("startPoint")));
	  
		 if ( found > 0 ) {
			x = found;
			y = index;
		 }
		});
		return {x,y};
	};



hunter = new Hunter(
		1,
		1,
		"hunter_idle",
		constants.tileSize,
		constants.tileSize
	);

	constants.initializeContstants(initialize);


	function initialize() {

		setApplicationStyle(app);

		document.body.appendChild(app.view);

		generateMap.setGround(map);
		generateMap.setBoundaries(map);
		generateMap.setExitPoint(map);
		generateMap.setStartPoint(map);

		let startPoint  = getStartPoint();

		hunter.x = startPoint.x;
		hunter.y = startPoint.y; 


		loader
			.add("images/ghost-hunter.json")
			.load(setup);

	}

	function setup() {
		let textures = loader.resources["images/ghost-hunter.json"].textures;
		stageMap(textures);

		hunter.sprite = stageHunter();


		app.stage.addChild(hunter.sprite);
		state = play;

		app.ticker.add(delta => gameLoop(delta));
	}

	function gameLoop(delta) {
		state(delta);
	}

	function play(delta) {

	}


	function stageHunter() {

		const hunterState = hunter.state;
		const names = constants.textureNames.characters[hunterState];

		let textureArray = [];

		for (let i = 0; i < names.length; i++) {
			let texture = PIXI.Texture.from(names[i]);
			textureArray.push(texture);
		};

		let animatedSprite = new PIXI.AnimatedSprite(textureArray);

		animatedSprite.x = hunter.x * constants.tileSize;
		animatedSprite.y = hunter.y * constants.tileSize;
		animatedSprite.width = hunter.width;
		animatedSprite.height = hunter.height;
		animatedSprite.animationSpeed = 0.15;
		animatedSprite.play();

		return animatedSprite;
	}


	function stageMap(textures) {
		for (let row = 0; row < constants.mapWidth; row++) {
			for (let col = 0; col < constants.mapHeight; col++) {

				const tileType = map[row][col].tile;
				const names = constants.textureNames.tiles[tileType];
				const name = names[randomInt(0, names.length - 1)];
				const texture = textures[name];

				texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

				let tile = new Sprite(texture);
				tile.width = constants.tileSize;

				tile.height = constants.tileSize;

				tile.y = row * constants.tileSize;
				tile.x = col * constants.tileSize;

				app.stage.addChild(tile);
			}
		}
	}

	function setApplicationStyle(app) {
		app.renderer.view.style.position = "absolute";
		app.renderer.view.style.display = "block";
		app.renderer.view.style.left = "50%";
		app.renderer.view.style.top = "50%";
		app.renderer.view.style.transform = "translate3d( -50%, -50%, 0 )";
		app.renderer.autoDensity = true;
		app.renderer.resize(window.innerHeight, window.innerHeight);
	}

// Map Layer // 

// generate plane map tile: ground
// set borders  tile : border, type: [solid, boundary]
// set exit tile : exit
// set obstacles .. tile : border, type: [solid]

// Object Layer // 

// set encounters .. tile: hauntedSpot + status : hauntedSpot, x, y, 
// set startingSpot  .. tile + status: startSpot ,x, y,
// set assets .. assets : salt, crowbar (x,y)

// Creatures //

// hunter , ghosts//