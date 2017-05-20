// Platform is a block meant to provide large areas for players/mob to stand on.
// Because of Arcade physic, it is possible for objects to get pushed through platforms by other objects, however.

// blockOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     update: function, this is run every update cycle
//     collide: function, this is added to the sprite's onCollide signal
//
// unique platformOptions attributes:
//      type: number, 0-7, determines sprite appearance
//      width: number, determines the width of the lava sprite
//      height: number, determines the height of the lava sprite

var platformToyboxPlugin = {
 	name: "platform",
    toyboxType: "block",

 	preload: function(toyboxObject){
 		toyboxObject._game.load.spritesheet("platforms", "../../assets/sprites/platformSheet.png", 128, 16);
 		toyboxObject._game.load.spritesheet("poof", "../../assets/sprites/poofSheet.png", 16, 24);
 	},

 	create: function(platformOptions){
        platformOptions = typeof (platformOptions) == "undefined" ? {} : platformOptions;
    
        if (typeof(platformOptions.spriteName) == "undefined" || platformOptions.spriteName == "platforms"){
            platformOptions.spriteName = "platforms";
            if (typeof(platformOptions.type) != "number" || platformOptions.type > 7 || platformOptions.type < 0){
                platformOptions.type = Phaser.Math.between(0,7);
            }
            platformOptions.spriteIndex = platformOptions.type
            platformOptions.name = "type" + platformOptions.type + "Platform";
        } else {
            platformOptions.name = "customPlatform";
        }

     	platformOptions.allowGravity = false;
        platformOptions.immovable = true;

     	var platformKill = function(platform){
            var poofOptions = {
                startingX: platform.x,
                startingY: platform.y,
                spriteName: "poof",
                sendTo: "top"
            }
            var poofGO = this.toybox.add.decoration(poofOptions);
            poofGO.animations.add("poof", [0, 1, 2, 3], this.toybox.animationFPS, true);
            poofGO.animations.play("poof");
            this.game.time.events.add(250, function(){ poofGO.kill(); }, this);
        }

        platformOptions.kill = platformKill;

     	var platformGO = this.toybox.add.block(platformOptions);

        platformGO.width = platformOptions.width;
        platformGO.height = platformOptions.height;

     	return platformGO;
 	}

};
