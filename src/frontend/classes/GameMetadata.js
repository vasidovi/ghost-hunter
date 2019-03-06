export default class GameMetadata{
	constructor(){
		this._state = null; 
	}
    get state() {
      return this._state;
		}

    set state(value) {
      this._state = value;
    }

}