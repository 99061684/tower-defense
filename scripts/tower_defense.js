// drawing setup ------------------------------------------------------
const canvas = document.getElementById("myCanvas");
const healthSpan = document.getElementById("health");
const moneySpan = document.getElementById("money");
const scoreSpan = document.getElementById("score");
const c = canvas.getContext("2d");

var currentLevel = null; 
var enemy1 = null;
var updateAnimation = null;

// level scene -------------------------------------------------------

class Tower {
    //attack range circle
    range = 75;
    radiuscolor = "orange"; 
    radiusfill = true; //false = only outline, true = only fill

    gridPosition = {};
    target = [];
    maxTargetAmount = 1;
    targetType = "furthest path";
    timer = null;
    attackFunction = null;

    //tower
    shape = "rectangle"; 
    color = 'yellow';
    lineWidth = 5;
    damage = 10; //damage
    attackspeed = 1; //aantal seconden per aanval
    price = 100;
    constructor(type, gridPosition){
        this.setType(type);
        this.gridPosition = gridPosition;

        this.timer = null;
        this.attackFunction = null;
    }

    setType(type){
        if (type == "white") {
            this.range = 55;
            this.color = "white";
            this.radiuscolor = "orange";
            this.damage = 100;
            this.price = 250;
        } else if (type == "green"){
            this.range = 205;
            this.color = "green";
            this.radiuscolor = "orange";
            this.damage = 5;
            this.price = 75;
        } else if (type == "blue"){
            this.range = 105;
            this.color = "blue";
            this.radiuscolor = "green";
            this.damage = 15;
            this.price = 125;
        } else if (type == "red"){
            this.range = 30;
            this.color = "red";
            this.radiuscolor = "orange";
            this.damage = 200;
            this.price = 150;
        } else if (type == "black"){
            this.range = 155;
            this.color = "black";
            this.radiuscolor = "orange";
            this.damage = 50;
            this.price = 250;
        } else if (type == "cyan"){
            this.range = 80;
            this.color = "cyan";
            this.radiuscolor = "orange";
            this.damage = 75;
            this.price = 200;
        } else if (type == "pink"){
            this.range = 95;
            this.color = "pink";
            this.radiuscolor = "orange";
            this.damage = 50;
            this.price = 175;
        } else {
            this.range = 80;
            this.color = "yellow";
            this.radiuscolor = "orange";
            this.damage = 15;
            this.price = 100;
        }
    }

    //calculate the range of a tower with gridboxSize
    calculateRange(amountgridboxen){        
        return Math.round(currentLevel.map.gridboxWidth * amountgridboxen + currentLevel.map.gridboxHeight / 2);
    }

    getEnemiesInRange() {
        let enemiesInRange = [];
        for (let index = 0; index < currentLevel.enemies.length; index++) {
            let enemy = currentLevel.enemies[index];
            let checkDist = getDistance(enemy.pos.x, enemy.pos.y, currentLevel.grid[this.gridPosition["row"]][this.gridPosition["colum"]].x, currentLevel.grid[this.gridPosition["row"]][this.gridPosition["colum"]].y);

            if (checkDist < this.range) {
                enemiesInRange.push({"enemy": enemy, "distance": checkDist});
            } else {
                enemiesInRange.shift();
            }
        }
        return enemiesInRange;
    }

    getBestTargets() {
        let enemiesInRange = this.getEnemiesInRange();
        this.target = [];
        if (this.targetType == "shortest distance") {
            enemiesInRange.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
        } else if (this.targetType == "furthest distance") {
            enemiesInRange.sort((a, b) => (a.distance < b.distance) ? 1 : -1);
        } else if (this.targetType == "highest health") {
            enemiesInRange.sort((a, b) => (a.enemy.health > b.enemy.health) ? 1 : -1);
        } else if (this.targetType == "lowest health") {
            enemiesInRange.sort((a, b) => (a.enemy.health < b.enemy.health) ? 1 : -1);
        } else if (this.targetType == "random") {
            enemiesInRange = shuffleArray(enemiesInRange);
        } else if (this.targetType == "strongest") {
            enemiesInRange.sort((a, b) => (a.enemy.attack > b.enemy.attack) ? 1 : -1);
        } else if (this.targetType == "weakest") {
            enemiesInRange.sort((a, b) => (a.enemy.attack < b.enemy.attack) ? 1 : -1);
        } else if (this.targetType == "furthest path" && enemiesInRange.length > 0) {
            enemiesInRange.sort( function(a, b) {          
                if (a.enemy.targetnr === b.enemy.targetnr) {
                    return a.enemy.getDistanceToNextTarget() - b.enemy.getDistanceToNextTarget();
                }
                return a.enemy.targetnr > b.enemy.targetnr ? 1 : -1;
            });
        } else {
            enemiesInRange.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
        }

        if (enemiesInRange.length >= 1) {
            if (this.maxTargetAmount === 999) {
                for (let i = 0; i < enemiesInRange.length; i++) {
                    this.target.push(enemiesInRange[i]["enemy"]); 
                } 
            } else if (this.maxTargetAmount >= 1) {
                for (let i = 0; i < this.maxTargetAmount; i++) {
                    this.target.push(enemiesInRange[i]["enemy"]);
                } 
            }
        }
        return this.target;
    }

