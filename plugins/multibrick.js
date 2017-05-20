// multibrick is a multi-purpose block!
// If a player/mob hits a multibrick from the underside, it hits any player/mob on top!
// "normal" or "striped" multibricks serve no other function, but "coin," "mushroom," and "pow" bricks do other stuff too
// "coin" bricks create a random coin above when hit
// "mushroom" bricks create a random mushroom above when hit
// "pow" bricks hit all players/mobs except the player that hit the pow brick.

// blockOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//
// unique multibrickOptions attributes:
//      color: string, determines sprite color
//          valid values: orange, yellow, green, blue, grey, random
//		type: string, determines block behavior
//          valid values: normal, coin, mushroom, pow, striped, random
//      resetTimer: number, determines how many milliseconds before a non-normal block resets.


var multibrickToyboxPlugin = {
 	name: "multibrick",
    toyboxType: "block",

 	preload: function(toyboxObject){
 		toyboxObject._game.load.spritesheet("multibrick", "../../assets/sprites/multibrickSheet.png", 16, 16);
 		toyboxObject._game.load.audio("multibrickBump", "../../assets/sfx/impact-1.wav");
        toyboxObject._game.load.audio("multibrickPow", "../../assets/sfx/explosion-1.wav");
 	},

 	sfx: ["multibrickBump","multibrickPow"],

 	create: function(multibrickOptions){
    multibrickOptions = typeof (multibrickOptions) == "undefined" ? {} : multibrickOptions;
    
 		multibrickOptions.spriteName = "multibrick";
        multibrickOptions.allowGravity = false;
        multibrickOptions.immovable = true;

        var validColors = ["yellow","orange","blue","green","gray"];

        var randomizer = function(array) {
            return array[Phaser.Math.between(0,(array.length - 1))];
        }

        if (typeof(multibrickOptions.color) == "undefined" || validColors.indexOf(multibrickOptions.color) == -1 || multibrickOptions.color == "random"){
            multibrickOptions.color = randomizer(validColors);
        }

        switch (multibrickOptions.color){
            case "yellow":
                multibrickOptions.baseSpriteIndex = 12;
            break;
            case "green":
                multibrickOptions.baseSpriteIndex = 24;
            break;
            case "orange":
                multibrickOptions.baseSpriteIndex = 0;
            break;
            case "blue":
                multibrickOptions.baseSpriteIndex = 36;
            break;
            case "gray":
            default:
                multibrickOptions.baseSpriteIndex = 48;
            break;
        }

        var validTypes = ["normal","coin","mushroom","pow","striped"];

        if (multibrickOptions.type == "random"){
            multibrickOptions.type = randomizer(validTypes);
        } else if ( typeof(multibrickOptions.type) == "undefined" || validTypes.indexOf(multibrickOptions.type) == -1 ) {
            multibrickOptions.type = "normal"
        }

        var noCoins = (typeof(this.toybox.loadedPlugins.coin) == "undefined")
        var noMushrooms = (typeof(this.toybox.loadedPlugins.mushroom) == "undefined")

        if (( noCoins && (multibrickOptions.type == "coin")) || ( noMushrooms && (multibrickOptions.type == "mushroom"))){
            multibrickOptions.type = "normal";
        }

        var powAction = function(collidedSprite){
            this.toybox.sfx.multibrickPow.play();
            if (this.active == false) {
                return;
            }
            this.toybox.players.forEachAlive(function(player,collidedSprite){
                if (collidedSprite != player){ player.hit()};
            },this,collidedSprite);
            this.toybox.mobs.forEachAlive(function(mob){mob.hit()});
        }

        var coinAction = function(){
            if (this.active == false) {
                return;
            }
            this.toybox.add.coin({
                startingX: this.x,
                startingY: this.y - (this.height / 2) - 8,
                dX: Phaser.Math.between(-50,50),
                dY: -200
            });
        }

        var mushroomAction = function(){
            if (this.active == false) {
                return;
            }
            this.toybox.add.mushroom({
                startingX: this.x,
                startingY: this.y - (this.height / 2) - 8,
                dY: -200
            });
        }

        switch (multibrickOptions.type){
            case "coin":
                multibrickOptions.spriteIndex = multibrickOptions.baseSpriteIndex + 3;
                multibrickOptions.postBump = coinAction;
            break;
            case "mushroom":
                multibrickOptions.spriteIndex = multibrickOptions.baseSpriteIndex + 9;
                multibrickOptions.postBump = mushroomAction;
            break;
            case "pow":
                multibrickOptions.spriteIndex = multibrickOptions.baseSpriteIndex + 11;
                multibrickOptions.postBump = powAction;
            break;
            case "striped":
                multibrickOptions.spriteIndex = multibrickOptions.baseSpriteIndex + 1;
                multibrickOptions.spriteIndex += (Phaser.Math.between(0,1) * 6);
                multibrickOptions.baseSpriteIndex = multibrickOptions.spriteIndex;
                multibrickOptions.postBump = function(){};
            break;
            case "normal":
            default:
                multibrickOptions.spriteIndex = multibrickOptions.baseSpriteIndex + (Phaser.Math.between(0,1) * 6);
                multibrickOptions.baseSpriteIndex = multibrickOptions.spriteIndex;
                multibrickOptions.postBump = function(){};
            break;
        }

     	multibrickOptions.name = multibrickOptions.color + multibrickOptions.type + "Multibrick";

     	var multibrickCollide = function(multibrick, collidedSprite){
            var spriteNotOnSide = Math.abs(collidedSprite.x - multibrick.x) <= (multibrick.width / 2);
            var spriteCanBeHit = collidedSprite.isMob() || collidedSprite.isPlayer();
     		if( collidedSprite.y > multibrick.y && !multibrick.bumped && spriteNotOnSide && collidedSprite.isPlayer()){
   				multibrick.bump(collidedSprite);
     		} else if (collidedSprite.y < multibrick.y && multibrick.bumped && spriteNotOnSide && spriteCanBeHit) {
                collidedSprite.hit();
            }
     	}

     	multibrickOptions.collide = multibrickCollide;

     	var multibrickGO = this.toybox.add.block(multibrickOptions);
        multibrickGO.postBump = multibrickOptions.postBump;
        multibrickGO.resetTimer = multibrickOptions.resetTimer;
     	multibrickGO.bumped = false;
        multibrickGO.animations.add("active", [multibrickOptions.spriteIndex]);
        multibrickGO.animations.add("inactive", [multibrickOptions.baseSpriteIndex]);
        multibrickGO.animations.play("active")
        if (["coin","pow","mushroom"].indexOf(multibrickOptions.type) == -1){
            multibrickGO.active = false;
        } else {
            multibrickGO.active = true;
        }

     	multibrickGO.bump = function(collidedSprite){
     		this.toybox.sfx.multibrickBump.play();
            this.y -= 2;
            this.postBump(collidedSprite);
            this.active = false;
            this.animations.play("inactive");
            if (typeof(this.resetTimer) == "number" && this.bumped == false){
                this.toybox.game.time.events.add(this.resetTimer, this.reActivate , this);
            }
            this.bumped = true;
     		this.toybox.game.time.events.add(250, this.unBump , this);
     	};

        multibrickGO.unBump = function(){
            this.bumped = false;
            this.y += 2;
        };

        multibrickGO.reActivate = function(){
            this.active = true;
            this.animations.play("active");
        }

     	return multibrickGO;
 	}

};
