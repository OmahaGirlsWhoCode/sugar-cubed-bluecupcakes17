// A key is a collectible type object that a player will hold until hit, or until handed to another player.
// Keys by themselves have no special behavior, but can be linked to chests.

// collectibleOptions attributes:
//     spriteName: string, name of spritesheet loaded in preload
//     spriteIndex: number, starting sprite in spritesheet
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     kill: function, this is added to the sprite's onKilled signal
//     collideWorld: boolean, true: object will collide with the edges of the game
//     bounce: number, how elastic collisions with this object are
//     name: string, name of the object type, meant mostly for debugging
//
//  unique keyOption attributes:
//      color: string, determines sprite color
//          valid values: "gold", "silver"

var keyToyboxPlugin = {
    name: "key",
    toyboxType: "collectible",

    preload: function(toyboxObject){
        toyboxObject._game.load.spritesheet("keys", "../../assets/sprites/keysSheet.png", 16, 8);
        toyboxObject._game.load.audio("keyCollected", "../../assets/sfx/key-2.wav");
    },

    sfx: ["keyCollected"],

    create: function(keyOptions){
      keyOptions = typeof (keyOptions) == "undefined" ? {} : keyOptions;

        var validColors = ["gold","silver"];

        var randomizeKey = function() {
            return validColors[Phaser.Math.between(0,(validColors.length - 1))];
        }

        keyOptions.spriteName = "keys";
        if (typeof(keyOptions.color) == "undefined" || validColors.indexOf(keyOptions.color) == -1){
            keyOptions.color = randomizeKey();
        }
        keyOptions.spriteIndex = (keyOptions.color == "silver") ? 0 : 1;
        keyOptions.name = keyOptions.color + "Key";

        var lockInPlace = function(){
            if (this.isHeld) {
                this.body.velocity = new Phaser.Point(0,0);
                this.y = this.parent.height / 4;
                this.x = (Math.sign(this.parent.scale.x) * (this.parent.width / 2))
            }
        }
        keyOptions.update = lockInPlace;

        var tryGrab = function(key, collidedSprite){
            if (collidedSprite.isPlayer() && collidedSprite.children.indexOf(key) == -1 && key.canBeGrabbed){
                this.toybox.sfx.keyCollected.play();
                key.canBeGrabbed = false;
                collidedSprite.addChild(key);
                key.parent = collidedSprite;
                key.y = key.parent.height / 4;
                key.x = (Math.sign(key.parent.scale.x) * (key.parent.width / 2));
                key.body.velocity = new Phaser.Point(0,0);
                key.isHeld = true;
                this.game.time.events.add(2000, function(){ this.canBeGrabbed = true}, key);
            }
        }

        keyOptions.collide = tryGrab;

        var keyGO = this.toybox.add.collectible(keyOptions);

        keyGO.drop = function(){
            this.canBeGrabbed = false;
            this.isHeld = false;
            var exParent = this.parent;
            this.toybox.collectibles.add(this);
            this.x = exParent.x;
            this.y = exParent.y - 20;
            this.body.velocity = new Phaser.Point(Math.sign(exParent.scale.x) * 200 , -200 );
            this.game.time.events.add(2000, function(){ this.canBeGrabbed = true}, this);
        }
        keyGO.canBeGrabbed = true;
        keyGO.isHeld = false;
        keyGO.body.drag.x = 200;

        return keyGO;
    }

};
