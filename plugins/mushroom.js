// mushroom is collectible that modifies the player/mob that collects it.
// yellow mushrooms speed you up
// red mushrooms slow you down
// blue mushrooms make you smaller
// purple mushrooms make you bigger

// collectibleOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     update: function, this is run every update cycle
//     kill: function, this is added to the sprite's onKilled signal
//     enablePhysics: boolean, true: sprite collides with other sprites
//     allowGravity: boolean, true: sprite falls with gravity
//     immovable: boolean, true: object will be fixed in place and cannot move
//     collideWorld: boolean, true: object will collide with the edges of the game
//     bounce: number, how elastic collisions with this object are
//
//  unique mushroomOption attributes:
//      color: string, determines sprite color and behavior
//          valid values: "red", "yellow", "blue", "purple"

var mushroomToyboxPlugin = {
 	name: "mushroom",
    toyboxType: "collectible",

 	preload: function(toyboxObject){
 		toyboxObject._game.load.spritesheet("smallMushrooms", "../../assets/sprites/smallMushroomsSheet.png", 16, 16);
        toyboxObject._game.load.audio("goodShroom", "../../assets/sfx/gem-3.wav");
        toyboxObject._game.load.audio("badShroom", "../../assets/sfx/chirp-2.wav");
 	},

    sfx: ["goodShroom", "badShroom"],

 	create: function(mushroomOptions){
    mushroomOptions = typeof (mushroomOptions) == "undefined" ? {} : mushroomOptions;

 		var randomizeShroom = function() {
            var probability = toybox.diceRoll(40);
            if (probability <= 10) {
                return "red";
            } else if (probability <= 20){
                return "yellow";
            } else if (probability <= 30){
                return "blue";
            } else {
                return "purple";
            }
        }

        mushroomOptions.color = mushroomOptions.color || randomizeShroom();
        mushroomOptions.spriteName = "smallMushrooms";
        mushroomOptions.name = mushroomOptions.color + "Mushroom";

        var tryGrowObject = function(mushroom, sprite2) {
    	    if ( sprite2.isPlayer() || sprite2.isMob() ) {
    	        if (sprite2.scale.x <= 3.0){
    	            var tempSize = Math.abs(sprite2.scale.x)
    	            var newSize = tempSize * 1.5;
                    Phaser.Math.clamp(newSize, 0.25, 5);
    	            var scaleBy = (newSize / tempSize);
    	            sprite2.scale.x *= scaleBy;
    	            sprite2.scale.y *= scaleBy;
    	        }
                this.toybox.sfx.goodShroom.play();
    	        mushroom.kill();
    	    }
    	}

    	var tryShrinkObject = function(mushroom, sprite2) {
    	    if ( sprite2.isPlayer() || sprite2.isMob() ) {
    	        if (sprite2.scale.x <= 3.0){
    	            var tempSize = Math.abs(sprite2.scale.x)
    	            var newSize = 0.5;
                    //Phaser.Math.clamp(newSize, 0.5, 5);
    	            var scaleBy = (newSize / tempSize);
    	            sprite2.scale.x *= scaleBy;
    	            sprite2.scale.y *= scaleBy;
    	        }
                this.toybox.sfx.badShroom.play();
    	        mushroom.kill();
    	    }
    	}

    	var trySpeedUpObject = function(mushroom, sprite2) {
    	    if ( sprite2.isPlayer() || sprite2.isMob() ) {
    	        sprite2.speed *= 1.5;
                Phaser.Math.clamp(sprite2.speed, 50, 300);
                this.toybox.sfx.goodShroom.play();
    	        mushroom.kill();
    	    }
    	}

    	var trySlowObject = function(mushroom, sprite2) {
    	    if ( sprite2.isPlayer() || sprite2.isMob() ) {
    	        sprite2.speed *= 0.5;
                Phaser.Math.clamp(sprite2.speed, 50, 250);
                this.toybox.sfx.badShroom.play();
    	        mushroom.kill();
    	    }
    	}

        switch (mushroomOptions.color){
            case "yellow":
                mushroomOptions.spriteIndex = 14;
                mushroomOptions.collide = trySpeedUpObject;
            break;
            case "red":
                mushroomOptions.spriteIndex = 11;
                mushroomOptions.collide = trySlowObject;
            break;
            case "blue":
                mushroomOptions.spriteIndex = 20;
                mushroomOptions.collide = tryShrinkObject;
            break;
            default:
                mushroomOptions.spriteIndex = 23;
                mushroomOptions.collide = tryGrowObject;
            break;
        }
        var mushroomGO = this.toybox.add.collectible(mushroomOptions);
        return mushroomGO;

 	}

};
