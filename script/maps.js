class maps {
    startinghealth = 10;
    startinghealth = 10;

    canvasWidth = window.innerWidth - 20;
    canvasHeight = window.innerHeight - 50;

    grid = [];
    gridboxWidth = 34;
    gridboxHeight = 34;
    NumberOfRow = Math.floor(this.canvasHeight / this.gridboxHeight);
    NumberOfCol = Math.floor(this.canvasWidth / this.gridboxWidth);

    spawnpoint = {};
    enemyMovementTargets = [];
    towers = [];
    enemies = [];

    constructor(gridboxSize, canvasHeight, canvasWidth){
        if (gridboxSize < 0 || gridboxSize == null) {
            gridboxSize = 34;
        }
        this.gridboxWidth = gridboxSize;
        this.gridboxHeight = gridboxSize;

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        this.NumberOfCol = Math.floor(canvasWidth / gridboxSize);
        this.NumberOfRow = Math.floor(canvasHeight / gridboxSize);

        this.makeGrid();
    }

    calculateCanvasSize(gridboxSize, NumberOfRow, NumberOfCol){
        if (gridboxSize > 0 && gridboxSize !== null) {
            this.gridboxWidth = gridboxSize;
            this.gridboxHeight = gridboxSize;

            this.NumberOfCol = NumberOfCol;
            this.NumberOfRow = NumberOfRow;

            this.canvasWidth = Math.floor(NumberOfCol * gridboxWidth);
            this.canvasHeight = Math.floor(NumberOfRow * gridboxHeight);

            this.makeGrid();
        }
    }

    calculateCanvasSize(NumberOfRow, NumberOfCol){
        if (this.gridboxWidth > 0 && this.gridboxWidth !== null && this.gridboxHeight > 0 && this.gridboxHeight !== null) {
            this.NumberOfCol = NumberOfCol;
            this.NumberOfRow = NumberOfRow;

            this.canvasWidth = Math.floor(NumberOfCol * this.gridboxWidth);
            this.canvasHeight = Math.floor(NumberOfRow * this.gridboxHeight);

            this.makeGrid();
        }
    }
    
    makeGrid() {
        for(let row = 0; row < this.NumberOfRow; row++){
            this.grid[row] = [];
            for(let col = 0; col < this.NumberOfCol; col++){
                this.grid[row][col] = new gridBox(0 + (this.gridboxWidth * col), 0 + (this.gridboxHeight * row), this.gridboxWidth, this.gridboxHeight);
            }
        }
    }

    changeGridSize() {
        this.canvasWidth = Math.floor(this.NumberOfCol * this.gridboxWidth);
        this.canvasHeight = Math.floor(this.NumberOfRow * this.gridboxHeight);

        if (this.NumberOfCol > 0 && this.NumberOfRow > 0 && this.gridboxWidth > 0 && this.gridboxHeight > 0) {
            if (this.grid.length !== 0) {
                for(let row = 0; row < this.NumberOfRow; row++){
                    for(let col = 0; col < this.NumberOfCol; col++){
                        this.grid[row][col].x = 0 + (this.gridboxWidth * col);
                        this.grid[row][col].y = 0 + (this.gridboxHeight * row);
                        this.grid[row][col].width = this.gridboxWidth;
                        this.grid[row][col].height = this.gridboxHeight;
                    }
                }
            } else {
                makeGrid();
            }
        }
    }

    setGridboxSize(gridboxSize) {
        if (gridboxSize > 0 && gridboxSize !== null) {
            this.gridboxWidth = gridboxSize;
            this.gridboxHeight = gridboxSize;

            this.changeGridSize();
            this.spawnpoint = this.calculateMidGridPosition({row: this.spawnpoint.row, colum: this.spawnpoint.colum});
            for (let j = 0; j < this.enemies.length; j++) {
                this.enemies[j].calculateGridPosition2();
            }
            for (let i = 0; i < this.enemyMovementTargets.length; i++) {
                let gridPosition = {row: this.enemyMovementTargets[i].row, colum: this.enemyMovementTargets[i].colum};
                this.enemyMovementTargets[i] = this.calculateMidGridPosition(gridPosition);
            }
        }
    }

    calculateMidGridPosition(gridPosition) {
        let x = this.grid[gridPosition.row][gridPosition.colum].x + (this.gridboxWidth / 2);
        let y = this.grid[gridPosition.row][gridPosition.colum].y + (this.gridboxHeight / 2);
        return {x: x, y: y, row: gridPosition.row, colum: gridPosition.colum};
    }

    getTowers() {
        this.towers = [];
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j].tower !== null) {
                    this.towers.push(this.grid[i][j].tower);
                }
            } 
        }
    }
}

