import Character from "./Character.js";

export default class Ghost extends Character {
	constructor(x,y,state, width, height){
		super(x,y,state,width, height);
		this.opacity = 0.4;
	}
}