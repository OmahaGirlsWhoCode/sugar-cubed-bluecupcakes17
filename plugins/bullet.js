// Bullet is a gravity-less mob/enemy that can be given a x/y velocity, and ignores the walls of the game.
// It will fly until it leaves the screen or collides with another object.

// mobOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     kill: function, this is added to the sprite's onKilled signal
//
// unique bulletOptions attributes:
//      speedVector: phaser Point object, represents the speed of the bullet in x,y form
//      spriteName: string, optionally use a non-default preloaded sprite
//      hitPlayers: boolean, true: this bullet object will hit player objects
//      hitMobs: boolean, true: this bullet object will hit mob objects

var bulletToyboxPlugin = {
 	name: "bullet",
    toyboxType: "mob",

 	preload: function(toyboxObject){
 		toyboxObject._game.load.spritesheet("bullet", "../../assets/sprites/single-images/orb.png", 8, 8);
        toyboxObject._game.load.audio("bulletFire", "../../assets/sfx/zap-2.wav");
        toyboxObject._game.load.audio("bulletHit", "../../assets/sfx/explosion-2.wav");
 	},

    sfx: ["bulletFire","bulletHit"],

 	create: function(bulletOptions){

        bulletOptions.name = "bullet";

        bulletOptions.spriteName = bulletOptions.spriteName || "bullet";
 		bulletOptions.allowGravity = false;
        bulletOptions.collideWorld = false;

        var bulletUpdate = function(){

            if (this.body == null){
                return
            }

            var outsideX = ( Math.abs( this.x - (this.toybox.game.width / 2)) > (this.toybox.game.width / 2) + (this.width / 2) );
            var outsideY = ( Math.abs( this.y - (this.toybox.game.height / 2)) > (this.toybox.game.height / 2) + (this.height / 2) );

            if (outsideX || outsideY){
                this.kill();
            };

            this.body.velocity = this.speedVector;

        };

        bulletOptions.update = bulletUpdate;

        var bulletCollide = function(bullet, collidedSprite){

            if ((collidedSprite.isMob() && bullet.hitMobs) || (collidedSprite.isPlayer() && bullet.hitPlayers)){
                collidedSprite.hit();
            }
            this.toybox.sfx.bulletHit.play();
            bullet.kill();

        }

        bulletOptions.collide = bulletCollide;

        var bulletGO = this.toybox.add.mob(bulletOptions);
        bulletGO.toybox.sfx.bulletFire.play();
        bulletGO.hit = function(){}
        bulletGO.speedVector = bulletOptions.speedVector;
        bulletGO.hitPlayers = (typeof(bulletOptions.hitPlayers) != "undefined") ? bulletOptions.hitPlayers: true;
        bulletGO.hitMobs = (typeof(bulletOptions.hitMobs) != "undefined") ? bulletOptions.hitMobs: true;
        bulletGO.health = 0;

        return bulletGO;
 	}

};
