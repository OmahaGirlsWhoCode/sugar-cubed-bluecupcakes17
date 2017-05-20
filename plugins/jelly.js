// Jelly is an enemy/mob that ignores the player at first, but will chase after the nearest player after being hit.
// A jelly has 3 health, and after dying, creates three slimes in it's place if possible.
// green Jellys are the slowest, purple are the fastest.

// mobOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     allowGravity: boolean, true: sprite falls with gravity
//     immovable: boolean, true: object will be fixed in place and cannot move
//     bounce: number, how elastic collisions with this object are
//     facing: string ("left" or "right") determines the direction the sprite starts out facing.

// unique jellyOptions attributes
//      color: string, determines sprite color and speed
//          valid values: "yellow","red","blue","green","purple","black"

var jellyToyboxPlugin = {
 	name: "jelly",
    toyboxType: "mob",

 	preload: function(toyboxObject){
 		toyboxObject._game.load.spritesheet("greenJelly", "../../assets/sprites/greenJellySheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("redJelly", "../../assets/sprites/redJellySheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("blueJelly", "../../assets/sprites/blueJellySheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("yellowJelly", "../../assets/sprites/yellowJellySheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("purpleJelly", "../../assets/sprites/purpleJellySheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("blackJelly", "../../assets/sprites/blackJellySheet.png", 16, 16);
        toyboxObject._game.load.audio("jellyBump", "../../assets/sfx/goo-2.wav");
        toyboxObject._game.load.audio("jellyDie", "../../assets/sfx/goo-1.wav");
 	},

    sfx: ["jellyBump","jellyDie"],

 	create: function(jellyOptions){
    jellyOptions = typeof (jellyOptions) == "undefined" ? {} : jellyOptions;

        var validColors = ["yellow","red","blue","green","purple","black"];

        var randomizeJelly = function() {
            return validColors[Phaser.Math.between(0,(validColors.length - 1))];
        }
    
        if (typeof(jellyOptions.color) == "undefined" || validColors.indexOf(jellyOptions.color) == -1){
            jellyOptions.color = randomizeJelly();
        }

        switch (jellyOptions.color){
            case "yellow":
                jellyOptions.speed = 333;
            break;
            case "purple":
                jellyOptions.speed = 300;
            break;
            case "black":
                jellyOptions.speed = 266;
            break;
            case "red":
                jellyOptions.speed = 233;
            break;
            case "blue":
                jellyOptions.speed = 200;
            break;
            case "green":
            default:
                jellyOptions.speed = 166;
            break;
        }

        jellyOptions.name = jellyOptions.color + "Jelly";
        jellyOptions.spriteName = jellyOptions.color + "Jelly";

 		jellyOptions.allowGravity = true;

        var jellyUpdate = function(){
            if (this.body == null){
               return;
            }

            this.body.velocity.x *= 0.95;

            if(this.timeToMove && !this.isHit && (this.body.onFloor() || this.body.touching.down)){
                this.toybox.sfx.jellyBump.play();
                this.animations.play("idle");
                this.timeToMove = false;

                this.body.velocity.x = (this.speed * this.xDir);
                this.body.velocity.y = (this.speed * -1);
                var thisJelly = this;
                this.toybox.game.time.events.add(1000, function(){ thisJelly.timeToMove = true; }, this);
            }

            if (this.state == "calm"){

                if( this.x >= (this.toybox.game.width - (Math.abs(this.width) / 2) ) || (this.x <= (Math.abs(this.width) / 2) ) ){
                    this.turnAround();
                }

            } else if (this.state == "mad"){

                if (this.animations.name == "idle") {
                    this.animations.play("mad");
                }
            }

            var targetPoint = this.findTarget();

            if( typeof(targetPoint) == "undefined"){
                return
            } else if( (targetPoint.x < this.x && this.xDir == 1) || (targetPoint.x > this.x && this.xDir == -1) ){
                this.turnAround();
            }

        };

        jellyOptions.update = jellyUpdate;

        var jellyCollide = function(jelly, collidedSprite){
            if (jelly.state == "calm"){
                var horizDis = collidedSprite.x - jelly.x;
                var isBlocked = ((horizDis < 0 && jelly.xDir == -1) || (horizDis > 0 && jelly.xDir == 1));
                var jellyIsAbove = (jelly.y + jelly.height / 2) <= (collidedSprite.y - collidedSprite.height / 2);
                if (isBlocked && !jellyIsAbove) {
                    jelly.turnAround();
                }
            }

        }

        jellyOptions.collide = jellyCollide;

        var jellyKill = function(jelly){
            var maybePet = ( jelly.isMob() ) ? "slime" : "pet";
            if (typeof(this.toybox.loadedPlugins.slime) !== "undefined"){
                var slime1 = jelly.toybox.add[maybePet]({type: "slime", owner: jelly.owner, startingX: jelly.x - 4, startingY: jelly.y, color: jelly.color});
                slime1.body.velocity = new Phaser.Point(-100,100);
                var slime2 = jelly.toybox.add[maybePet]({type: "slime", owner: jelly.owner, startingX: jelly.x + 4, startingY: jelly.y, color: jelly.color});
                slime2.body.velocity = new Phaser.Point(100,100);
                var slime3 = jelly.toybox.add[maybePet]({type: "slime", owner: jelly.owner, startingX: jelly.x, startingY: jelly.y - 4, color: jelly.color});
                slime3.body.velocity = new Phaser.Point(0,100);
            }
        }

        jellyOptions.kill = jellyKill;

        var jellyGO = this.toybox.add.mob(jellyOptions);

        jellyGO.turnAround = function(){
            if (!this.canTurnAround){
                return;
            }
            this.xDir *= -1;
            this.canTurnAround = false;
            var thisJelly = this;
            this.toybox.game.time.events.add(1500, function(){ thisJelly.canTurnAround = true; }, this);
        }

        jellyGO.findTarget = function(){

            var target = new Phaser.Point(0,0);

            if (this.state == "calm"){

                target = (this.xDir < 0) ? new Phaser.Point(0,0) : new Phaser.Point(this.toybox.game.width,0);

            } else if (this.state == "mad"){

                var targetPlayer = this.toybox.players.children[0];

                for (var i = this.toybox.players.children.length - 1; i >= 0; i--) {
                    var newPlayer = this.toybox.players.children[i];
                    var targetDist = Math.sqrt((Math.abs(this.y - targetPlayer.y))^2 + (Math.abs(this.x - targetPlayer.x))^2);
                    var newDist = Math.sqrt((Math.abs(this.y - newPlayer.y))^2 + (Math.abs(this.x - newPlayer.x))^2);
                    if( newDist < targetDist ){
                        targetPlayer = newPlayer;
                    }
                }

                if (typeof(targetPlayer) == "undefined"){
                    return;
                }

                target = new Phaser.Point(targetPlayer.x, targetPlayer.y);
            }

            return target;

        }

        jellyGO.hit = function(){
            if (this.isHit){
                return;
            }
            this.isHit = true;
            this.health -= 1;
            for (var i = this.children.length - 1; i >= 0; i--) {
                this.children[i].drop();
            }
            this.toybox.sfx.jellyDie.play();
            var thisJelly = this;
            if (thisJelly.health <= 0){
                this.animations.play("die");
                this.toybox.game.time.events.add(1500, function(){ thisJelly.kill(); }, this);
            } else {
                thisJelly.animations.play("hit");
                this.toybox.game.time.events.add(1500, function(){
                    thisJelly.isHit = false;
                    if( this.isMob() ){
                        thisJelly.state = "mad";
                    }
                }, this);

            }
        }

        var fps = this.toybox.animationFPS / 2;
        jellyGO.animations.add("die", [0, 0, 6, 6]);
        jellyGO.animations.add("hit", [0, 0, 4, 4]);
        jellyGO.animations.add("mad", [5], fps, true);
        jellyGO.animations.add("idle", [1, 2, 3], fps, true);

        jellyGO.timeToMove = true;
        jellyGO.canTurnAround = true;
        jellyGO.isHit = false;
        jellyGO.health = 3;
        jellyGO.state = "calm";
        jellyGO.color = jellyOptions.color;
        jellyGO.xDir = (jellyOptions.facing == "right") ? -1 : 1 ;

        return jellyGO;
 	}

};