    attackBestTargets() {
        this.getBestTargets();    
        if(!currentLevel.paused && this.target.length > 0) {
            if (this.attackspeed < 0) {
                this.attackspeed = 1;
            }
            if (this.timer == null) {
                this.getBestTargets().forEach(element => {
                    element.setNewHealth(-this.damage);
                });
                this.timer = setInterval(() => {
                    if (!currentLevel.paused && this.target.length > 0) {
                        this.getBestTargets().forEach(element => {
                            element.setNewHealth(-this.damage);
                        });
                    } else {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                }, this.attackspeed * 1000);
            }
        } 
        if (currentLevel.paused && this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }    
}

class Enemy {
    color = 'blue';
    radius = 5;
    
    //drawing and movement variables
    pos = {x: 0, y: 0, row: 0, colum: 0};
    vel = {velX:0, velY:0};
    target = {targetnr:0, x:0, y:0};
    point = {pointLength:20, px:0, py:0};
    timer = null;
    attackFunction = null;
    dieAfterAttack = true;

    //enemy stats
    max_health = 100;
    health = 100;
    attack = 1;
    attackspeed = 1; //aantal seconden per aanval
    speed = 3;
    killReward = 10;
    scoreReward = 1;
    constructor(type, pos){
        this.pos = pos;
        this.setType(type);
    }

    setType(type){
        if (type == "purple") {
            this.radius = 20;
            this.color = "purple";
            this.max_health = 150;
            this.attack = 1;
            this.speed = 100;
        }
        else if(type == "yellow") {
            this.radius = 20;
            this.color = "yellow";
            this.max_health = 2000;
            this.attack = 1;
            this.speed = 10;
        }
        else if(type == "green") {
            this.radius = 20;
            this.color = "green";
            this.max_health = 250;
            this.attack = 1;
            this.speed = 25;
        }
        else if(type == "blue") {
            this.radius = 20;
            this.color = "blue";
            this.max_health = 500;
            this.attack = 1;
            this.speed = 25;
        }
        else if(type == "gray") {
            this.radius = 20;
            this.color = "gray";
            this.max_health = 1000;
            this.attack = 1;
            this.speed = 50;
        }
        else if(type == "black") {
            this.radius = 20;
            this.color = "black";
            this.max_health = 500;
            this.attack = 1;
            this.speed = 50;
        }
        else if(type == "white") {
            this.radius = 20;
            this.color = "white";
            this.max_health = 1000;
            this.attack = 1;
            this.speed = 25;
        }
        else {
            this.radius = 20;
            this.color = "lime";
            this.max_health = 20;
            this.attack = 1;
            this.speed = 10;
        }
    }

    setNewHealth(amount) {
        if ((this.health + amount) > 0) {
            this.health = this.health + amount;
        } else {
            this.health = 0;
            this.die();
        }
    }

    drawHealthBar() {
        this.progressBar = new progressBar({x: this.pos.x - this.radius * 1.5, y: this.pos.y - this.radius, width: 50, height: 5}, "green", (this.health * 100) / this.max_health, true);
        this.progressBar.draw();
    }

    update() {
        // get the target x and y
        if (this.target.targetnr < currentLevel.map.enemyMovementTargets.length) {
            this.target.x = currentLevel.map.enemyMovementTargets[this.target.targetnr].x;
            this.target.y = currentLevel.map.enemyMovementTargets[this.target.targetnr].y;
        
            // get the distance
            var tx = this.target.x - this.pos.x;
            var ty = this.target.y - this.pos.y;
            var dist = Math.sqrt(tx * tx + ty * ty);
            
            //get the velocity
            this.vel.velX = (tx / dist) * this.speed;
            this.vel.velY = (ty / dist) * this.speed;
            
            
            //Get the direction we are facing
            var radians = Math.atan2(-ty,-tx);
            
            this.point.px = this.x - this.point.pointLength * Math.cos(radians);
            this.point.py = this.y - this.point.pointLength * Math.sin(radians);
        }
    
        // Once we hit our target move on to the next. 
        if (dist > this.radius/2) {
            // add our velocities
            this.pos.x += this.vel.velX;
            this.pos.y += this.vel.velY;
            this.calculateGridPosition();
        }else{
            if(this.target.targetnr != currentLevel.map.enemyMovementTargets.length){
                this.target.targetnr++;
            } 
            
            if(this.target.targetnr == currentLevel.map.enemyMovementTargets.length){
                this.attacking();
            }         
        }
    };
    
    render() {
        this.point.px = this.pos.x - this.point.pointLength * Math.cos(this.radius);
        this.point.py = this.pos.y - this.point.pointLength * Math.sin(this.radius);
        c.fillStyle = this.color;
        c.beginPath();
        // draw our circle with x and y being the center
        c.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        c.closePath();
        c.fill();
        
        c.strokeStyle = "rgb(0,0,255)";
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(this.point.px, this.point.py);
        c.closePath();
        c.stroke();
    };

    attacking(){
        if (this.dieAfterAttack) {
            if ((currentLevel.health - this.attack) >= 0) {
                currentLevel.health = currentLevel.health - this.attack;
            } else {
                currentLevel.health = 0;
            }  
            this.die();
        } else {
            if(!currentLevel.paused) {
                if (this.attackspeed < 1) {
                    this.attackspeed = 1;
                }
                this.attackFunction = () => {
                    if (!currentLevel.paused && currentLevel.health > 0) { 
                        if ((currentLevel.health - this.attack) >= 0) {
                            currentLevel.health = currentLevel.health - this.attack;
                        } else {
                            currentLevel.health = 0;
                        }   
        
                        this.timer = setTimeout(this.attackFunction, this.attackspeed * 1000);
                    } else {
                        clearTimeout(this.timer);
                    }
                };
                if (this.timer == null) {
                    this.timer = setTimeout(this.attackFunction, 0);
                }
            } else {
                clearTimeout(this.timer);
                this.timer = null;
            }
        }
    }

    static getEnemyWithHighestTargetnr(enemies){
        var highestTargetnr = -1;
        var enemyWithHighestTargetnr = null;
        for (var i = 0; i < enemies.length; i++) {
            if(enemies[i]["enemy"].target.targetnr > highestTargetnr){
                highestTargetnr = enemies[i]["enemy"].target.targetnr;
                enemyWithHighestTargetnr = enemies[i];
            } else if(enemies[i]["enemy"].target.targetnr == highestTargetnr) {
                if(enemies[i]["distance"] < enemyWithHighestTargetnr["enemy"]["distance"]){
                    highestTargetnr = enemies[i]["enemy"].target.targetnr;
                    enemyWithHighestTargetnr = enemies[i];
                }
            }
        }
        return enemyWithHighestTargetnr;
    }

    //calculate GridPosition of a enemy with gridboxSize
    calculateGridPosition(){  
        let row = 0;
        let colum = 0;
        if (this.pos.y !== 0) {
            row = Math.round(this.pos.y / currentLevel.map.gridboxHeight);
        } 
        if (this.pos.x !== 0) {
            colum = Math.round(this.pos.x / currentLevel.map.gridboxWidth);
        }
        this.pos.row = row;
        this.pos.colum = colum;
    }

    //calculate GridPosition of a enemy with gridboxSize
    calculateGridPosition2(){          
        let y = Math.round(this.pos.row * currentLevel.map.gridboxHeight - currentLevel.map.gridboxHeight/2);
        let x = Math.round(this.pos.colum * currentLevel.map.gridboxWidth - currentLevel.map.gridboxWidth/2);
        
        this.pos.y = y;
        this.pos.x = x;
    }

    //get the distance to next target
    getDistanceToTarget(targetnr){
        var tx = currentLevel.map.enemyMovementTargets[targetnr].x - this.pos.x;
        var ty = currentLevel.map.enemyMovementTargets[targetnr].y - this.pos.y;
        var distance = Math.sqrt(tx * tx + ty * ty);
        return distance;
    }

    //get the distance to next target
    getDistanceToNextTarget(){
        var tx = currentLevel.map.enemyMovementTargets[this.target.targetnr].x - this.pos.x;
        var ty = currentLevel.map.enemyMovementTargets[this.target.targetnr].y - this.pos.y;
        var distance = Math.sqrt(tx * tx + ty * ty);
        return distance;
    }

    die() {
        currentLevel.score = currentLevel.score + this.scoreReward;
        currentLevel.money = currentLevel.money + this.killReward;
        currentLevel.enemies.splice(currentLevel.enemies.indexOf(this), 1);
    }
}

class progressBar {
    wholeprogressbar = true;
    constructor(dimension, color, percentage, wholeprogressbar = true){
      ({x: this.x, y: this.y, width: this.w, height: this.h} = dimension);
      this.color = color;
      this.percentage = percentage / 100;
      this.p;
      this.wholeprogressbar = wholeprogressbar;
    }
    
    static clear(){
      c.clearRect(0, 0, canvasWidth, canvasHeight);  
    }
    
    draw(){
      // Visualize -------
      this.visualize();
      // -----------------
      this.p = this.percentage * this.w;
      if(this.p <= this.h){
        c.beginPath();
        c.arc(this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, Math.PI - Math.acos((this.h - this.p) / this.h), Math.PI + Math.acos((this.h - this.p) / this.h));
        c.save();
        c.scale(-1, 1);
        c.arc((this.h / 2) - this.p - this.x, this.h / 2 + this.y, this.h / 2, Math.PI - Math.acos((this.h - this.p) / this.h), Math.PI + Math.acos((this.h - this.p) / this.h));
        c.restore();
        c.closePath();
      } else {
        c.beginPath();
        c.arc(this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, Math.PI / 2, 3 / 2 *Math.PI);
        c.lineTo(this.p - this.h + this.x, 0 + this.y);
        c.arc(this.p - (this.h / 2) + this.x, this.h / 2 + this.y, this.h / 2, 3 / 2 * Math.PI, Math.PI / 2);
        c.lineTo(this.h / 2 + this.x, this.h + this.y);
        c.closePath();
      }
      c.fillStyle = this.color;
      c.fill();
    }
    
    visualize(){
      if (this.wholeprogressbar === true){
        this.showWholeProgressBar();
      }
    }
  
    showWholeProgressBar(){
      c.beginPath();
      c.arc(this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, Math.PI / 2, 3 / 2 * Math.PI);
      c.lineTo(this.w - this.h + this.x, 0 + this.y);
      c.arc(this.w - this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, 3 / 2 *Math.PI, Math.PI / 2);
      c.lineTo(this.h / 2 + this.x, this.h + this.y);
      c.strokeStyle = '#000000';
      c.stroke();
      c.closePath();
      c.fillStyle = "red";
      c.fill();
    }
    
    get PPercentage(){
      return this.percentage * 100;
    }
    
    set PPercentage(x){
      this.percentage = x / 100;
    }
    
}

class gridBox {
    borderColor = "black";
    defaultFillColor = "white";
    lineheight = 5;
    isPath = false;
    tower = null;
    isHover = false;
    gridPosition = {};
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.calculateGridPosition();        
    }

    calculateGridPosition(){
        let Gridcolom = 0;
        let Gridrow = 0;
        if (this.x !== 0) {
            Gridcolom = (this.x / this.width);
        }
        if (this.y !== 0) {
            Gridrow = (this.y / this.height);
        }
        
        this.gridPosition = {colum: Gridcolom, row: Gridrow};
    }
}

// startgame -------------------------------------------------------
function startgame(selectedLevel = 1) {
    if (selectedLevel == null) {
        selectedLevel = 1;
    } 
    if (selectedLevel == "restart" && currentLevel !== null && currentLevel.levelnr !== null) {
        currentLevel = new level(currentLevel.levelnr);
        currentLevel.paused = false;
        setupScene();
    } else if(selectedLevel == 69) {
        level69();
    } else {
        currentLevel = new level(selectedLevel);
        currentLevel.paused = false;
        if (updateAnimation !== null) {
            window.cancelAnimationFrame(updateAnimation);
        }
        setupScene();
        update();
    }
}

// setupScene -------------------------------------------------------

function setupScene() {   
    document.getElementById("mapSizeSlider").value = currentLevel.map.gridboxWidth;
}

// win -------------------------------------------------------

function levelCompleted() {   
    currentLevel.paused = true;
    alert("level completed");
}

function gameOver() {   
    // setupScene();
    currentLevel.paused = true;
    var myWindow = window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "", "fullscreen=yes");
    alert("Game Over");
}

