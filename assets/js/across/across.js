//import {isEmpty} from 'lodash';
import $ from 'jquery';
import AcrossCell from './acrosscell.js';
import AcrossClue from './acrossclue.js';

class Across {

    constructor(wrapper, options){
        // set default properties
        this._setDefaults();
        this.$wrapper = wrapper;
        // set options
        /*if(!isEmpty(options)) {
            Object.assign(this, options);
        }*/

        // data structures and inject into dom
        this._buildGrid();
        this._buildClues();
        this._inject();
        // format and style
        this._format();
        // add events
        this._events();
    }

    // set default properties
    _setDefaults() {
        this.grid_size = 15;
        this.cells = [];
        this.clueNumbers = new Set();
        this.clues = {across:{}, down:{}};
        this.activeClue = null;
        this.activeDirection = 'across';
    }

    // create cells to populate the grid
    _buildGrid() {
        this.$grid = this._createGridElement();
        for(let i = 0; i < this.grid_size; i++)
        {
            let $row = this._createRowElement();
            this.$grid.append($row);
            this.cells[i] = [];

            for(let j = 0; j < this.grid_size; j++)
            {
                let cell = this._createCell(i, j, DATA.grid[i][j]);
                this.cells[i][j] = cell;
                let $cell = this._createCellElement(cell);
                $row.append($cell);
            }
        }
    }

    // build the clues
    _buildClues() {
        this.$clues = this._createCluesElement();
        this._buildCluesByDirection('across', DATA.clues.across);
        this._buildCluesByDirection('down', DATA.clues.down);
    }

    // create clue elementd from the clue data for s given direction
    _buildCluesByDirection(direction, data) {
        for(let clueId in data){
            let clue = data[clueId];
            let newClue = new AcrossClue(clue.clue, clue.letter_count, clueId, direction);
            this.clues[direction][newClue.id] = newClue;
            this.$clues.find('.across-clues-' + direction).first().append(this._createClueElement(newClue));
        }
    }

    // create a cell and assign clue start cells to clueNumber set
    _createCell(i, j, letter) {

        let cell = new AcrossCell(i, j, letter);
        if(cell.id in DATA.clues.across || cell.id in DATA.clues.down) {
            this.clueNumbers.add(cell.id);
        }
        return cell;
    }

    // create clue element
    _createClueElement(clue){
        let $clueText = $('<p>').text(clue.clue + ' ('+clue.wordLength+')').addClass('across-clue-text');
        let $clueNumber = $('<p>').addClass('across-clue-number');
        return $('<li>', {
            class: 'across-clue',
            attr: {
                'data-across-clue-id': clue.id
            }
        }).append([$clueNumber, $clueText]);
    }

    // create grid cell element
    _createCellElement(cell) {

        let $cell = $('<div>', {
            class: 'across-cell',
            attr: {
                'data-across-cell-id': cell.id
            }
        });
        if (cell.letter == '0')
            $cell.addClass('blank');
        return $cell;
    }

    // create grid row element
    _createRowElement() {
        return $('<div>', {
            class: 'across-row'
        });
    }

    // create grid element
    _createGridElement() {
        return $('<div/>', {
            class: 'across-grid'
        });
    }

    // crate clues lists
    _createCluesElement() {
        let $acrossClues = $('<div>').append('<h2>Across<h2/>').addClass('col-md-6');
        let $acrossList = $('<ul>').addClass('across-clues-across .across-clues-list').appendTo($acrossClues);
        let $downClues = $('<div>').append('<h2>Down<h2/>').addClass('col-md-6');
        let $downlist = $('<ul>').addClass('across-clues-down .across-clues-list').appendTo($downClues);
        let $clues = $('<div/>', {
            class: 'across-clues row'
        }).append([$acrossClues, $downClues]);
        return $clues;
    }

    // add elements to the dom
    _inject() {
        let $gridWrapper = $('<div>').addClass('across-grid-container').addClass('col-md-4').append(this.$grid);
        let $clueWrapper = $('<div>').addClass('across-clues-container').addClass('col-md-8').append(this.$clues);
        this.$wrapper.append($gridWrapper);
        this.$wrapper.append($clueWrapper);
    }

