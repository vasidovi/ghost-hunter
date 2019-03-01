// let Application = PIXI.Application,
//     Container = PIXI.Container,
//     loader = PIXI.loader,
//     resources = PIXI.loader.resources,
//     TextureCache = PIXI.utils.TextureCache,
let Sprite = PIXI.Sprite;
//     Rectangle = PIXI.Rectangle;



$.get("images/ghost-hunter.json", function (data) {
	const imagesNames = Object.keys(data.frames);

	for (let tileKey in TILES) {
		const regExp = RegExp(TILES[tileKey] + "( \\(\\d*\\))?.png");

		const names = imagesNames.filter(
			name => regExp.test(name)
		);
		tileNames[tileKey] = names;
	}
	console.log(tileNames);
});

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
const map = [];
const mapWidth = 10;
const mapHeight = 10;
const tileSize =  window.innerHeight / mapHeight;

const TILES = {
	"ground": "ground",
	"exit": "exit",
	"hauntedSpot": "haunted_spot",
	"border": "border"
}

const ACTIONS = {
	"idle" : "idle",
	"attack" : "attack",
	"hurt" : "hurt"
}

setGround(map);
setBoundaries(map);
setExitPoint(map);

// reikia sumapinti Tile tipa su paveiksliukais

PIXI.Loader.shared
	.add("images/ghost-hunter.json")
	.load(setup);

function setup() {
	let textureNames = PIXI.Loader.shared.resources["images/ghost-hunter.json"].textures;
	stageMap(textureNames); 
	stageHunter(textureNames);
}


function stageMap(textureNames){
	for (let row = 0; row < mapWidth; row++) {
		for (let col = 0; col < mapHeight; col++) {

			const tileType = map[row][col].tile;
			const names = tileNames[tileType];
			const name = names[randomInt(0, names.length - 1)];
			const texture = textureNames[name];

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
		map[row][mapHeight - 1].tile = TILES.border;
	}

	for (let col = 0; col < mapHeight; col++) {
		map[0][col].tile = TILES.border;
		map[mapWidth - 1][col].tile = TILES.border;
	}
}

function setExitPoint(map) {
	map[1][mapWidth - 2].tile = TILES.exit;
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