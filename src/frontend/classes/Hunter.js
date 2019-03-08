import Character from "./Character.js";
import { redrawHearts } from "../game.js";

export default class Hunter extends Character {

 get health(){
	 return super.health;
 }

	set health(value){
		super.health = value;
		redrawHearts(value);
	}
}