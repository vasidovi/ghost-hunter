// let Application = PIXI.Application,
//     Container = PIXI.Container,
//     loader = PIXI.loader,
//     resources = PIXI.loader.resources,
//     TextureCache = PIXI.utils.TextureCache,
let Sprite = PIXI.Sprite;
//     Rectangle = PIXI.Rectangle;



$.get("images/ghost-hunter.json", function (data) {
	const imagesNames = Object.keys(data.frames);

	for (let key in TILES) {
		textureNames.tiles[key] = getTextureNames(imagesNames, TILES[key]);
	}

	for (let characterKey in CHARACTERS) {
		for (let actionKey in ACTIONS) {
			const key = CHARACTERS[characterKey] + "_" + ACTIONS[actionKey];
			textureNames.characters[key] = getTextureNames(imagesNames, key);
		}
	}
});

function getTextureNames(imagesNames, nameRoot) {

	const regExp = RegExp(nameRoot + "( \\(\\d*\\))?.png");
	return imagesNames.filter(
		name => regExp.test(name)
	);

}

const app = new PIXI.Application();

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.view.style.left = "50%";
app.renderer.view.style.top = "50%";
app.renderer.view.style.transform = "translate3d( -50%, -50%, 0 )";
app.renderer.autoResize = true;
app.renderer.resize(window.innerHeight, window.innerHeight);

document.body.appendChild(app.view);

const tileNames = {};
const textureNames = {
	"tiles": {},
	"characters": {}
};

const map = [];
const mapWidth = 10;
const mapHeight = 10;
const tileSize = window.innerHeight / mapHeight;

const TILES = {
	"ground": "ground",
	"exit": "exit",
	"hauntedSpot": "haunted_spot",
	"border": "border"
}

const ACTIONS = {
	"idle": "idle",
	"attack": "attack",
	"hurt": "hurt"
}

const CHARACTERS = {
	"hunter": "hunter",
	"ghost": "ghost"
}

setGround(map);
setBoundaries(map);
setExitPoint(map);

// reikia sumapinti Tile tipa su paveiksliukais

PIXI.Loader.shared
	.add("images/ghost-hunter.json")
	.load(setup);

let hunter, state;

function setup() {
	let textures = PIXI.Loader.shared.resources["images/ghost-hunter.json"].textures;
	stageMap(textures);

	hunter = stageHunter();

	app.stage.addChild(hunter);
	state = play;

	app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
	state(delta);
}

function play(delta) {

}

let left = keyboard(37),
	up = keyboard(38),
	right = keyboard(39),
	down = keyboard(40);

const impassableTiles = {
	"hunter": ["solid", "boundary"],
}

function isPassableTile(creature, tile) {

	if ('types' in tile) {

		const types = tile.types;
		const obstacles = impassableTiles[creature] || [];
		for (const obstacle of obstacles) {
			let foundObstacle = types.find(function (type) {
				return type == obstacle
			});
			if (foundObstacle) {
				return false;
			}
		}
	}
	return true;
}

left.press = function () {
	const row = Math.round(hunter.y / tileSize);
	const col = Math.round((hunter.x - tileSize) / tileSize);
	if (col < 0) {
		return;
	}
	if (isPassableTile("hunter", map[row][col])) {
		hunter.x -= tileSize;
	}
};

right.press = function () {
	const row = Math.round(hunter.y / tileSize);
	const col = Math.round((hunter.x + tileSize) / tileSize);

	if (col >= mapWidth) {
		return;
	}
	if (isPassableTile("hunter", map[row][col])) {
		hunter.x += tileSize;
	}

}

up.press = function () {
	const row = Math.round((hunter.y - tileSize) / tileSize);
	const col = Math.round(hunter.x / tileSize);
	if (row < 0){
		return;
	}
	if (isPassableTile("hunter", map[row][col])) {
		hunter.y -= tileSize;
		}
};

down.press = function () {
	const row = Math.round((hunter.y + tileSize) / tileSize);
	const col = Math.round(hunter.x / tileSize);
	if (row >= mapHeight){
		return;
	}
	if (isPassableTile("hunter", map[row][col])) {
		hunter.y += tileSize;
		}
};


function keyboard(keyCode) {
	var key = {};
	key.code = keyCode;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;
	//The `downHandler`
	key.downHandler = function (event) {
		if (event.keyCode === key.code) {
			if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
		}
		event.preventDefault();
	};
	//The `upHandler`
	key.upHandler = function (event) {
		if (event.keyCode === key.code) {
			if (key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
		}
		event.preventDefault();
	};
	//Attach event listeners
	window.addEventListener(
		"keydown", key.downHandler.bind(key), false
	);
	window.addEventListener(
		"keyup", key.upHandler.bind(key), false
	);
	return key;
}

function stageHunter() {

	const hunterState = "hunter_idle";
	const names = textureNames.characters[hunterState];

	let textureArray = [];

	for (let i = 0; i < names.length; i++) {
		let texture = PIXI.Texture.from(names[i]);
		textureArray.push(texture);
	};

	let animatedSprite = new PIXI.AnimatedSprite(textureArray);

	animatedSprite.x = tileSize;
	animatedSprite.y = tileSize;
	animatedSprite.width = tileSize;
	animatedSprite.height = tileSize;
	animatedSprite.animationSpeed = 0.15;
	animatedSprite.play();

	return animatedSprite;
}


function stageMap(textures) {
	for (let row = 0; row < mapWidth; row++) {
		for (let col = 0; col < mapHeight; col++) {

			const tileType = map[row][col].tile;
			const names = textureNames.tiles[tileType];
			const name = names[randomInt(0, names.length - 1)];
			const texture = textures[name];

			texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

			let tile = new Sprite(texture);
			tile.width = tileSize;

			tile.height = tileSize;

			tile.y = row * tileSize;
			tile.x = col * tileSize;

			app.stage.addChild(tile);
		}
	}
}




function setGround(map) {
	for (let i = 0; i < mapWidth; i++) {
		const row = [];
		map.push(row);
		for (let j = 0; j < mapHeight; j++) {
			const tile = {
				tile: TILES.ground
			};
			row.push(tile);
		}
	}
}

function setBoundaries(map) {
	for (let row = 0; row < mapWidth; row++) {
		map[row][0].tile = TILES.border;
		map[row][0].types = ["solid", "boundary"];
		map[row][mapHeight - 1].tile = TILES.border;
		map[row][mapHeight - 1].types = ["solid", "boundary"];
	}

	for (let col = 0; col < mapHeight; col++) {
		map[0][col].tile = TILES.border;
		map[0][col].types = ["solid", "boundary"];
		map[mapWidth - 1][col].tile = TILES.border;
		map[mapWidth - 1][col].types = ["solid", "boundary"];
	}
}

function setExitPoint(map) {
	map[1][mapWidth - 2].tile = TILES.exit;
	map[1][mapWidth - 2].types =["exit"];
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
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