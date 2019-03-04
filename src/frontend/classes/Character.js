import * as constants from "../constants.js";

export default class Character {

	constructor(x, y, state, width, height) {
		this.x = x;
		this.y = y;
		this.state = state;
		this.width = width;
		this.height = height;
		this.sprite = null;
		this._x = x;  // "private" field
		this._y = y;  // "private" field
	}

	get x() {
		return this._x;
	}
	get y() {
		return this._y;
	}

	set x(value) {
		this._x = value;
		if (this.sprite) {
			this.sprite.x = value * constants.tileSize;
		}
	}
	set y(value) {
		this._y = value;
		if (this.sprite) {
			this.sprite.y = value * constants.tileSize;
		}
	}
}