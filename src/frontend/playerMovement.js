import {hunter, map, initiatives, nextCharacter} from "./game.js";
import * as constants from "./constants.js";
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

	if (hunter.x-1 < 0 || initiatives[0] != hunter) {
		return;
	}
	if (isPassableTile("hunter", map[hunter.x-1][hunter.y])) {
		hunter.x -= 1;
		nextCharacter();		
	}
};

right.press = function () {
	if (hunter.x+1 >= constants.mapWidth  || initiatives[0] != hunter) {
		return;
	}
	if (isPassableTile("hunter", map[hunter.x+1][hunter.y])) {
		hunter.x += 1;
		nextCharacter();
	}

}

up.press = function () {
	if (hunter.y-1 < 0  || initiatives[0] != hunter){
		return;
	}
	if (isPassableTile("hunter", map[hunter.x][hunter.y-1])) {
		hunter.y -= 1;
		nextCharacter();
	}
};

down.press = function () {
	if (hunter.y+1 >= constants.mapHeight  || initiatives[0] != hunter){
		return;
	}
	if (isPassableTile("hunter", map[hunter.x][hunter.y+1])) {
		hunter.y += 1;
		nextCharacter();
		}
};