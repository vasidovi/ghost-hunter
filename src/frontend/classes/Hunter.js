import Character from "./Character.js";
import { redrawHearts, redrawToolContainer } from "../game.js";

export default class Hunter extends Character {

	get health() {
		return super.health;
	}

	set health(value) {
		super.health = value;
		redrawHearts(value);
	}

	get gear() {
		return super.gear;
	}

	set gear(value) {
		super.gear = value;
		console.log(super.gear);
		redrawToolContainer(value);
	}

}