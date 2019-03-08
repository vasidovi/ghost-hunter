import Character from "./Character.js";
import { redrawHearts } from "../game.js";

export default class Hunter extends Character {

 get health(){
	 return this._health;
 }

	set health(value){
		console.log(value);
		this._health = value;
		redrawHearts(value);
	}
}