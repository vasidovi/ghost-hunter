export default class Object{
	// this.types { solid, metal}
	// this.equipable  = ...

	constructor(name, count) {
		this.name = name;
		this.count = count;
		this.types = [];
		this.equipable = true;
	}
	
}