//functie voor het aanmaken van map 1
function map1(gridboxSize) {
    let map = new maps(gridboxSize);
    map.calculateCanvasSize(22, 47);

    map.grid[5][5].tower = new Tower("", map.grid[5][5].gridPosition);

    map.grid[15][5].tower = new Tower("", map.grid[15][5].gridPosition);

    map.grid[11][32].tower = new Tower("blue", map.grid[11][32].gridPosition);

    for (let test = 0; test < 35; test++) {
        map.grid[4][test].isPath = true;
    }
    for (let test = 0; test < 10; test++) {
        map.grid[test + 4][34].isPath = true;
    }
    for (let test = 0; test < 35; test++) {
        map.grid[14][test].isPath = true;
    }

    map.spawnpoint = map.calculateMidGridPosition({row: 4, colum: 0});

    map.enemyMovementTargets = [
        map.calculateMidGridPosition({row:4, colum: 34}),
        map.calculateMidGridPosition({row:14, colum: 34}),
        map.calculateMidGridPosition({row:14, colum: 0})
    ];

    map.getTowers();
    map.enemies = [];

    return map;
}

//hoe je een nieuwe map kan aamaken (zie bovenstaand voor code van andere maps)
//1. maak een functie voor het aanmaken van de map
//2. vul in de functie de volgende regels in:
//  let map = new maps(gridboxSize);
//  map.calculateCanvasSize(22, 47); //vervang 22 en 47 met het aantal kolommen en rijen dat de map moet hebben
//3. kies nu de doormiddel van map.grid[kolom][row] het pad en de torens
//4. vul in de locaties waar de enemy naar toe moet in de map.enemyMovementTargets array als {x: coordinaten, y: coordinaten}
//5. schrijf onderaan de volgende regels:
//  return map;


// ----------------- level functions -------------------

class level {
    levelnr = 1;
    paused = true;
    map = null;
    grid = [];
    enemies = [];
    towers = [];

    score = 0;
    health = 10;
    money = 500;
    maxEnemies = 5;

    constructor(levelnr){
        this.setLevel(levelnr);
    }

    setLevel(levelnr){
        if (levelnr == 1) {
            this.levelnr = levelnr;
            this.score = 0;
            this.health = 10;
            this.money = 500;
            this.paused = false;
            this.map = map1(34);
            this.grid = this.map.grid;
            this.enemies = this.map.enemies;
            this.towers = this.map.towers;
            this.maxEnemies = 5;
        } else if (levelnr == 2){
            this.levelnr = levelnr;
            this.score = 0;
            this.health = 12;
            this.money = 400;
            this.paused = false;
            this.map = map1(34);
            this.grid = this.map.grid;
            this.enemies = this.map.enemies;
            this.towers = this.map.towers;
            this.maxEnemies = 5;
        }  else if (levelnr == 3){
            this.levelnr = levelnr;
            this.score = 0;
            this.health = 15;
            this.money = 200;
            this.paused = false;
            this.map = map1(34);
            this.grid = this.map.grid;
            this.enemies = this.map.enemies;
            this.towers = this.map.towers;
            this.maxEnemies = 5;
        }
    }
}

// ------------------------ url functions ---------------------

function rederict(page) {
    var urlslice = window.location.href.split("/");
    var url = "";
    urlslice[urlslice.length - 1] = page;
    for (let index = 0; index < urlslice.length; index++) {
        if (index == urlslice.length - 1) {
            url = url + urlslice[index];
        } else {
            url = url + urlslice[index] + "/";
        }
    }
    console.log(window.location.href);
    console.log(url);
    console.log(urlslice[urlslice.length - 1]);
    window.location.href = url;
}
