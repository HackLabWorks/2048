// Tile class to represent individual tiles
class Tile {
    constructor(position, value) {
        this.x = position.x;
        this.y = position.y;
        this.value = value || 2;
        this.previousPosition = null;
        this.mergedFrom = null;
    }

    savePosition() {
        this.previousPosition = { x: this.x, y: this.y };
    }

    updatePosition(position) {
        this.x = position.x;
        this.y = position.y;
    }

    serialize() {
        return {
            position: { x: this.x, y: this.y },
            value: this.value
        };
    }
}

// Grid class to manage the game grid
class Grid {
    constructor(size) {
        this.size = size;
        this.cells = this.empty();
    }

    empty() {
        const cells = [];
        for (let x = 0; x < this.size; x++) {
            const row = cells[x] = [];
            for (let y = 0; y < this.size; y++) {
                row.push(null);
            }
        }
        return cells;
    }

    insertTile(tile) {
        this.cells[tile.x][tile.y] = tile;
    }

    removeTile(tile) {
        this.cells[tile.x][tile.y] = null;
    }

    withinBounds(position) {
        return position.x >= 0 && position.x < this.size &&
               position.y >= 0 && position.y < this.size;
    }

    available(position) {
        return !this.occupied(position);
    }

    occupied(position) {
        return !!this.cellContent(position);
    }

    cellContent(position) {
        if (this.withinBounds(position)) {
            return this.cells[position.x][position.y];
        } else {
            return null;
        }
    }

    availableCells() {
        const cells = [];
        this.eachCell((x, y, tile) => {
            if (!tile) {
                cells.push({ x: x, y: y });
            }
        });
        return cells;
    }

    randomAvailableCell() {
        const cells = this.availableCells();
        return cells.length ? cells[Math.floor(Math.random() * cells.length)] : null;
    }

    eachCell(callback) {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                callback(x, y, this.cells[x][y]);
            }
        }
    }

    serialize() {
        const cellState = [];
        for (let x = 0; x < this.size; x++) {
            const row = cellState[x] = [];
            for (let y = 0; y < this.size; y++) {
                row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
            }
        }
        return { size: this.size, cells: cellState };
    }
}

// Main Game Manager class
class Game2048 {
    constructor(size, inputManager, actuator, storageManager) {
        this.size = size || 4;
        this.inputManager = inputManager;
        this.storageManager = storageManager;
        this.actuator = actuator;
        
        this.startTiles = 2;
        this.grid = new Grid(this.size);
        this.score = 0;
        this.over = false;
        this.won = false;
        this.keepPlaying = false;
        
        this.addStartTiles();
        this.actuate();
        
        // Bind the move function
        this.inputManager.on('move', this.move.bind(this));
        this.inputManager.on('restart', this.restart.bind(this));
        this.inputManager.on('keepPlaying', this.keepPlaying.bind(this));
    }
    
    addStartTiles() {
        for (let i = 0; i < this.startTiles; i++) {
            this.addRandomTile();
        }
    }

    addRandomTile() {
        if (this.grid.availableCells().length) {
            const value = Math.random() < 0.9 ? 2 : 4;
            const tile = new Tile(this.grid.randomAvailableCell(), value);
            this.grid.insertTile(tile);
        }
    }

