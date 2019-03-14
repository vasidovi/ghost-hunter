import * as constants from "../constants.js";
import { createCharacterSprite, hunter } from "../game.js";

export default class Character {

	constructor(x, y, name, width, height) {
		this.x = x;
		this.y = y;
		this.name = name;
		this.width = width;
		this.height = height;
		this.spriteContainer = new PIXI.Container();
		this.state = "idle";
		this.sprite = null;
		this.gear = []; // only for player ? - maybe NPCs drop gear ? 

		// this._x = x;  // "private" field
		// this._y = y;  // "private" field
		this.health = 3;
	}

	get health() {
		return this._health;
	}

	set health(value) {
		if (value < this._health) {
			this.changeState("hurt");
			this.sprite.loop = false;
			this.sprite.onComplete = () => {
				this.changeState("idle");
			}
		}
		this._health = value;
	}

	get gear() {
		return this._gear;
	}

	set gear(value) {
		this._gear = value;		
}

	get x() {
		return this._x;
	}
	get y() {
		return this._y;
	}

	set x(value) {
		this._x = value;
		if (this.spriteContainer) {
			this.spriteContainer.x = value * constants.tileSize;
		}
	}
	set y(value) {
		this._y = value;
		if (this.spriteContainer) {
			this.spriteContainer.y = value * constants.tileSize;
		}
	}

	changeState(state) {
		this.spriteContainer.removeChildren();
		this.state = state;
		this.sprite = createCharacterSprite(this);
		this.spriteContainer.addChild(this.sprite);
	}

	attack(target) {
		if (target.health > 0) {
			target.health--;
			this.changeState("attack");
			this.sprite.loop = false;
			this.sprite.onComplete = () => {
				this.changeState("idle");
			}
		} else {
			console.log("I am dead");
		}
	}
}