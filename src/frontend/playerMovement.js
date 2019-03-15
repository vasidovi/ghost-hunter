import { hunter, map, gameMetadata, mapContainer, drawObjectsInMap, end, initiatives, nextCharacter } from "./game.js";
import * as constants from "./constants.js";
import { keyboard } from "./keyboardControl.js";

let left = keyboard(37),
	up = keyboard(38),
	right = keyboard(39),
	down = keyboard(40),
	space = keyboard(32); // picking up stuff 



function isExitTile(tile) {
	let isExit = false;
	if ('types' in tile) {
		const types = tile.types;
		return types.find(function (element) {
			if (element == "exit") {
				return isExit = true;
			}
		});
	}
	return isExit;
}
// map is [y][x] !!

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

space.press = function () {
	if (map[hunter.y][hunter.x].objects) {
		let objects = map[hunter.y][hunter.x].objects;
		const gear = hunter.gear;
		let objectsCopy = objects.slice(0);
		
let spliced = 0;
		for (let i=0; i < objects.length; i++) {
			let existingObject = hunter.gear.find(function (element) {
				return element.name == objects[i].name;
			});

			if (existingObject) {
				existingObject.count += objects[i].count;
			} else {
				gear.push(objects[i]);
			}
			hunter.gear = gear;
			objectsCopy.splice(i-spliced, 1);
			spliced++;
			// not ideal but works 
		}
		drawObjectsInMap(objectsCopy, mapContainer.getChildAt(hunter.x*constants.mapWidth + hunter.y));
		nextCharacter();
	}
}

left.press = function () {

	if (hunter.x - 1 < 0 || initiatives[0] != hunter) {
		return;
	}
	if (isExitTile(map[hunter.y][hunter.x - 1])) {
		hunter.x -= 1;
		gameMetadata.state = end;
	}
	if (isPassableTile("hunter", map[hunter.y][hunter.x - 1])) {
		hunter.x -= 1;
		nextCharacter();
	}
};

right.press = function () {
	if (hunter.x + 1 >= constants.mapWidth || initiatives[0] != hunter) {
		return;
	}
	if (isExitTile(map[hunter.y][hunter.x + 1])) {
		hunter.x += 1;
		gameMetadata.state = end;
	}
	if (isPassableTile("hunter", map[hunter.y][hunter.x + 1])) {
		hunter.x += 1;
		nextCharacter();
	}

}

up.press = function () {
	if (hunter.y - 1 < 0 || initiatives[0] != hunter) {
		return;
	}
	if (isExitTile(map[hunter.y - 1][hunter.x])) {
		hunter.y -= 1;
		gameMetadata.state = end;
	}
	if (isPassableTile("hunter", map[hunter.y - 1][hunter.x])) {
		hunter.y -= 1;
		nextCharacter();
	}
};

down.press = function () {
	if (hunter.y + 1 >= constants.mapHeight || initiatives[0] != hunter) {
		return;
	}
	if (isExitTile(map[hunter.y + 1][hunter.x])) {
		hunter.y += 1;
		gameMetadata.state = end;
	}
	if (isPassableTile("hunter", map[hunter.y + 1][hunter.x])) {
		hunter.y += 1;
		nextCharacter();
	}
};