    // format the cells, input and clue numbers
    _format() {
        this._formatResizeCells();
        this._formatInput();
        this._formatNumbers();
        this._assignCluesToCells();
        this._assignClueNumbersToClues();
    }

    // calculate cell resizing and format
    _formatResizeCells() {
        let cellWidth = this._get$Cell('0:0').width();
        let fontSize = cellWidth * 0.55;
        this.$grid.css('font-size', fontSize);
        this._formatCells(cellWidth);
    }

    // add input elements to cells
    _formatInput() {
        let $input = $('<input>').attr({'type': 'text', 'maxlength': 1}).addClass('across-cell-input');
        $('.across-cell:not(.blank)').append($input);
    }

    // format cell height
    _formatCells(cellHeight) {
        $('.across-cell').height(cellHeight);
    }

    // the cell $element given an id string
    _get$Cell (id) {
        let cellId = '[data-across-cell-id="' + id + '"]';
        let cell = this.$grid.find('.across-cell').filter(cellId).first();
        return cell;
    }

    // get a cell object given an id string
    _getCell(id) {
        let coords = this._coordsFromKey(id);
        let x = coords.x;
        let y = coords.y;
        console.log(x, y);
        return this.cells[x][y];
    }

    // get x and y coords from the id strings
    _coordsFromKey(key){
        let coords = key.split(':');
        return {x: coords[0], y: coords[1]}
    }

    _coordsToKey(x, y){
        return x + ':' + y;
    }

    // add the clue numbers to start cells
    _formatNumbers() {
        let count = 0;
        for(let cellId of this.clueNumbers) {
            let $cell = this._get$Cell(cellId);
            let $clueNumber = $('<div>').addClass('clue-number').html(++count);
            $cell.prepend($clueNumber).attr('data-clue-number', count);
        }
    }

    // assign clue ids to each cell for both directions
    _assignCluesToCells() {
        console.log(this.clues.down);
        for(let clue in this.clues.across) {
            this._assignClueCrawl(this.clues.across[clue], true);
        }
        for(let clue in this.clues.down) {
            this._assignClueCrawl(this.clues.down[clue], false);
        }
    }

    // crawl across or down from a given clue start cell to assign corresponding clues to each cell
    _assignClueCrawl(clue, directionAcross) {

        let coords = this._coordsFromKey(clue.startCell);
        let x = coords.x;
        let y = coords.y;
        let currentCell = this.cells[x][y];
        let x_length = this.cells.length;
        let y_length = this.cells[x].length;

        while(currentCell.letter != '0') {

            if((x < x_length) && (y < y_length)) {
                if (directionAcross) {
                    currentCell.clues.across = clue.id;
                    currentCell = this.cells[x][++y];
                }
                else {
                    currentCell.clues.down = clue.id;
                    if(this.cells[++x]){
                        currentCell = this.cells[x][y];
                    }
                }
                if (!currentCell)
                    break;

            } else {break;}

        }

    }

    // assign the clue number to the start cells
    _assignClueNumbersToClues() {
        this._assignClueNumbersFromClueData(this.clues.across);
        this._assignClueNumbersFromClueData(this.clues.down);
    }

    // assign clue numbers to start cells given directioned clue data
    _assignClueNumbersFromClueData(directionClues) {
        for(let clueId in directionClues) {
            let clue = directionClues[clueId];
            let startCell = clue.startCell;
            let clueNumber  = this._get$Cell(startCell).data('clue-number');
            let $clue = this.$clues.find('[data-across-clue-id=' + clue.id + ']').first();
            $clue.find('.across-clue-number').first().html(clueNumber + '. ');
        }
    }