function level69() {   
    var myWindow = window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "", "fullscreen=yes");
    alert("Pranked! LOL (-:");
}

// draw -------------------------------------------------------

function draw() 
{
    c.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    currentLevel.enemies.forEach(element => {
        element.render();
    });
}

// --- collision handling -------------------------------------------------------


// simulation -------------------------------------------------------

function simulate() 
{
    
}

// ---------------------------------------------------------------

function update() {
    if (currentLevel.enemies.length == 0) {
        // spawnEnemyDistance(3, 100);
    }
    simulate();
    draw();
    currentLevel.towers.forEach(element => {
        element.attackBestTargets();
    }); 
    currentLevel.enemies.forEach(element => {
        element.update();
        element.drawHealthBar();
    });   

    scoreSpan.innerHTML = currentLevel.score.toString();
    moneySpan.innerHTML = currentLevel.money.toString();
    healthSpan.innerHTML = currentLevel.health.toString();
    
    if (canvas.height !== currentLevel.map.canvasHeight) {
        canvas.height = currentLevel.map.canvasHeight;
    }
    if (canvas.width !== currentLevel.map.canvasWidth) {
        canvas.width = currentLevel.map.canvasWidth;	
    }    

    if (currentLevel.health <= 0) {
        gameOver();     
    }
    if(!currentLevel.paused){
        updateAnimation = requestAnimationFrame(update);
    }
}

