
let gameScene = new Phaser.Scene('Game');

let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    scene: gameScene
};

let game = new Phaser.Game(config);
 const enemyMinY = 80;
 const enemyMaxY = 280;

gameScene.init = function() {
    this.playerSpeed = 2;

    this.enemyMinSpeed = 1;
    this.emenyMaxSpeed = 3;
    this.isGameOver = false;
}


gameScene.preload = function() {
    this.load.image('backgroundImage', 'assets/background.png');
    this.load.image('playerImage', 'assets/player.png');
    this.load.image('dragonImage', 'assets/dragon.png');
    this.load.image('goalImage', 'assets/treasure.png');
};

gameScene.create = function() {


    let backgroundSprite =   this.add.sprite(0,0, 'backgroundImage');
    backgroundSprite.setOrigin(0,0);

    this.playerSprite = this.add.sprite(40,this.sys.game.config.height / 2, 'playerImage');
    this.playerSprite.setScale(0.5);

    this.goalSprite = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'goalImage');
    this.goalSprite.setScale(0.5);

    this.enemySprites = this.add.group({
        key: 'dragonImage',
        repeat: 4,
        setXY: {
            x: 90,
            y: 100,
            stepX: 100,
            stepY: 20
        }
    });
    Phaser.Actions.ScaleXY(this.enemySprites.getChildren(), -0.5, -0.5);
    Phaser.Actions.Call(this.enemySprites.getChildren(), function(enemySprite) {
        const randomDirection = Math.random() < .5 ? 1 : -1;
        const randomSpeed = this.enemyMinSpeed + Math.random() * (this.emenyMaxSpeed - this.enemyMinSpeed);

        enemySprite.flipX = true;
        enemySprite.speed = randomDirection * randomSpeed;
    }, this);
};


gameScene.update = function() {
    if(this.isGameOver) return;
    characterMovement(this.input, this.playerSprite, this.playerSpeed);

    let playerBoundary = this.playerSprite.getBounds();
    let goalBoundary = this.goalSprite.getBounds();
    
    const enemies = this.enemySprites.getChildren();
    enemyBehaviours(enemies, playerBoundary, this);

    if(checkBoundary(playerBoundary, goalBoundary)) {
        this.gameOver();
    };

   

};

gameScene.gameOver = function() {
    this.isGameOver = true;
    this.cameras.main.shake(500);

    this.cameras.main.on('camerashakecomplete', function() {
        this.cameras.main.fade(500);
    }, this);

    this.cameras.main.on('camerafadeoutcomplete', function() {
        this.scene.restart();
    }, this);

}


characterMovement = function(input, player, speed) {
    if(input.activePointer.isDown) {
        player.x += speed;
    }
};

checkBoundary = function(sprite1, sprite2) {
    if(Phaser.Geom.Intersects.RectangleToRectangle(sprite1, sprite2)) {
        return true
    } else {
        return false
    }
};

enemyBehaviours = function(enemies, player, game) {
    enemies.forEach(enemy => {
        let enemyBoundary = enemy.getBounds();
        enemy.y += enemy.speed;

        let setUp = enemy.speed < 0 && enemy.y <= enemyMinY
        let setDown = enemy.speed > 0 && enemy.y >= enemyMaxY
    
        if(setUp || setDown) {
            enemy.speed *= -1;
        };
        if(checkBoundary(player, enemyBoundary)) {
            game.gameOver()
        };    
    });
}


