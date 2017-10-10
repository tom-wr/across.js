
class AcrossClue {
    constructor(clue, wordLength, startCell, direction) {
        this.clue = clue;
        this.wordLength = wordLength;
        this.startCell = startCell;
        this.direction = direction;
        this._generateId();
    }

    _generateId(){
        this.id = this.startCell.split(':').join('') + this.direction;
    }

}

export default AcrossClue;