// ------------------------ user interaction ---------------------------
canvas.addEventListener('mousemove', onMouseMove, false);
canvas.addEventListener("mousedown", onMouseDown, false);
document.getElementById("mapSizeSlider").oninput = function() {
    currentLevel.map.setGridboxSize(this.value);
};

// canvas.addEventListener("mouseenter", function () {
//     if(currentLevel.paused){
//         currentLevel.paused = false;
//         update();  
//     }
// });

// canvas.addEventListener("mouseleave", function () {
//     currentLevel.paused = true;
// });

function onMouseDown(event) {
    if (typeof currentLevel.grid[Math.floor(event.offsetY / currentLevel.map.gridboxHeight)] !== "undefined" && typeof currentLevel.grid[Math.floor(event.offsetY / currentLevel.map.gridboxHeight)][Math.floor(event.offsetX / currentLevel.map.gridboxWidth)] !== "undefined") {
        let gridbox = currentLevel.grid[Math.floor(event.offsetY / currentLevel.map.gridboxHeight)][Math.floor(event.offsetX / currentLevel.map.gridboxWidth)];

        if (event.button == 0) {
            if (!gridbox.isPath && gridbox.tower == null && currentLevel.money > new Tower("", gridbox.gridPosition).price) {
                gridbox.tower = new Tower("", gridbox.gridPosition);
                gridbox.isHover = true;
                updateMoney(-gridbox.tower.price);
            } else if(!gridbox.isPath && gridbox.tower !== null) {
                updateMoney(gridbox.tower.price);
                gridbox.tower = null;
                gridbox.isHover = false;
            }
        } 
    }
}

