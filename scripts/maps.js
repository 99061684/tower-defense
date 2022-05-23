
class maps {
    startinghealth = 10;
    startinghealth = 10;

    canvasWidth = window.innerWidth - 20;
    canvasHeight = window.innerHeight - 50;

    level = null;
    grid = [];
    gridboxWidth = 34;
    gridboxHeight = 34;
    NumberOfRow = Math.floor(this.canvasHeight / this.gridboxHeight);
    NumberOfCol = Math.floor(this.canvasWidth / this.gridboxWidth);

    spawnpoints = {};
    enemyMovementTargets = [];
    towers = [];

    constructor(level, gridboxSize = 34, canvasHeight = null, canvasWidth = null){
        if (gridboxSize < 0 || gridboxSize == null) {
            gridboxSize = 34;
        }
        this.level = level;

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
            this.spawnpoints = this.calculateMidGridPosition({row: this.spawnpoints.row, colum: this.spawnpoints.colum});
            for (let j = 0; j < this.level.enemies.length; j++) {
                this.level.enemies[j].calculateGridPosition2();
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

    // set all gridboxes paths to true
    setPaths(paths = [{row: 4, colum: 0}, {row:4, colum: 34}, {row:14, colum: 34}, {row:14, colum: 0}]) {
        // paths = it sets all gridboxes between the paths to true (gridbox -> gribox 2 -> gridbox 3, enz.)
        for (let i = 0; i < paths.length; i++) {
            this.grid[paths[i].row][paths[i].colum].isPath = true;
        }
        
        for (let index = 0; index < paths.length; index++) {
            if (index === paths.length - 1) {
                break;
            }
            let row = paths[index].row;
            let colum = paths[index].colum;
            let row2 = paths[index + 1].row;
            let colum2 = paths[index + 1].colum;
            if (row < row2) {
                for (let k = row; k < row2; k++) {
                    this.grid[k][colum].isPath = true;
                }
            } else {
                for (let k = row2; k < row; k++) {
                    this.grid[k][colum2].isPath = true;
                }
            }
            if (colum < colum2) {
                for (let k = colum; k < colum2; k++) {
                    this.grid[row][k].isPath = true;
                }
            } else {
                for (let k = colum2; k < colum; k++) {
                    this.grid[row2][k].isPath = true;
                }
            } 
        }
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
function map1(level, gridboxSize) {
    let map = new maps(level, gridboxSize);
    map.calculateCanvasSize(22, 47);

    map.grid[5][5].tower = new Tower("", map.grid[5][5].gridPosition);

    map.grid[15][5].tower = new Tower("", map.grid[15][5].gridPosition);

    map.grid[11][32].tower = new Tower("blue", map.grid[11][32].gridPosition);

    map.setPaths([{row: 4, colum: 0}, {row:4, colum: 34}, {row:14, colum: 34}, {row:14, colum: 0}]);

    map.spawnpoints = [map.calculateMidGridPosition({row: 4, colum: 0})];

    map.enemyMovementTargets = [[
        map.calculateMidGridPosition({row:4, colum: 34}),
        map.calculateMidGridPosition({row:14, colum: 34}),
        map.calculateMidGridPosition({row:14, colum: 0})
    ]];

    map.getTowers();

    return map;
}

//functie voor het aanmaken van map 2
function map2(gridboxSize) {
    let map = new maps(gridboxSize);
    map.calculateCanvasSize(22, 47);

    map.grid[6][8].tower = new Tower("green", map.grid[10][8].gridPosition);

    map.grid[10][26].tower = new Tower("green", map.grid[10][26].gridPosition);

    map.grid[16][34].tower = new Tower("green", map.grid[11][32].gridPosition);

    for (let test = 0; test < 25; test++) {
        map.grid[4][test].isPath = true;
    }
    for (let test = 0; test < 10; test++) {
        map.grid[test + 4][24].isPath = true;
    }
    for (let test = 24; test < 47; test++) {
        map.grid[14][test].isPath = true;
    }

    map.spawnpoint = map.calculateMidGridPosition({row: 4, colum: 0});

    map.enemyMovementTargets = [
        map.calculateMidGridPosition({row:4, colum: 24}),
        map.calculateMidGridPosition({row:14, colum: 24}),
        map.calculateMidGridPosition({row:14, colum: 46}),
    ];

    map.getTowers();
    map.enemies = [];

    return map;
}

//functie voor het aanmaken van map 3
function map3(gridboxSize) {
    let map = new maps(gridboxSize);
    map.calculateCanvasSize(22, 47);

    map.grid[6][8].tower = new Tower("red", map.grid[10][8].gridPosition);

    map.grid[12][22].tower = new Tower("red", map.grid[12][22].gridPosition);

    map.grid[16][34].tower = new Tower("red", map.grid[11][32].gridPosition);

    for (let test = 0; test < 25; test++) {
        map.grid[4][test].isPath = true;
    }
    for (let test = 0; test < 10; test++) {
        map.grid[test + 4][24].isPath = true;
    }
    for (let test = 24; test < 42; test++) {
        map.grid[14][test].isPath = true;
    }
    for (let test = 10; test < 18; test++) {
        map.grid[test + 4][41].isPath = true;
    }

    map.spawnpoint = map.calculateMidGridPosition({row: 4, colum: 0});

    map.enemyMovementTargets = [
        map.calculateMidGridPosition({row:4, colum: 24}),
        map.calculateMidGridPosition({row:14, colum: 24}),
        map.calculateMidGridPosition({row:14, colum: 41}),
        map.calculateMidGridPosition({row:21, colum: 41})
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
    paused = false;
    map = null;
    grid = [];
    towers = [];
    enemies = [];
    waves = [];

    score = 0;
    health = 10;
    money = 500;
    
    constructor(levelnr){
        this.setLevel(levelnr);
    }

    setLevel(levelnr){
        this.levelnr = levelnr;
        if (levelnr == 1) {
            this.health = 10;
            this.money = 500;
            this.map = map1(this, 34);
            this.grid = this.map.grid;
            this.towers = this.map.towers;

            this.waves = [
                new wave(1, this, [{type:"1", amount:3}]), 
                new wave(2, this, [{type:"1", amount:2}, {type:"2", amount:1}]),
                new wave(3, this, [{type:"1", amount:3}, {type:"2", amount:1}])
            ];       
        } else if (levelnr == 2){
            this.health = 15;
            this.money = 400;
            this.map = map2(this, 34);
            this.grid = this.map.grid;
            this.towers = this.map.towers;
            this.waves = [
                new wave(1, this, [{type:"1", amount:5}]), 
                new wave(2, this, [{type:"1", amount:6}, {type:"2", amount:2}]),
                new wave(3, this, [{type:"1", amount:8}, {type:"2", amount:4}])
            ]; 
        }  else if (levelnr == 3){
            this.health = 20;
            this.money = 200;
            this.map = map3(this, 34);
            this.grid = this.map.grid;
            this.towers = this.map.towers;
            this.waves = [
                new wave(1, this, [{type:"1", amount:8}]), 
                new wave(2, this, [{type:"1", amount:7}, {type:"2", amount:6}]),
                new wave(3, this, [{type:"1", amount:11}, {type:"2", amount:8}])
            ]; 
        }
    }
}

// ----------------- wave functions -------------------
class wave {
    wavenr = 1;
    started = false;
    waveReward = null;

    enemies = [];
    spawnpoints = [];
    enemyMovementTargets = [];

    map = null;
    grid = [];

    constructor(wavenr, level, enemies = []) {
        this.wavenr = wavenr;
        this.map = level.map;
        this.grid = this.map.grid;
        if (enemies !== null && enemies instanceof Array && enemies.length > 0) {
            this.enemies = this.addEnemies(enemies);
        }
        this.enemyMovementTargets = this.map.enemyMovementTargets;
        this.spawnpoints = this.map.spawnpoints;
    }

    setSpawnpoint(spawnpoint){
        // spawnpoint = {colum: colum, row: row}
        this.spawnpoints = [];
        this.spawnpoints.push(this.map.calculateMidGridPosition(spawnpoint));
    }

    addSpawnpoint(spawnpoint){
        // spawnpoint = {colum: colum, row: row}
        this.spawnpoints.push(this.map.calculateMidGridPosition(spawnpoint));
    }

    setEnemyMovementTargets(enemyMovementTargets, padindex = 0){
        // enemyMovementTargets = [{colum: colum, row: row}, {colum: colum, row: row}, {colum: colum, row: row}]
        this.enemyMovementTargets = [];
        enemyMovementTargets.forEach(element => {
            if (this.enemyMovementTargets[padindex] == undefined) {
                this.enemyMovementTargets[padindex] = [];
            }
            this.enemyMovementTargets[padindex].push(this.map.calculateMidGridPosition(element));
        });
    }

    addEnemyMovementTargets(enemyMovementTargets, padindex = 0){
        // enemyMovementTargets = [{colum: colum, row: row}, {colum: colum, row: row}, {colum: colum, row: row}]
        // padindex = het pad nummer (zodat je meerdere paden kan toevoegen)
        enemyMovementTargets.forEach(element => {
            if (this.enemyMovementTargets[padindex] == undefined) {
                this.enemyMovementTargets[padindex] = [];
            }
            this.enemyMovementTargets[padindex].push(this.map.calculateMidGridPosition(element));
        });
    }

    getpadindex(){
        // return de index van de laatste pad
        return this.enemyMovementTargets.length - 1;
    }

    setEnemies(enemies){
        // enemies = [{type: type, pathindex: pathindex}, {type: type, pathindex: pathindex}, {type: type, pathindex: pathindex}]
        // pathindex = de index van het pad die de enemie moet lopen, default = 0
        // amount = hoevaak de enemie moeten worden toegevoegd als je meerdere dezelfde enemies wil toevoegen, default = 1
        this.enemies = [];
        enemies.forEach(enemy => {
            if (enemy.pathindex == undefined) {
                enemy.pathindex = 0;
            }
            if (enemy.amount == undefined) {
                enemy.amount = 1;
            }
            for (let i = 0; i < enemy.amount; i++) {
                this.enemies.push({enemy: new Enemy(enemy.type, this.spawnpoints[enemy.pathindex])});
            }
            
        });
    }

    addEnemies(enemies){
        // enemies = [{type: type, pathindex: pathindex, amount: amount}, {type: type, pathindex: pathindex, amount: amount}, {type: type, pathindex: pathindex, amount: amount}]
        // pathindex = de index van het pad die de enemie moet lopen, default = 0
        // amount = hoevaak de enemie moeten worden toegevoegd als je meerdere dezelfde enemies wil toevoegen, default = 1
        enemies.forEach(enemy => {
            if (enemy.pathindex == undefined) {
                enemy.pathindex = 0;
            }
            if (enemy.amount == undefined) {
                enemy.amount = 1;
            }
            for (let i = 0; i < enemy.amount; i++) {
                this.enemies.push({enemy: new Enemy(enemy.type, this.spawnpoints[enemy.pathindex])});
            }
        });
    }

    setWaveReward(waveReward){
        this.waveReward = waveReward;
    }

    setStarted(started){
        this.started = started;
    }
}