    actuate() {
        if (this.storageManager) {
            this.storageManager.clearGameState();
            
            if (this.over) {
                this.storageManager.clearGameState();
            } else {
                this.storageManager.setGameState(this.serialize());
            }
        }
        
        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storageManager ? this.storageManager.getBestScore() : 0,
            terminated: this.isGameTerminated()
        });
    }

    serialize() {
        return {
            grid: this.grid.serialize(),
            score: this.score,
            over: this.over,
            won: this.won,
            keepPlaying: this.keepPlaying
        };
    }
    
    prepareTiles() {
        this.grid.eachCell((x, y, tile) => {
            if (tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    }

    moveTile(tile, cell) {
        this.grid.cells[tile.x][tile.y] = null;
        this.grid.cells[cell.x][cell.y] = tile;
        tile.updatePosition(cell);
    }

    positionsEqual(first, second) {
        return first.x === second.x && first.y === second.y;
    }

    getVector(direction) {
        const map = {
            0: { x: -1, y: 0 }, // Up
            1: { x: 0, y: 1 },  // Right
            2: { x: 1, y: 0 },  // Down
            3: { x: 0, y: -1 }  // Left
        };
        return map[direction];
    }

    buildTraversals(vector) {
        const traversals = { x: [], y: [] };
        
        for (let pos = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }
        
        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();
        
        return traversals;
    }

    findFarthestPosition(cell, vector) {
        let previous;
        
        do {
            previous = cell;
            cell = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (this.grid.withinBounds(cell) && this.grid.available(cell));
        
        return {
            farthest: previous,
            next: cell
        };
    }
    
    move(direction) {
        if (this.isGameTerminated()) return;
        
        const cell = { x: 0, y: 0 };
        const vector = this.getVector(direction);
        const traversals = this.buildTraversals(vector);
        let moved = false;
        
        this.prepareTiles();
        
        traversals.x.forEach((x) => {
            traversals.y.forEach((y) => {
                cell.x = x;
                cell.y = y;
                
                const tile = this.grid.cellContent(cell);
                
                if (tile) {
                    const positions = this.findFarthestPosition(cell, vector);
                    const next = this.grid.cellContent(positions.next);
                    
                    if (next && next.value === tile.value && !next.mergedFrom) {
                        const merged = new Tile(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next];
                        
                        this.grid.insertTile(merged);
                        this.grid.removeTile(tile);
                        
                        tile.updatePosition(positions.next);
                        
                        this.score += merged.value;
                        
                        if (merged.value === 2048) this.won = true;
                    } else {
                        this.moveTile(tile, positions.farthest);
                    }
                    
                    if (!this.positionsEqual(cell, tile)) {
                        moved = true;
                    }
                }
            });
        });
        
        if (moved) {
            this.addRandomTile();
            
            if (!this.movesAvailable()) {
                this.over = true;
            }
            
            this.actuate();
        }
    }
    
    isGameTerminated() {
        return this.over || (this.won && !this.keepPlaying);
    }
    
    movesAvailable() {
        return this.grid.availableCells().length || this.tileMatchesAvailable();
    }
    
    tileMatchesAvailable() {
        let tile;
        
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                tile = this.grid.cellContent({ x: x, y: y });
                
                if (tile) {
                    for (let direction = 0; direction < 4; direction++) {
                        const vector = this.getVector(direction);
                        const cell = { x: x + vector.x, y: y + vector.y };
                        
                        const other = this.grid.cellContent(cell);
                        
                        if (other && other.value === tile.value) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    restart() {
        this.storageManager.clearGameState();
        this.actuator.continueGame();
        this.setup();
    }
    
    keepPlaying() {
        this.keepPlaying = true;
        this.actuator.continueGame();
    }
    
    setup() {
        const previousState = this.storageManager.getGameState();
        
        if (previousState) {
            this.grid = new Grid(previousState.grid.size, previousState.grid.cells);
            this.score = previousState.score;
            this.over = previousState.over;
            this.won = previousState.won;
            this.keepPlaying = previousState.keepPlaying;
        } else {
            this.grid = new Grid(this.size);
            this.score = 0;
            this.over = false;
            this.won = false;
            this.keepPlaying = false;
            
            this.addStartTiles();
        }
        
        this.actuate();
    }
    
}

// Input Manager class
class KeyboardInputManager {
    constructor() {
        this.events = {};
        
        if (window.navigator.msPointerEnabled) {
            this.eventTouchstart = 'MSPointerDown';
            this.eventTouchmove = 'MSPointerMove';
            this.eventTouchend = 'MSPointerUp';
        } else {
            this.eventTouchstart = 'touchstart';
            this.eventTouchmove = 'touchmove';
            this.eventTouchend = 'touchend';
        }
        
        this.listen();
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        const callbacks = this.events[event];
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
    
    listen() {
        const map = {
            38: 0, // Up
            39: 1, // Right
            40: 2, // Down
            37: 3, // Left
            75: 0, // Vim up
            76: 1, // Vim right
            74: 2, // Vim down
            72: 3, // Vim left
            87: 0, // W
            68: 1, // D
            83: 2, // S
            65: 3  // A
        };
        
        document.addEventListener('keydown', (event) => {
            const modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
            const mapped = map[event.which];
            
            if (!modifiers) {
                if (mapped !== undefined) {
                    event.preventDefault();
                    this.emit('move', mapped);
                }
            }
            
            if (!modifiers && event.which === 82) {
                this.restart.bind(this)(event);
            }
        });
        
        this.bindButtonPress('.restart-button', this.restart);
        this.bindButtonPress('.retry-button', this.restart);
        this.bindButtonPress('.keep-playing-button', this.keepPlaying);
        
        let touchStartClientX, touchStartClientY;
        const gameContainer = document.getElementsByClassName('game-container')[0];
        
        gameContainer.addEventListener(this.eventTouchstart, (event) => {
            if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
                event.targetTouches.length > 1) {
                return;
            }
            
            if (window.navigator.msPointerEnabled) {
                touchStartClientX = event.pageX;
                touchStartClientY = event.pageY;
            } else {
                touchStartClientX = event.touches[0].clientX;
                touchStartClientY = event.touches[0].clientY;
            }
            
            event.preventDefault();
        });
        
        gameContainer.addEventListener(this.eventTouchend, (event) => {
            if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
                event.targetTouches.length > 0) {
                return;
            }
            
            let touchEndClientX, touchEndClientY;
            
            if (window.navigator.msPointerEnabled) {
                touchEndClientX = event.pageX;
                touchEndClientY = event.pageY;
            } else {
                touchEndClientX = event.changedTouches[0].clientX;
                touchEndClientY = event.changedTouches[0].clientY;
            }
            
            const dx = touchEndClientX - touchStartClientX;
            const absDx = Math.abs(dx);
            
            const dy = touchEndClientY - touchStartClientY;
            const absDy = Math.abs(dy);
            
            if (Math.max(absDx, absDy) > 10) {
                this.emit('move', absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
            }
        });
    }
    
    restart(event) {
        event.preventDefault();
        this.emit('restart');
    }
    
    keepPlaying(event) {
        event.preventDefault();
        this.emit('keepPlaying');
    }
    
    bindButtonPress(selector, fn) {
        const button = document.querySelector(selector);
        if (button) {
            button.addEventListener('click', fn.bind(this));
            button.addEventListener(this.eventTouchend, fn.bind(this));
        }
    }
}

// HTML Actuator class
class HTMLActuator {
    constructor() {
        this.tileContainer = document.querySelector('.tile-container');
        this.scoreContainer = document.querySelector('.score-container');
        this.bestContainer = document.querySelector('.best-container');
        this.messageContainer = document.querySelector('.game-message');
        
        this.score = 0;
    }
    
    actuate(grid, metadata) {
        const self = this;
        
        window.requestAnimationFrame(() => {
            self.clearContainer(self.tileContainer);
            
            grid.cells.forEach((column) => {
                column.forEach((cell) => {
                    if (cell) {
                        self.addTile(cell);
                    }
                });
            });
            
            self.updateScore(metadata.score);
            self.updateBestScore(metadata.bestScore);
            
            if (metadata.terminated) {
                if (metadata.over) {
                    self.message(false);
                } else if (metadata.won) {
                    self.message(true);
                }
            }
        });
    }
    
    continueGame() {
        this.clearMessage();
    }
    
    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
    
    addTile(tile) {
        const wrapper = document.createElement('div');
        const inner = document.createElement('div');
        const position = tile.previousPosition || { x: tile.x, y: tile.y };
        const positionClass = this.positionClass(position);
        
        const classes = ['tile', `tile-${tile.value}`, positionClass];
        
        if (tile.value > 2048) classes.push('tile-super');
        
        this.applyClasses(wrapper, classes);
        
        inner.classList.add('tile-inner');
        inner.textContent = tile.value;
        
        if (tile.previousPosition) {
            window.requestAnimationFrame(() => {
                classes[2] = this.positionClass({ x: tile.x, y: tile.y });
                this.applyClasses(wrapper, classes);
            });
        } else if (tile.mergedFrom) {
            classes.push('tile-merged');
            this.applyClasses(wrapper, classes);
            
            tile.mergedFrom.forEach((merged) => {
                this.addTile(merged);
            });
        } else {
            classes.push('tile-new');
            this.applyClasses(wrapper, classes);
        }
        
        wrapper.appendChild(inner);
        this.tileContainer.appendChild(wrapper);
    }
    
    applyClasses(element, classes) {
        element.setAttribute('class', classes.join(' '));
    }
    
    normalizePosition(position) {
        return { x: position.x + 1, y: position.y + 1 };
    }
    
    positionClass(position) {
        position = this.normalizePosition(position);
        return `tile-position-${position.x}-${position.y}`;
    }
    
    updateScore(score) {
        this.clearContainer(this.scoreContainer);
        
        const difference = score - this.score;
        this.score = score;
        
        this.scoreContainer.textContent = this.score;
        
        if (difference > 0) {
            const addition = document.createElement('div');
            addition.classList.add('score-addition');
            addition.textContent = `+${difference}`;
            
            this.scoreContainer.appendChild(addition);
        }
    }
    
    updateBestScore(bestScore) {
        this.bestContainer.textContent = bestScore;
    }
    
    message(won) {
        const type = won ? 'game-won' : 'game-over';
        const message = won ? 'You win!' : 'Game over!';
        
        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName('p')[0].textContent = message;
    }
    
    clearMessage() {
        this.messageContainer.classList.remove('game-won');
        this.messageContainer.classList.remove('game-over');
    }
}

// Local Storage Manager class
class LocalStorageManager {
    constructor() {
        this.bestScoreKey = 'bestScore';
        this.gameStateKey = 'gameState';
        
        const supported = this.localStorageSupported();
        this.storage = supported ? window.localStorage : window.fakeStorage;
    }
    
    localStorageSupported() {
        const testKey = 'test';
        
        try {
            const storage = window.localStorage;
            storage.setItem(testKey, '1');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    getBestScore() {
        return this.storage.getItem(this.bestScoreKey) || 0;
    }
    
    setBestScore(score) {
        this.storage.setItem(this.bestScoreKey, score);
    }
    
    getGameState() {
        const stateJSON = this.storage.getItem(this.gameStateKey);
        return stateJSON ? JSON.parse(stateJSON) : null;
    }
    
    setGameState(gameState) {
        this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    }
    
    clearGameState() {
        this.storage.removeItem(this.gameStateKey);
    }
}

// Fake storage for browsers that don't support localStorage
window.fakeStorage = {
    _data: {},
    
    setItem: function (id, val) {
        return this._data[id] = String(val);
    },
    
    getItem: function (id) {
        return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    },
    
    removeItem: function (id) {
        return delete this._data[id];
    },
    
    clear: function () {
        return this._data = {};
    }
};

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const gameManager = new Game2048(4, new KeyboardInputManager(), new HTMLActuator(), new LocalStorageManager());
});