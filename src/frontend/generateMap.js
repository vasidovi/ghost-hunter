import * as constants from "./parameters.js";


export function setGround(map) {
	for (let i = 0; i < constants.mapWidth; i++) {
		const row = [];
		map.push(row);
		for (let j = 0; j < constants.mapHeight; j++) {
			const tile = {
				tile: constants.TILES.ground
			};
			row.push(tile);
		}
	}
}

export function setBoundaries(map) {
	for (let row = 0; row < constants.mapWidth; row++) {
		map[row][0].tile = constants.TILES.border;
		map[row][0].types = ["solid", "boundary"];
		map[row][constants.mapHeight - 1].tile = constants.TILES.border;
		map[row][constants.mapHeight - 1].types = ["solid", "boundary"];
	}

	for (let col = 0; col < constants.mapHeight; col++) {
		map[0][col].tile = constants.TILES.border;
		map[0][col].types = ["solid", "boundary"];
		map[constants.mapWidth - 1][col].tile = constants.TILES.border;
		map[constants.mapWidth - 1][col].types = ["solid", "boundary"];
	}
}

export function setExitPoint(map) {
	map[1][constants.mapWidth - 2].tile = constants.TILES.exit;
	map[1][constants.mapWidth - 2].types = ["exit"];
}