    _events() {

        // handle clicks on cells
        // set the activeClue and highlight corresponding clue and cells
        this.$grid.on('click', '.across-cell:not(.blank)', (e) => {
            let cellId = $(e.currentTarget).data('across-cell-id');
            let cell = this._getCell(cellId);

            if (this.lastCellClicked == cell.id) {
                this._toggleDirection();
            }
            this.lastCellClicked = cell.id;
            let clueId = this._getActiveClueByCell(cell);
            this._highlightCellsByClue(clueId);
            this._highlightClue(clueId);

            return false;
        });

        // handle typing
        this.$grid.on('keydown', (e) => {
            let keyCode = e.originalEvent.keyCode;
            let key = e.originalEvent.key;
            if (keyCode >= 65 && keyCode <= 90){

                $(e.target).val(key);

                let $cell = $(e.target).closest("div");
                let nextCellId = $cell.data('across-cell-id');
                this._moveToNextCell(nextCellId);
            }
           return false;
        });

        // handle clicks on clue li
        //  set active-clue and highlight corresponding clue and cells
        this.$clues.on('click', '.across-clue', (e) => {

            let targetClue = $(e.currentTarget);
            let activeClueId = targetClue.data('across-clue-id');
            this._highlightClue(activeClueId);

            if(this.clues.down[activeClueId]) {
                this.activeClue = this.clues.down[activeClueId];
                this.activeDirection = 'down';
            } else if(this.clues.across[activeClueId]) {
                this.activeClue = this.clues.across[activeClueId];
                this.activeDirection = 'across';
            }

            this._get$Cell(this.activeClue.startCell).find('.across-cell-input').first().focus();
            this._highlightCellsByClue(activeClueId);
            return false;
        });

        $(window).resize(() => {
            this._formatResizeCells();
        });
    }

    // Get the next cell along the line depending on the active direction
    _moveToNextCell(cellId) {
        let coords = this._coordsFromKey(cellId);
        if(this.activeDirection == 'down') {
            coords.x++;
        } else {
            coords.y++;
        }
        let $cell = this._get$Cell(this._coordsToKey(coords.x, coords.y));
        if($cell)
        {
            $cell.find('.across-cell-input').first().focus();
        }
    }

    // search the grid and highlight all cells are attached to the given clue id
    _highlightCellsByClue(clueId) {
        this.$grid.find('.highlight-cell').removeClass('highlight-cell');
        for(let i = 0; i < this.cells.length; i++)
        {
            for(let j = 0; j < this.cells[i].length; j++)
            {
                let cell = this.cells[i][j];
                if(this.activeDirection == 'across'){
                    if(cell.clues.across == clueId){
                        this._get$Cell(this._coordsToKey(i, j)).addClass('highlight-cell')
                    }
                } else {
                    if(cell.clues.down == clueId){
                        this._get$Cell(this._coordsToKey(i, j)).addClass('highlight-cell')
                    }
                }
            }
        }
    }

    // highlight a clue
    _highlightClue(clueId) {
        $('.highlight-clue').removeClass('highlight-clue');
        $("[data-across-clue-id='" + clueId + "']").addClass('highlight-clue');
    }

    // print cell debug
    _printCells() {
        for(let i = 0; i < 14; i++){
            for(let j = 0; j < 14; j++){
                console.log(this.cells[i][j].clue)
            }
        }
    }

    // get a clueId given a cell and depending on active direction
    _getActiveClueByCell(cell) {
        let clueId = null;
        if(cell.clues[this.activeDirection]){
            clueId = cell.clues[this.activeDirection];
        } else {
            this._toggleDirection();
            clueId = cell.clues[this.activeDirection];
        }
        return clueId;
    }

    // toggle the active direction between across and down
    _toggleDirection() {
        if(this.activeDirection == 'across') {
            this.activeDirection = 'down';
        } else {
            this.activeDirection = 'across';
        }
    }

}

