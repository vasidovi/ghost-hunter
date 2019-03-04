export const mapWidth = 10;
export const mapHeight = 10;
export const tileSize = window.innerHeight / mapHeight;

export const impassableTiles = {
	"hunter": ["solid", "boundary"],
}

export const TILES = {
	"ground": "ground",
	"exit": "exit",
	"haunted_spot": "haunted_spot",
	"border": "border"
}

export const ACTIONS = {
	"idle": "idle",
	"attack": "attack",
	"hurt": "hurt"
}

export const CHARACTERS = {
	"hunter": "hunter",
	"ghost": "ghost"
}

export const textureNames = {
	"tiles": {},
	"characters": {}
};

export function initializeContstants(callback){
	fillTextureNamesMap(callback);
}

 function fillTextureNamesMap(callback) {
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
		callback();
	});
}

function getTextureNames(imagesNames, nameRoot) {

	const regExp = RegExp(nameRoot + "( \\(\\d*\\))?.png");
	return imagesNames.filter(
		name => regExp.test(name)
	);
}