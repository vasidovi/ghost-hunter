import * as generateMap from "./generateMap.js";
import * as constants from "./constants.js";
import { randomInt } from "./utils.js";
import Hunter from "./classes/Hunter.js";
import Ghost from "./classes/Ghost.js";
import Object from "./classes/Object.js";
import Weapon from "./classes/Weapon.js";
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
const toolSlots = 7;
let toolContainer = new Container();

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
	generateMap.scatterObjects(map);


	loader
		.add("images/ghost-hunter.json")
		.add("images/replay.png")
		.add("images/heart.png")
		.add("images/pickaxe.png")
		.add("images/salt.png")
		.add("images/slot.png")
		.load(setup);


	hunter = new Hunter(
		0,
		0,
		"hunter",
		constants.tileSize,
		constants.tileSize
	);

	const pickaxe = new Weapon("pickaxe", 1);
	const salt = new Object("salt", 5);
	const gear = [];
	gear.push(pickaxe);
	gear.push(salt);
	hunter.gear = gear;

	ghost = new Ghost(
		0,
		0,
		"ghost",
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

	hunter.spriteContainer.addChild(createCharacterSprite(hunter));
	ghost.spriteContainer.addChild(createCharacterSprite(ghost));

	redrawHearts(hunter.health);

	gameScene.addChild(heartContainer);
	gameScene.addChild(hunter.spriteContainer);
	gameScene.addChild(ghost.spriteContainer);

	redrawToolContainer(hunter.gear);

	gameScene.addChild(toolContainer);
	app.stage.addChild(gameScene);
}

export function redrawHearts(count) {
	heartContainer.removeChildren();
	const texture = loader.resources['images/heart.png'].texture;
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

	gameOverScene.destroy();
	gameOverScene = new Container();

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

	button.width = constants.tileSize;
	button.height = constants.tileSize;
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

	if (gameScene.visible) {
		gameScene.visible = false;
		if (hunter.health > 0) {
			stageGameOverScene("Victory");
		} else {
			stageGameOverScene("Defeat");
		}
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
		if (hunter.health > 0) {
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

export function createCharacterSprite(character) {

	const texturesKey = character.name + "_" + character.state;
	const names = constants.textureNames.characters[texturesKey];

	let textureArray = [];

	for (let i = 0; i < names.length; i++) {
		let texture = PIXI.Texture.from(names[i]);
		textureArray.push(texture);
	};

	let animatedSprite = new PIXI.AnimatedSprite(textureArray);

	animatedSprite.width = character.width;
	animatedSprite.height = character.height;
	animatedSprite.animationSpeed = 0.15;
	if (character.opacity) {
		animatedSprite.alpha = character.opacity;
	}
	animatedSprite.play();

	return animatedSprite;
}

function createToolContainer(slots) {
	for (let i = 0; i < slots; i++) {
		let innerContainer = new Container();
		toolContainer.addChild(innerContainer);
	}
	//return outerContainer;
}

export function redrawToolContainer(items) {

	toolContainer.removeChildren();
	createToolContainer(toolSlots);

	const scale = 0.75;
	const outerW = constants.tileSize * scale * toolSlots;
	const outerH = constants.tileSize * scale;
	let innerW = outerW / toolSlots;
	let innerH = outerH;
	const x = constants.tileSize * constants.mapWidth / 2 - outerW / 2;
	const y = constants.tileSize * (constants.mapHeight - 0.5);

	let texture = loader.resources['images/slot.png'].texture;

	toolContainer.x = x;
	toolContainer.y = y;

	for (let i = 0; i < toolSlots; i++) {

		let innerContainer = toolContainer.getChildAt(i);

		let innerContainerImage = new Sprite(texture);

		innerContainerImage.anchor.set(0.5);
		innerContainerImage.x = outerW / toolSlots * i + innerW / 2;
		innerContainerImage.width = innerW;
		innerContainerImage.height = innerH;

		innerContainer.addChild(innerContainerImage);

		if (i < items.length) {

			const imagePath = 'images/' + items[i].name + '.png';

			const texture = loader.resources[imagePath].texture;

			const element = new Sprite(texture);
			const imageScale = 0.8;

			element.anchor.set(0.5);
			element.height = innerH * imageScale;
			element.width = innerW * imageScale;
			element.x = innerContainerImage.x;
			element.y = innerContainerImage.y;

			let style = new PIXI.TextStyle({
				fontFamily: 'Arial',
				fontSize: 15,
				fill: 'brown'
			});

			const count = new PIXI.Text(items[i].count, style);
			count.x = element.x;
			count.y = element.y;

			innerContainer.addChild(element);
			innerContainer.addChild(count);

		}
	}
}

export function drawObjectsInMap(items, container) {
	const tile = container.getChildAt(0);
	container.removeChildren();
	container.addChild(tile);
	for (let i = 0; i < items.length; i++) {

		// temporary need to decide how to store objects and map their names with image paths	
		const imagePath = 'images/' + items[i].name + '.png';

		const texture = loader.resources[imagePath].texture;

		const element = new Sprite(texture);

		const scale = 0.5;

		element.anchor.set(0.5);

		element.height = constants.tileSize * scale;
		element.width = constants.tileSize * scale;
		element.x = constants.tileSize / 2;
		element.y = constants.tileSize / 2;
		element.zIndex = 2 + i;
		container.addChild(element);

	}

}
export const mapContainer = new Container();

function createTileContainers() {
	for (let i = 0; i < constants.mapWidth * constants.mapHeight; i++) {
		mapContainer.addChild(new Container());
	}
}


function stageMap(textures, scene) {
	createTileContainers(); 
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
			tile.zIndex = 1;

		//	const container = new Container();
			const tileContainer = mapContainer.getChildAt(row*constants.mapWidth + col);
			tileContainer.y = row * constants.tileSize;
			tileContainer.x = col * constants.tileSize;
			tileContainer.addChild(tile);

			if (map[row][col].objects) {

				const items = map[row][col].objects;
				drawObjectsInMap(items, tileContainer);
			}
			scene.addChild(mapContainer);
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