function onMouseMove(event) {
    if (typeof currentLevel.grid[Math.floor(event.offsetY / currentLevel.map.gridboxHeight)] !== "undefined" && typeof currentLevel.grid[Math.floor(event.offsetY / currentLevel.map.gridboxHeight)][Math.floor(event.offsetX / currentLevel.map.gridboxWidth)] !== "undefined") {
        let gridbox = currentLevel.grid[Math.floor(event.offsetY / currentLevel.map.gridboxHeight)][Math.floor(event.offsetX / currentLevel.map.gridboxWidth)];
        
        if (gridbox.tower !== null) {
            gridbox.isHover = true;
        } else { 
            gridbox.isHover = false;
        }
    }
}	

// -----------------draw grid functions -------------

function drawGrid(){
    //draw all cells
    for(var row = 0; row < currentLevel.map.NumberOfRow; row++){
        for(var col = 0; col < currentLevel.map.NumberOfCol; col++){
            drawGridFill(currentLevel.grid[row][col]);        
        }
    }
    //draw all tower
    for(var row = 0; row < currentLevel.map.NumberOfRow; row++){
        for(var col = 0; col < currentLevel.map.NumberOfCol; col++){
        if(currentLevel.grid[row][col].tower != null)
            drawGridFill(currentLevel.grid[row][col]);             
        }
    }
}

