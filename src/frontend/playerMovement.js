import {hunter, map} from "./game.js";
import * as constants from "./parameters.js";
import {keyboard} from "./keyboardControl.js";

let left = keyboard(37),
	up = keyboard(38),
	right = keyboard(39),
	down = keyboard(40);

function isPassableTile(creature, tile) {

	if ('types' in tile) {

		const types = tile.types;
		const obstacles = constants.impassableTiles[creature] || [];
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
	const row = Math.round(hunter.y / constants.tileSize);
	const col = Math.round((hunter.x - constants.tileSize) / constants.tileSize);
	if (col < 0) {
		return;
	}
	if (isPassableTile("hunter", map[row][col])) {
		hunter.x -= constants.tileSize;
	}
};

right.press = function () {
	const row = Math.round(hunter.y / constants.tileSize);
	const col = Math.round((hunter.x + constants.tileSize) / constants.tileSize);

	if (col >= constants.mapWidth) {
		return;
	}
	if (isPassableTile("hunter", map[row][col])) {
		hunter.x += constants.tileSize;
	}

}

up.press = function () {
	const row = Math.round((hunter.y - constants.tileSize) / constants.tileSize);
	const col = Math.round(hunter.x / constants.tileSize);
	if (row < 0){
		return;
	}
	if (isPassableTile("hunter", map[row][col])) {
		hunter.y -= constants.tileSize;
		}
};

down.press = function () {
	const row = Math.round((hunter.y + constants.tileSize) / constants.tileSize);
	const col = Math.round(hunter.x / constants.tileSize);
	if (row >= constants.mapHeight){
		return;
	}
	if (isPassableTile("hunter", map[row][col])) {
		hunter.y += constants.tileSize;
		}
};