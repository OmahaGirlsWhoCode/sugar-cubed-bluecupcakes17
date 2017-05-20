// Ball is a collectible that is immune to gravity, and has a default score value of 25
// Note that balls are NOT immovable, so collisions can have amusing/strange results.
// To change the score value, change the ball's currencyValue attribute after creation.

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

var ballToyboxPlugin = {
  name: "ball",
  toyboxType: "collectible",

  preload: function (toyboxObject) {
    toyboxObject._game.load.spritesheet("ball", "../../assets/sprites/ballSheet.png", 16, 16);
    toyboxObject._game.load.audio("ballCollected", "../../assets/sfx/goo-1.wav");
  },

  sfx: ["ballCollected"],

  create: function (ballOptions) {
    ballOptions = typeof (ballOptions) == "undefined" ? {} : ballOptions;

    ballOptions.name = "justaBall";
    ballOptions.allowGravity = false;
    ballOptions.spriteName = "ball";

    var tryIncreaseCurrency = function (ball, collidedSprite) {
      if (collidedSprite.isPlayer()) {
        if (typeof(collidedSprite.score) == "undefined") {
          collidedSprite.score = 0;
        }
        collidedSprite.score += ball.currencyValue;
        this.toybox.sfx.ballCollected.play();
        ball.kill();
      }
    }

    ballOptions.collide = tryIncreaseCurrency;

    var ballGO = this.toybox.add.collectible(ballOptions);
    ballGO.currencyValue = 25;

    var fps = this.toybox.animationFPS;
    ballGO.animations.add("spin", [0, 1, 2, 3, 4, 5], fps / 2, true);
    ballGO.animations.play("spin");

    return ballGO;
  }

};