function drawGridFill(gridcolum){
    if(gridcolum.isPath && gridcolum.tower == null){  
        c.fillStyle = "rgba(69,14,14,0.5)";
        c.fillRect(gridcolum.x, gridcolum.y, gridcolum.width, gridcolum.height);   
    }
    else if(gridcolum.tower != null){
            //Draw range
            if(gridcolum.isHover){
                c.beginPath();
                c.arc((gridcolum.x + (gridcolum.width / 2)), (gridcolum.y + (gridcolum.height / 2)), gridcolum.tower.range, (2 * Math.PI), 0, false);
                if (gridcolum.tower.radiusfill) {
                    c.fillStyle = gridcolum.tower.radiuscolor;
                    c.fill();
                } else {
                    c.strokeStyle = gridcolum.tower.radiuscolor;
                    c.lineWidth = gridcolum.tower.lineWidth;
                    c.stroke();
                }
            }
            //Draw the tower
            c.fillStyle = gridcolum.tower.color;
            if (gridcolum.tower.shape == "circle") {
                c.beginPath();
                c.arc((gridcolum.x + (gridcolum.width / 2)), (gridcolum.y + (gridcolum.height / 2)), (gridcolum.width / 2), 0, 2 * Math.PI, false);
                c.fill();
            } else {
                c.fillRect(gridcolum.x, gridcolum.y, gridcolum.width, gridcolum.height);
            }
    }
    else{
        //Draw the normal cell
        c.beginPath();
            c.fillStyle = gridcolum.defaultFillColor;
            c.lineWidth = 3;
            c.strokeStyle = gridcolum.borderColor;
            c.rect(gridcolum.x, gridcolum.y, gridcolum.width, gridcolum.height);
            c.fill();
            c.stroke();
        c.closePath();
    }
}

function getDistance(x,y,x1,y1){
    return Math.sqrt((Math.pow(x1-x,2))+(Math.pow(y1-y,2)));
}

// ----------------- money functions -------------

function updateMoney(amount) {
    currentLevel.money = currentLevel.money + amount;
}   

//---------------- spawn functions -------------

//spawn enemy every second
function spawnEnemy(amount){
    if(currentLevel.paused){
        return;
    }
    if(currentLevel.enemies.length < currentLevel.maxEnemies && currentLevel.enemies.length < amount && amount > 0){
        let enemy = new Enemy("", currentLevel.map.calculateMidGridPosition({row:4, colum: 0}));
        currentLevel.enemies.push(enemy);
        setTimeout(spawnEnemy, 500, amount--);
    }
}

//spawn enemy every second when distance between enemies is less then 1000
function spawnEnemyDistance(enemyType, amount, mindistance){
    //stop met spawnen als level is paused of als er al max enemies zijn
    if(currentLevel.paused || currentLevel.enemies.length > currentLevel.maxEnemies){
        return;
    }
    let distance = null;
    if(typeof enemyType !== 'string') {
        enemyType = "";	
    }
    
    if(currentLevel.enemies.length > 0){ //pakt de distance van de laatste enemy
        let temp = getCurrentLevelEnemiesSortByFurthest();
        distance = getDistance(temp[temp.length - 1]["enemy"].pos.x, temp[temp.length - 1]["enemy"].pos.y, currentLevel.map.spawnpoint.x, currentLevel.map.spawnpoint.y);
    } else { //distance is true wanneer er geen enemies in het level zijn.
        distance = true;
    }

    if (amount <= 0 || amount == null || distance === null) {
        return;
    } else if (distance >= mindistance || distance === true) {
        let enemy = new Enemy(enemyType, {x: currentLevel.map.spawnpoint.x, y: currentLevel.map.spawnpoint.y, row: currentLevel.map.spawnpoint.row, colum: currentLevel.map.spawnpoint.colum});
        currentLevel.enemies.push(enemy);
        amount--;
    }
    if (amount > 0) {
        setTimeout(spawnEnemyDistance, 0, amount, mindistance);
    }    
}

//---------------- help functions -------------
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getCurrentLevelEnemiesSortByFurthest() {
    let array = [];
    for(var i = 0; i < currentLevel.enemies.length; i++){
        array.push({enemy: currentLevel.enemies[i], DistanceToNextTarget: currentLevel.enemies[i].getDistanceToNextTarget()});
    }
    array.sort( function(a, b) {          
        if (a.enemy.targetnr === b.enemy.targetnr) {
            return a.DistanceToNextTarget - b.DistanceToNextTarget;
        }
        return a.enemy.targetnr > b.enemy.targetnr ? 1 : -1;
    });
    return array;
}
