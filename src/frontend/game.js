import * as generateMap from "./generateMap.js";
import * as constants from "./constants.js";
import { randomInt } from "./utils.js";
import Hunter from "./classes/Hunter.js";
import Ghost from "./classes/Ghost.js";
import GameManager from "./classes/GameManager.js";

export let Sprite = PIXI.Sprite,
	loader = PIXI.Loader.shared,
	Container = PIXI.Container;

const app = new PIXI.Application();

export const map = [], initiatives = [];
export let hunter, ghost;
export let gameMetadata = new GameManager();

let gameScene, gameOverScene, gameOverMessage;

gameScene = new Container();
gameOverScene = new Container();
const heartContainer = new Container();

let timeElapsed = 0;
const turnTime = 15;

constants.initializeContstants(initialize);

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

function initialize() {

	setApplicationStyle(app);

	document.body.appendChild(app.view);

	generateMap.setGround(map);
	generateMap.setBoundaries(map);
	generateMap.setExitPoint(map);
	generateMap.setStartPoint(map);
	generateMap.setHauntedSpots(map);

	
	loader
		.add("images/ghost-hunter.json")
		.add("images/replay.png")
		.add("images/heart.png")
		.load(setup);


	hunter = new Hunter(
		0,
		0,
		"hunter_idle",
		constants.tileSize,
		constants.tileSize
	);

	ghost = new Ghost(
		0,
		0,
		"ghost_idle",
		constants.tileSize,
		constants.tileSize
	);

	initiatives.push(hunter);
	initiatives.push(ghost);

	let startPoints = getEntryPoints("start_point");

	hunter.x = startPoints[0].x;
	hunter.y = startPoints[0].y;

	let hauntedSpots = getEntryPoints("haunted_spot");

	ghost.x = hauntedSpots[0].x;
	ghost.y = hauntedSpots[0].y;

}

function stageGameScene() {
	let textures = loader.resources["images/ghost-hunter.json"].textures;

	stageMap(textures, gameScene);

	hunter.sprite = createCharacterSprite(hunter);
	ghost.sprite = createCharacterSprite(ghost);

	redrawHearts(hunter.health);

	gameScene.addChild(heartContainer);
	gameScene.addChild(hunter.sprite);
	gameScene.addChild(ghost.sprite);

	app.stage.addChild(gameScene);
}

export function redrawHearts(count) {
	heartContainer.removeChildren();
	const texture = loader.resources['images/heart.png'].texture;
	console.log(texture);
	for (let i = 0; i < count; i++) {
		const heart = new Sprite(texture);
		const scale = 0.75;
		const heartSize = constants.tileSize * scale;

		heart.x = constants.tileSize / 2 + heartSize * i;
		heart.y = constants.tileSize / 2;
		heart.anchor.set(0.5);
		heart.width = heartSize;
		heart.height = heartSize;
		heartContainer.addChild(heart)
	}
}


function stageGameOverScene(message) {

	let style = new PIXI.TextStyle({
		fontFamily: 'Arial',
		fontSize: 64,
		fill: 'white'
	});

	gameOverMessage = new PIXI.Text(message, style);
	gameOverMessage.x = app.renderer.width * (1 / 2);
	gameOverMessage.y = app.renderer.height * (1 / 2 - 0.1);
	gameOverMessage.anchor.set(0.5);

	const buttonTexture = loader.resources['images/replay.png'].texture;
	const button = new Sprite(buttonTexture);

	button.x = gameOverMessage.x;
	button.y = gameOverMessage.y * 1.5;
	button.anchor.set(0.5);
	button.interactive = true;
	button.buttonMode = true;

	button.on('pointerdown', () => {
		//handle event
		gameMetadata.state = play;
		gameOverScene.visible = false;
		gameScene.visible = true;

		let startPoints = getEntryPoints("start_point");

		hunter.x = startPoints[0].x;
		hunter.y = startPoints[0].y;
		hunter.health = 3;
		// redrawHearts(hunter.health);

		let hauntedSpots = getEntryPoints("haunted_spot");

		ghost.x = hauntedSpots[0].x;
		ghost.y = hauntedSpots[0].y;

		initiatives.length = 0;
		initiatives.push(hunter);
		initiatives.push(ghost);

	});

	app.stage.addChild(gameOverScene);
	gameOverScene.addChild(button);
	gameOverScene.addChild(gameOverMessage);

}

function setup() {

	stageGameScene();
	gameMetadata.state = play;

	app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
	gameMetadata.state(delta);

}

export function end(delta) {

	gameScene.visible = false;
	if (hunter.health > 0){
	stageGameOverScene("Victory");
	} else {
	stageGameOverScene("Defeat");
	}

	gameOverScene.visible = true;
	// console.log("this is the end my friend...");
}

function play(delta) {

	if (initiatives[0] != hunter) {
		timeElapsed += delta;
		if (timeElapsed > turnTime) {
			const character = nextCharacter();
			takeAction(character);
			timeElapsed -= turnTime;
		}
	}
}

function takeAction(character) {

	if (character instanceof Ghost) {
		takeGhostAction(character);
	}
}

function takeGhostAction(character) {
	const dx = character.x - hunter.x;
	const dirX = Math.abs(dx);
	const dy = character.y - hunter.y;
	const dirY = Math.abs(dy);

	if ((dirY + dirX) <= 1) {
		character.attack(hunter);
		if ( hunter.health > 0) {
		// redrawHearts(hunter.health);
		} else { 
			gameMetadata.state = end;
		}

	} else if (dirX >= dirY) {
		followAlongAxis(character, hunter, "x");
	} else {
		followAlongAxis(character, hunter, "y");
	}
}

function followAlongAxis(actingCharacter, followedCharacter, axisName) {
	const diff = actingCharacter[axisName] - followedCharacter[axisName];
	if (diff > 0) {
		actingCharacter[axisName]--;
	} else {
		actingCharacter[axisName]++;
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


function stageMap(textures, scene) {
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

			scene.addChild(tile);
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