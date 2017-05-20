// Fly is a mob/enemy that ignores gravity, and is attracted to the nearest player.
// Different colored flys have different speeds: yellow is the slowest, red is the fastest.
// Watch out for red flies!

// mobOptions attributes:
//     spriteName: string, name of spritesheet loaded in preload
//     spriteIndex: number, starting sprite in spritesheet
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     facing: string ("left" or "right") determines the direction the sprite starts out facing.
//
//  unique flyOptions attributes:
//      color: string, determines speed and sprite color
//          valid values: "yellow", "black", "red", "blue"


var flyToyboxPlugin = {
 	name: "fly",
    toyboxType: "mob",

 	preload: function(toyboxObject){
        toyboxObject._game.load.spritesheet("redFly", "../../assets/sprites/redFlySheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("blueFly", "../../assets/sprites/blueFlySheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("yellowFly", "../../assets/sprites/yellowFlySheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("blackFly", "../../assets/sprites/blackFlySheet.png", 16, 16);
        toyboxObject._game.load.audio("flyTurn", "../../assets/sfx/chirp-4.wav");
        toyboxObject._game.load.audio("flyDie", "../../assets/sfx/falling-1.wav");
 	},

    sfx: ["flyTurn","flyDie"],

 	create: function(flyOptions){
    flyOptions = typeof (flyOptions) == "undefined" ? {} : flyOptions;

        var validColors = ["yellow","red","blue","black"];

        var randomizeFly = function() {
            return validColors[Phaser.Math.between(0,(validColors.length - 1))];
        }

        if (typeof(flyOptions.color) == "undefined" || validColors.indexOf(flyOptions.color) == -1){
            flyOptions.color = randomizeFly();
        }
        flyOptions.name = flyOptions.color + "Fly";
        flyOptions.spriteName = flyOptions.color + "Fly";

 		flyOptions.allowGravity = false;

        switch (flyOptions.color){
            case "yellow":
                flyOptions.speed = 25;
            break;
            case "black":
                flyOptions.speed = 75;
            break;
            case "red":
                flyOptions.speed = 100;
            break;
            case "blue":
            default:
                flyOptions.speed = 50;
            break;
        }

        var flyUpdate = function(){
            if (this.body == null || this.isDead){
                return;
            }

            if (!this.isHit && !this.isDead){
               this.animations.play("idle");
            }

            var target = this.findTarget()

            if( (target.x < this.x && this.scale.x < 0) || (target.x > this.x && this.scale.x > 0) ){
                this.turnAround();
            }

            if (target.y < this.y && this.body.velocity.y > this.speed * -1){
               this.body.velocity.y--;
            } else if (target.y > this.y && this.body.velocity.y < this.speed) {
               this.body.velocity.y++;
            }

            if (this.scale.x > 0 && this.body.velocity.x > this.speed * -1){
               this.body.velocity.x--;
            } else if (this.scale.x < 0 && this.body.velocity.x < this.speed) {
               this.body.velocity.x++;
            }
        };

        flyOptions.update = flyUpdate;

        var flyGO = this.toybox.add.mob(flyOptions);

        flyGO.turnAround = function(){
            if (!this.canTurnAround || this.isDead){
                return;
            }
            this.scale.x *= -1;
            this.toybox.sfx.flyTurn.play();
            this.canTurnAround = false;
            var thisFly = this;
            this.toybox.game.time.events.add(500, function(){ thisFly.canTurnAround = true; }, this);
        }

        flyGO.findTarget = function(){

            var target = this.toybox.players.children[0];

            for (var i = this.toybox.players.children.length - 1; i >= 0; i--) {
                var newPlayer = this.toybox.players.children[i];
                var targetDist = Math.sqrt((Math.abs(this.y - target.y))^2 + (Math.abs(this.x - target.x))^2);
                var newDist = Math.sqrt((Math.abs(this.y - newPlayer.y))^2 + (Math.abs(this.x - newPlayer.x))^2);
                if( newDist < targetDist ){
                    target = new Phaser.Point( newPlayer.x, newPlayer.y);
                }
            }

            if (typeof(target) == "undefined"){
                target = new Phaser.Point(this.toybox.game.width / 2 , this.toybox.game.height / 2);
            }

            return target;

        }

        flyGO.hit = function(){
            if (this.isHit){
                return;
            }
            this.isHit = true;
            this.health -= 1;
            var thisFly = this;
            for (var i = this.children.length - 1; i >= 0; i--) {
                this.children[i].drop();
            }
            if (thisFly.health <= 0){
                this.animations.play("dead");
                this.isDead = true;
                this.body.velocity.y = 0;
                this.toybox.sfx.flyDie.play();
                this.body.allowGravity = true;
                this.toybox.game.time.events.add(1000, function(){
                    thisFly.kill();
                }, this);
            } else {
                this.toybox.game.time.events.add(500, function(){
                    thisFly.animations.play("idle");
                    thisFly.isHit = false;
                }, this);
            }
        }

        var fps = this.toybox.animationFPS;
        flyGO.animations.add("dead", [2]);
        flyGO.animations.add("idle", [0, 1], fps, true);

        flyGO.canTurnAround = true;
        flyGO.isHit = false;
        flyGO.isDead = false;
        flyGO.scale.x = (flyOptions.facing == "right") ? -1 : 1 ;

        return flyGO;
 	}

};