// Dummy data
const DATA = {
    grid: [
        ['0','0','0','G','0','P','0','0','0','P','0','B','0','0','0'],
        ['0','C','A','R','T','O','N','0','W','A','L','R','U','S','0'],
        ['0','R','0','U','0','E','0','B','0','S','0','O','0','P','0'],
        ['D','E','F','E','A','T','0','U','N','T','O','W','A','R','D'],
        ['0','A','0','S','0','I','0','T','0','R','0','S','0','A','0'],
        ['O','S','L','O','0','C','O','T','T','A','G','E','P','I','E'],
        ['0','E','0','M','0','0','0','E','0','M','0','0','0','N','0'],
        ['0','0','J','E','O','P','A','R','D','I','S','E','D','0','0'],
        ['0','J','0','0','0','I','0','F','0','0','0','V','0','D','0'],
        ['D','I','F','F','I','C','U','L','T','Y','0','I','M','A','M'],
        ['0','N','0','L','0','K','0','I','0','A','0','D','0','Z','0'],
        ['E','X','C','U','S','E','M','E','0','W','H','E','E','Z','E'],
        ['0','E','0','T','0','D','0','S','0','N','0','N','0','L','0'],
        ['0','D','I','E','O','U','T','0','R','E','S','C','U','E','0'],
        ['0','0','0','S','0','P','0','0','0','D','0','E','0','0','0']
    ]
    ,
    clues: {
        across: {
            '1:1': {
                clue: 'Vehicle\'s taking heavyweight container',
                letter_count: '6'
            },
            '1:8': {
                clue: 'Fight to protect large American animal',
                letter_count: '6'
            },
            '3:0': {
                clue: 'Overcome death nearly with heart of iron',
                letter_count: '6'
            },
            '3:7': {
                clue: 'Drawn out reorganisation is not right and proper',
                letter_count: '8'
            },
            '5:0': {
                clue: 'Look after sailor in port',
                letter_count: '4'
            },
            '5:5': {
                clue: 'Country house has good English minced beef and mash',
                letter_count: '7,3'
            },
            '7:2': {
                clue: 'Head off big cat outside, after Jack\'s put in danger',
                letter_count: '11'
            },
            '9:0': {
                clue: 'Trouble from iffy cult I\'d abandoned',
                letter_count: '10'
            },
            '9:11': {
                clue: 'Some acclaim a Muslim leader',
                letter_count: '4'
            },
            '11:0': {
                clue: 'Hey! Make allowances for setter',
                letter_count: '6,2'
            },
            '11:9': {
                clue: 'Passes water hearing struggle for breath',
                letter_count: '6'
            },
            '13:1': {
                clue: 'Endless tedious travelling is to become less common',
                letter_count: '3,3'
            },
            '13:8': {
                clue: 'Regret being without key to recovery',
                letter_count: '6'
            }
        },
        down: {
            '0:3': {
                clue: 'Repugnant having several pursuing unnatural urge',
                letter_count: '8'
            },
            '0:5': {
                clue: 'About to quote work that\'s lyrical',
                letter_count: '6'
            },
            '0:9': {
                clue: 'Imparts a dash to cold meat',
                letter_count: '8'
            },
            '0:11': {
                clue: 'Look round, having heard bee within flower',
                letter_count: '6'
            },
            '1:1': {
                clue: 'Finish raw edge in pleat',
                letter_count: '6'
            },
            '1:13': {
                clue: 'Pops back to collect gunners\' wrench',
                letter_count: '6'
            },
            '2:7': {
                clue: ' Goat runs away from insects',
                letter_count: '11'
            },
            '7:5': {
                clue: 'Heard Sheeran\'s invested in truck',
                letter_count: '6,2'
            },
            '7:11': {
                clue: 'Proof that even cider production\'s not right',
                letter_count: '8'
            },
            '8:1': {
                clue: 'Knight, unknown in Jedi order, brought bad luck',
                letter_count: '6'
            },
            '8:13': {
                clue: 'Blinding light where bends cut through valley',
                letter_count: '6'
            },
            '9:3': {
                clue: 'Fine instruments found in woodwind section',
                letter_count: '6'
            },
            '9:9': {
                clue: 'Showed sign of tiredness with break of new day',
                letter_count: '6'
            }
        }
    }
};

export default Across;