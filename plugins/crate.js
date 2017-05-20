// Crate is a basic block that looks like a wooden crate.
// It intentionally doesn't do a lot.

// blockOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//	   update: function, this is run every update cycle
//     collide: function, this is added to the sprite's onCollide signal
//     allowGravity: boolean, true: sprite falls with gravity
//     immovable: boolean, true: object will be fixed in place and cannot move
//     collideWorld: boolean, true: object will collide with the edges of the game
//     bounce: number, how elastic collisions with this object are
//     name: string, name of the object type, meant mostly for debugging
//
// unique crateOptions attributes:
//		type: number, 0-3, determines sprite for crate


var crateToyboxPlugin = {
 	name: "crate",
    toyboxType: "block",

 	preload: function(toyboxObject){
 		toyboxObject._game.load.spritesheet("cratesAndOre", "../../assets/sprites/cratesAndOreSheet.png", 16, 16);
 		toyboxObject._game.load.spritesheet("poof", "../../assets/sprites/poofSheet.png", 16, 24);
 		toyboxObject._game.load.audio("crateBump", "../../assets/sfx/impact-3.wav");
 	},

 	sfx: ["crateBump"],

 	create: function(crateOptions){
    crateOptions = typeof (crateOptions) == "undefined" ? {} : crateOptions;
    
 		crateOptions.spriteName = "cratesAndOre";
     	crateOptions.scale = crateOptions.scale || this.toybox.diceRoll(4);
     	crateOptions.spriteIndex = crateOptions.type || this.toybox.diceRoll(4) - 1;
     	crateOptions.name = "type" + crateOptions.type + "Crate";

     	var crateCollide = function(crate, collidedSprite){
     		if( (crate.body.velocity.x >= 100 || crate.body.velocity.y >= 100) && !crate.bumped){
   				crate.bump();
     		}
     	}

     	crateOptions.collide = crateCollide;

     	var crateUpdate = function(){
     		if (this.body == null){
     			return;
     		}
            if (this.body.touching.down){
                this.body.velocity.x *= 0.95;
            }
        }

        crateOptions.update = crateUpdate;

     	var crateKill = function(crate){
            var poofOptions = {
                startingX: crate.x,
                startingY: crate.y,
                spriteName: "poof",
                sendTo: "top"
            }
            var poofGO = this.toybox.add.decoration(poofOptions);
            poofGO.animations.add("poof", [0, 1, 2, 3], this.toybox.animationFPS, true);
            poofGO.animations.play("poof");
            this.game.time.events.add(250, function(){ poofGO.kill(); }, this);
        }

        crateOptions.kill = crateKill;

     	var crateGO = this.toybox.add.block(crateOptions);
     	crateGO.bumped = false;

     	crateGO.bump = function(){
     		this.bumped = true;
     		this.toybox.sfx.crateBump.play();
     		var thisCrate = this;
     		this.toybox.game.time.events.add(2000, function(){ thisCrate.bumped = false; }, this);
     	};

     	return crateGO;
 	}

};
