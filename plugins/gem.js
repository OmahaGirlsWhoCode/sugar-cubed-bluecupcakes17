// Gem is a collectible that is immune to gravity, and has a default score value of 250
// Note that gems are NOT immovable, so collisions can have amusing/strange results.
// To change the score value, change the gem's currencyValue attribute after creation.

// collectibleOptions attributes:
//     spriteName: string, name of spritesheet loaded in preload
//     spriteIndex: number, starting sprite in spritesheet
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     update: function, this is run every update cycle
//     collide: function, this is added to the sprite's onCollide signal
//     kill: function, this is added to the sprite's onKilled signal
//     immovable: boolean, true: object will be fixed in place and cannot move
//     collideWorld: boolean, true: object will collide with the edges of the game
//     bounce: number, how elastic collisions with this object are
//     name: string, name of the object type, meant mostly for debugging
//
//  unique gemOption attributes:
//      color: string, determines sprite color and score value
//          valid values: "red", "yellow", "blue", "green"

var gemToyboxPlugin = {
    name: "gem",
    toyboxType: "collectible",

    preload: function(toyboxObject){
        toyboxObject._game.load.spritesheet("gems", "../../assets/sprites/gemsSheet.png", 16, 16);
        toyboxObject._game.load.audio("gemCollected", "../../assets/sfx/gem-1.wav");
    },

    sfx: ["gemCollected"],

    create: function(gemOptions){
      gemOptions = typeof (gemOptions) == "undefined" ? {} : gemOptions;

        var validColors = ["yellow","red","blue","green"];

        var randomizeGem = function() {
            return validColors[Phaser.Math.between(0,(validColors.length - 1))];
        }

        gemOptions.spriteName = "gems";
        if (typeof(gemOptions.color) == "undefined" || validColors.indexOf(gemOptions.color) == -1){
            gemOptions.color = randomizeGem();
        }
        gemOptions.name = gemOptions.color + "Gem";
        gemOptions.allowGravity = false;

        var tryIncreaseCurrency = function(gem, collidedSprite) {
            if (collidedSprite.isPlayer()) {
                if (typeof(collidedSprite.score) == "undefined"){
                    collidedSprite.score = 0;
                }
                collidedSprite.score += gem.currencyValue;
                this.toybox.sfx.gemCollected.play();
                gem.kill();
            }
        }

        gemOptions.collide = tryIncreaseCurrency;

        var gemGO = this.toybox.add.collectible(gemOptions);
        gemGO.currencyValue = 250;

        var fps = this.toybox.animationFPS;

        switch (gemOptions.color){
            case "yellow":
                gemGO.animations.add("yellowGlimmer", [0, 0, 0, 4], fps, true);
                gemGO.animations.play("yellowGlimmer");
            break;
            case "red":
                gemGO.animations.add("redGlimmer", [2, 6, 2, 2], fps, true);
                gemGO.animations.play("redGlimmer");
            break;
            case "blue":
                gemGO.animations.add("blueGlimmer", [3, 7, 7, 7], fps, true);
                gemGO.animations.play("blueGlimmer");
            break;
            default:
                gemGO.animations.add("greenGlimmer", [1, 1, 5, 1], fps, true);
                gemGO.animations.play("greenGlimmer");
            break;
        }

        return gemGO;
    }

};
