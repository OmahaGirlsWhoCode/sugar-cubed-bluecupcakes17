// Button is a block that will run a function passed to it when it is activated from above by a player/mob

// blockOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     kill: function, this is added to the sprite's onKilled signal
//     allowGravity: boolean, true: sprite falls with gravity
//     immovable: boolean, true: object will be fixed in place and cannot move
//     collideWorld: boolean, true: object will collide with the edges of the game
//     bounce: number, how elastic collisions with this object are
//
//  unique buttonOptions attributes:
//      onPress: function, is called when a player or mob trigger the button from above

var buttonToyboxPlugin = {
 	name: "button",
  toyboxType: "block",

 	preload: function(toyboxObject){
 		 toyboxObject._game.load.spritesheet("button", "../../assets/sprites/buttonsSheet.png", 16, 16);
     toyboxObject._game.load.audio("buttonClick", "../../assets/sfx/door-1.wav");
 	},

  sfx: ["buttonClick"],

 	create: function(buttonOptions){
    buttonOptions = typeof (buttonOptions) == "undefined" ? {} : buttonOptions;

      buttonOptions.spriteName = "button";

      var validColors = ["yellow","red","blue","green"];

      var randomizeButton = function() {
          return validColors[Phaser.Math.between(0,(validColors.length - 1))];
      }

      if (typeof(buttonOptions.color) == "undefined" || validColors.indexOf(buttonOptions.color) == -1){
          buttonOptions.color = randomizeButton();
      }

     	buttonOptions.name = buttonOptions.color + "button";

      switch (buttonOptions.color){
          case "yellow":
              buttonOptions.spriteIndex = 0;
          break;
          case "red":
              buttonOptions.spriteIndex = 2;
          break;
          case "blue":
              buttonOptions.spriteIndex = 3;
          break;
          default:
              buttonOptions.spriteIndex = 1;
          break;
      }

     	var buttonCollide = function(button, collidedSprite){
        var bottomOfCollided = collidedSprite.y + (collidedSprite.height / 2);
        var topOfButton = button.y + (button.height / 2);
        var onTop = bottomOfCollided < topOfButton;
        var falling = collidedSprite.body.velocity.y > 0;
     		if( onTop && falling && !button.depressed){
   				button.press();
     		}
     	}

      buttonOptions.collide = buttonCollide;

      buttonOptions.onPress = (typeof(buttonOptions.onPress) == "function") ? buttonOptions.onPress : function(){};

     	var buttonGO = this.toybox.add.block(buttonOptions);
     	buttonGO.depressed = false;
      buttonGO.onPress = buttonOptions.onPress;
      buttonGO.animations.add("unpressed", [buttonOptions.spriteIndex], this.toybox.animationFPS, true);
      buttonGO.animations.add("pressed", [buttonOptions.spriteIndex + 4], this.toybox.animationFPS, true);

     	buttonGO.press = function(){
       		this.depressed = true;
       		this.toybox.sfx.buttonClick.play();
          this.animations.play("pressed");
          this.body.checkCollision.up = false;
          this.onPress();
       		this.toybox.game.time.events.add(1000, function(){
                    if(this != null){
                  this.depressed = false;
                  this.animations.play("unpressed");
                  if(this.body != null){
                    this.body.checkCollision.up = true;
                  }
                }
              }, this);
     	};

      buttonGO.body.checkCollision = {none: false, any: true, up: true, down: true, left: false, right: false};

     	return buttonGO;
 	}

};
