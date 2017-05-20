// a lever is a block that can be switched between a left and right state.
// 'whileLeft' and 'whileRight' are functions that can be passed to the lever, and determine it's behavior.

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
//  unique leverOptions attributes:
//      whileLeft: function, ran during update if the lever is switched left
//      whileRight: function, ran during update if the lever is switched right
//      facing: string, ("left" or "right) determines the starting position of the lever.

var leverToyboxPlugin = {
 	name: "lever",
    toyboxType: "block",

 	preload: function(toyboxObject){
 		toyboxObject._game.load.spritesheet("lever", "../../assets/sprites/leverSheet.png", 16, 16);
        toyboxObject._game.load.audio("leverClick", "../../assets/sfx/door-1.wav");
 	},

 	sfx: ["leverClick"],

 	create: function(leverOptions){
    leverOptions = typeof (leverOptions) == "undefined" ? {} : leverOptions;
    
 		leverOptions.spriteName = "lever";
     	leverOptions.name = "lever";
        leverOptions.immovable = true;
        leverOptions.allowGravity = false;

     	var leverCollide = function(lever, collidedSprite){
            var moveLeft = (lever.direction == "right" && collidedSprite.x > lever.x);
            var moveRight = (lever.direction == "left" && collidedSprite.x < lever.x);
     		if( (moveRight || moveLeft) && !lever.wasSwitched ){
   				lever.switch();
     		}
     	}

        leverOptions.collide = leverCollide;

        var leverUpdate = function(){
            if( this.direction == "left" ){
                this.whileLeft();
            } else if ( this.direction == "right" ){
                this.whileRight();
            }
        }

        leverOptions.update = leverUpdate;

     	var leverGO = this.toybox.add.block(leverOptions);
     	leverGO.wasSwitched = false;
        leverGO.whileLeft = (typeof(leverOptions.whileLeft) == "function") ? leverOptions.whileLeft : function(){};
        leverGO.whileRight = (typeof(leverOptions.whileRight) == "function") ? leverOptions.whileRight : function(){};
        var fps = this.toybox.animationFPS;
        leverGO.animations.add("left", [2,1,0], fps, false);
        leverGO.animations.add("right", [0,1,2], fps, false);

        if (leverOptions.facing == "right"){
            leverGO.direction = "right";
            leverGO.animations.play("right");
        } else {
            leverGO.direction = "left";
        }

     	leverGO.switch = function(){
     		this.wasSwitched = true;
            if (this.direction == "left"){
                this.direction = "right";
                this.animations.play("right");
            } else {
                this.direction = "left";
                this.animations.play("left");
            }
     		this.toybox.sfx.leverClick.play();
     		var thisLever = this;
     		this.toybox.game.time.events.add(1000, function(){
                thisLever.wasSwitched = false;
            }, this);
     	};

     	return leverGO;
 	}

};
