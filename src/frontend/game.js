import * as generateMap from "./generateMap.js";
import * as constants from "./constants.js";
import { randomInt } from "./utils.js";
import Hunter from "./classes/Hunter.js";
import Ghost from "./classes/Ghost.js";

let Sprite = PIXI.Sprite,
	loader = PIXI.Loader.shared;

const app = new PIXI.Application();
export const map = [], initiatives = [];
export let hunter, ghost, state;


function getEntryPoints(typeName) {
	const entryPoints = [];
	map.forEach((entries, index) => {
		let found = entries.findIndex(e => (e.types && e.types.includes(typeName)));

		if (found > 0) {
			entryPoints.push({ "x": found, "y": index });
		}
	});
	if (entryPoints.length == 0) {
		entryPoints.push({ "x": 0, "y": 0 });
	}
	return entryPoints;
};


hunter = new Hunter(
	1,
	1,
	"hunter_idle",
	constants.tileSize,
	constants.tileSize
);

ghost = new Ghost(
	2,
	2,
	"ghost_idle",
	constants.tileSize,
	constants.tileSize
);

initiatives.push(hunter);
initiatives.push(ghost);

constants.initializeContstants(initialize);


function initialize() {

	setApplicationStyle(app);

	document.body.appendChild(app.view);

	generateMap.setGround(map);
	generateMap.setBoundaries(map);
	generateMap.setExitPoint(map);
	generateMap.setStartPoint(map);
	generateMap.setHauntedSpots(map);

	let startPoints = getEntryPoints("start_point");

	hunter.x = startPoints[0].x;
	hunter.y = startPoints[0].y;

	let hauntedSpots = getEntryPoints("haunted_spot");

	ghost.x = hauntedSpots[0].x;
	ghost.y = hauntedSpots[0].y;



	loader
		.add("images/ghost-hunter.json")
		.load(setup);

}

function setup() {
	let textures = loader.resources["images/ghost-hunter.json"].textures;
	stageMap(textures);

	hunter.sprite = createCharacterSprite(hunter);
	ghost.sprite = createCharacterSprite(ghost);


	app.stage.addChild(hunter.sprite);
	app.stage.addChild(ghost.sprite);

	state = play;

	app.ticker.add(delta => gameLoop(delta));
}

let timeElapsed = 0;
function gameLoop(delta) {
	state(delta);

}

const turnTime = 15;

function play(delta) {
	timeElapsed += delta;
	if (initiatives[0] != hunter) {
		if (timeElapsed > turnTime) {
			const character = nextCharacter();
			// takeAction();

			if (hunter.x < character.x){
			character.x -= 1;
			} else {
				character.x += 1;
			}
			
			timeElapsed -= turnTime;
		}
	}

}


function createCharacterSprite(character) {

	const characterState = character.state;
	const names = constants.textureNames.characters[characterState];

	let textureArray = [];

	for (let i = 0; i < names.length; i++) {
		let texture = PIXI.Texture.from(names[i]);
		textureArray.push(texture);
	};

	let animatedSprite = new PIXI.AnimatedSprite(textureArray);

	animatedSprite.x = character.x * constants.tileSize;
	animatedSprite.y = character.y * constants.tileSize;
	animatedSprite.width = character.width;
	animatedSprite.height = character.height;
	animatedSprite.animationSpeed = 0.15;
	if (character.opacity) {
		animatedSprite.alpha = character.opacity;
	}
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


export function nextCharacter() {
	const character = initiatives.shift();
	initiatives.push(character);
	return character;
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