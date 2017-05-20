// Fireball is a mob/enemy that ignores gravity and flies at 45deg angles until it hits a player or mob.
// It bounces of the sides of the game. It currently gets stuck sometimes with rows of blocks.
// tan fireballs are slowest, blue fireballs are fastest.

// mobOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     kill: function, this is added to the sprite's onKilled signal
//     facing: string ("left" or "right") determines the direction the sprite starts out facing.
//
//  unique fireballOptions attributes:
//      color: string, determines sprite color and speed;
//          valid values: "yellow","red","blue","green","purple","tan"

var fireballToyboxPlugin = {
 	name: "fireball",
    toyboxType: "mob",

 	preload: function(toyboxObject){
 		toyboxObject._game.load.spritesheet("fireballs", "../../assets/sprites/fireballsSheet.png", 16, 16);
        toyboxObject._game.load.audio("fireball", "../../assets/sfx/explosion-3.wav");
 	},

    sfx: ["fireball"],

 	create: function(fireballOptions){
    fireballOptions = typeof (fireballOptions) == "undefined" ? {} : fireballOptions;

        var validColors = ["yellow","red","blue","green","purple","tan"];

        var randomizeFireball = function() {
            return validColors[Phaser.Math.between(0,(validColors.length - 1))];
        }

        if (typeof(fireballOptions.color) == "undefined" || validColors.indexOf(fireballOptions.color) == -1){
            fireballOptions.color = randomizeFireball();
        }
        fireballOptions.name = fireballOptions.color + "Fireball";

        fireballOptions.spriteName = "fireballs";
 		fireballOptions.allowGravity = false;

        switch (fireballOptions.color){
            case "yellow":
                fireballOptions.spriteIndex = 20;
                fireballOptions.speed = 100;
            break;
            case "purple":
                fireballOptions.spriteIndex = 4;
                fireballOptions.speed = 200;
            break;
            case "tan":
                fireballOptions.spriteIndex = 8;
                fireballOptions.speed = 66;
            break;
            case "red":
                fireballOptions.spriteIndex = 0;
                fireballOptions.speed = 166;
            break;
            case "blue":
                fireballOptions.spriteIndex = 12;
                fireballOptions.speed = 233;
            break;
            case "green":
            default:
                fireballOptions.spriteIndex = 16;
                fireballOptions.speed = 133;
            break;
        }

        var fireballUpdate = function(){
            this.angle += 2;

            if (this.body == null){
                return
            }

            var touchSidesX = ( this.x >= (this.toybox.game.width - (Math.abs(this.width) / 2) ) || (this.x <= (Math.abs(this.width) / 2) ) );
            var touchSidesY = ( this.y >= (this.toybox.game.height - (Math.abs(this.height) / 2) ) || (this.y <= (Math.abs(this.height) / 2) ) );

            if( touchSidesY ){
                this.bump("y");
            }

            if( touchSidesX ){
                this.bump("x");
            }

            this.body.velocity.x = this.speed * this.xDir;
            this.body.velocity.y = this.speed * this.yDir;

        };

        fireballOptions.update = fireballUpdate;

        var fireballCollide = function(fireball, collidedSprite){
            var horizDis = Math.abs(collidedSprite.x - fireball.x);
            var vertDis = Math.abs(collidedSprite.y - fireball.y);

            if (horizDis < vertDis) {
                fireball.bump("x");
            } else if (horizDis > vertDis) {
                fireball.bump("y");
            }

            if (collidedSprite.isMob() || collidedSprite.isPlayer()){
                collidedSprite.hit();
                fireball.kill();
            }

        }

        fireballOptions.collide = fireballCollide;

        var fireballGO = this.toybox.add.mob(fireballOptions);

        fireballGO.bump = function(direction){
            if (this.wasBumped || (["x","y"].indexOf(direction) == -1)){
                return;
            }
            if (direction == "x"){
                this.xDir *= -1;
            } else {
                this.yDir *= -1;
            }
            this.wasBumped = true;
            direction *= -1;
            this.toybox.sfx.fireball.play();
            var thisFireball = this;
            this.toybox.game.time.events.add(250, function(){ thisFireball.wasBumped = false; }, this);

        }

        fireballGO.hit = function(){

        }

        var fps = this.toybox.animationFPS;
        var frame = fireballOptions.spriteIndex;
        fireballGO.animations.add("flicker", [frame, frame + 3, frame + 1, frame + 2], fps, true);
        fireballGO.animations.play("flicker");
        fireballGO.speed = fireballOptions.speed;

        fireballGO.xDir = (fireballOptions.facing == "right") ? 1 : -1 ;
        fireballGO.yDir = 1;
        fireballGO.wasBumped = false;

        return fireballGO;
 	}

};
