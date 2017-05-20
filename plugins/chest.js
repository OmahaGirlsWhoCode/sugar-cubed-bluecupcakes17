// A chest is a block, which when bumped will open and trigger a function.
// (Similar to a one-use button.)
// Optionally, a key may be provided for the chest, which is required to open it.

// blockOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     kill: function, this is added to the sprite's onKilled signal
//     allowGravity: boolean, true: sprite falls with gravity
//     immovable: boolean, true: object will be fixed in place and cannot move
//     collideWorld: boolean, true: object will collide with the edges of the game
//     bounce: number, how elastic collisions with this object are

//  unique chestOption attributes:
//      color: string, determines sprite color
//          valid values: "gold", "silver"
//      onOpen: the function that is called when opened.
//      key: Phaser Sprite, optional, the object required to touch the chest in order to open
//      killTimer: number, in milliseconds the timer after being opened when a chest will dissapear. 0 means chest will remain.


var chestToyboxPlugin = {
 	name: "chest",
  toyboxType: "block",

 	preload: function(toyboxObject){
 	  toyboxObject._game.load.spritesheet("chest", "../../assets/sprites/chestsSheet.png", 16, 16);
    toyboxObject._game.load.audio("chestOpen", "../../assets/sfx/key-1.wav");
 	},

  sfx: ["chestOpen"],

 	create: function(chestOptions){
    chestOptions = typeof (chestOptions) == "undefined" ? {} : chestOptions;

    chestOptions.spriteName = "chest";

    var validColors = ["silver","gold"];

    var randomizeChest = function() {
        return validColors[Phaser.Math.between(0,(validColors.length - 1))];
    }

    if (typeof(chestOptions.color) == "undefined" || validColors.indexOf(chestOptions.color) == -1){
        chestOptions.color = randomizeChest();
    }

    chestOptions.name = chestOptions.color + "chest";

    chestOptions.spriteIndex = (chestOptions.color == "silver") ? 0 : 2;

    var chestCollide = function(chest, collidedSprite){

      if ( collidedSprite.isBlock() && collidedSprite != this.key){
        return;
      }

      var keyIsPresent = ((collidedSprite == chest.key) || (collidedSprite.children.indexOf(chest.key) != -1));

      if ((keyIsPresent || !(chest.locked)) && chest.closed){
        chest.animations.play("open");
        chest.toybox.sfx.chestOpen.play();
        chest.closed = false;
        chest.locked = false;
        if (typeof(chest.key) != "undefined"){
          chest.key.kill();
        }
        chest.onOpen();
        if (chest.killTimer > 0){
          chest.toybox.game.time.events.add(chest.killTimer, function(){ chest.kill(); }, this);
        }
      }
    }

    chestOptions.collide = chestCollide;
    chestOptions.drag = chestOptions.drag || 400;
    chestOptions.onPress = (typeof(chestOptions.onPress) == "function") ? chestOptions.onPress : function(){};

    var chestGO = this.toybox.add.block(chestOptions);
    chestGO.closed = true;
    chestGO.killTimer = (typeof(chestGO.killTimer) != "number") ? 5000 : chestGO.killTimer;
    chestGO.locked = (typeof(chestOptions.key) == "undefined" )? false : true;
    chestGO.key = chestOptions.key;
    chestGO.onOpen = (typeof(chestOptions.onOpen) == "undefined") ? function(){} : chestOptions.onOpen;
    chestGO.animations.add("closed", [chestOptions.spriteIndex]);
    chestGO.animations.add("open", [chestOptions.spriteIndex + 1]);
    chestGO.animations.play("closed");

    return chestGO;
 	}

};
