
class AcrossCell {
    constructor(x, y, letter) {
        this.x = x;
        this.y = y;
        this.letter = letter;
        this.clues = { across: null, down: null}
    }

    get id(){
        return this.x + ':' + this.y;
    }
}

export default AcrossCell;