// Bubble is a block that will grow and carry other objects with it until it pops. Be sure to give it a negative dY to make it rise!
//
// blockOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     collideWorld: boolean, true: object will collide with the edges of the game
//     name: string, name of the object type, meant mostly for debugging
//
// unique bubbleOptions attributes
//      growRate: number, how much the bubble's scale increases each update cycle (keep very small)
//      maxScale: number, the scale the bubble maxes out at
//      killTimer: number, the time in milliseconds before the bubble pops on it's own (0 means lasts indefinitely)


var bubbleToyboxPlugin = {
 	name: "bubble",
    toyboxType: "block",

 	preload: function(toyboxObject){
 		toyboxObject._game.load.spritesheet("bubble", "../../assets/sprites/single-images/bubble.png", 32, 32);
 		toyboxObject._game.load.spritesheet("poof", "../../assets/sprites/poofSheet.png", 16, 24);
 		toyboxObject._game.load.audio("bubblePop", "../../assets/sfx/pop-1.wav");
        toyboxObject._game.load.audio("bubbleGrab", "../../assets/sfx/bubble-2.wav");
 	},

 	sfx: ["bubblePop","bubbleGrab"],

 	create: function(bubbleOptions){
    bubbleOptions = typeof (bubbleOptions) == "undefined" ? {} : bubbleOptions;
    
 		bubbleOptions.spriteName = "bubble";
     	bubbleOptions.scale = 0.25;
        bubbleOptions.growRate = bubbleOptions.growRate || .005;
        bubbleOptions.maxScale = bubbleOptions.maxScale || 2;
     	bubbleOptions.name = "bubble";
        bubbleOptions.killTimer = (typeof(bubbleOptions.killTimer) != "undefined") ? bubbleOptions.killTimer : 7000;
        bubbleOptions.allowGravity = false;
        bubbleOptions.immovable = false;
        bubbleOptions.dY = bubbleOptions.dY || -100;

     	var bubbleCollide = function(bubble, collidedSprite){

            if (collidedSprite == bubble.children[0]){
                return;
            }

            var biggerSide = Math.max(collidedSprite.width, collidedSprite.height);

            if ( bubble.width > biggerSide && bubble.children.length < 1 ){
                bubble.grab(collidedSprite);
            } else {
                bubble.pop();
                if(typeof(collidedSprite.pop) != "undefined"){
                    collidedSprite.pop();
                }
            }
     	}

     	bubbleOptions.collide = bubbleCollide;

     	var bubbleUpdate = function(){

            if (typeof(this.body) == "undefined" || this.body == null) {
                return;
            }
            //this.body.velocity.y = this.permanentDY;
            this.scale.x = Phaser.Math.clamp(this.scale.x + this.growRate, 0 , this.maxScale);
            this.scale.y = Phaser.Math.clamp(this.scale.y + this.growRate, 0 , this.maxScale);

            if (this.children.length > 0){
                var child = this.children[0];
                child.x = 0;
                child.y = 0;
                child.rotation += 0.05;
                if (typeof(child.body) != "undefined" && child.body != null){
                    child.body.velocity = new Phaser.Point(0,0);
                }
            }
        }

        bubbleOptions.update = bubbleUpdate;

     	var bubbleKill = function(bubble){
            var poofOptions = {
                startingX: bubble.x,
                startingY: bubble.y,
                spriteName: "poof",
                sendTo: "top"
            }
            var poofGO = this.toybox.add.decoration(poofOptions);
            poofGO.animations.add("poof", [0, 1, 2, 3], this.toybox.animationFPS, true);
            poofGO.animations.play("poof");
            this.game.time.events.add(250, function(){ poofGO.kill(); }, this);
        }

        bubbleOptions.kill = bubbleKill;

     	var bubbleGO = this.toybox.add.block(bubbleOptions);
        bubbleGO.growRate = bubbleOptions.growRate;
        bubbleGO.permanentDY = bubbleOptions.dY;
        bubbleGO.maxScale = bubbleOptions.maxScale;

        bubbleGO.pop = function(){
            this.toybox.sfx.bubblePop.play();

            if (this.children.length > 0) {
                var child = this.children[0];
                switch(child.toyboxType){
                    case "player":
                        this.toybox.players.add(child);
                    break;
                    case "block":
                        this.toybox.blocks.add(child);
                    break;
                    case "mob":
                        this.toybox.mobs.add(child);
                    break;
                    case "collectible":
                        this.toybox.collectibles.add(child);
                    break;
                    case "decoration":
                        this.toybox.decorations.add(child);
                    break;
                }
                child.rotation = 0;
                child.x = this.x;
                child.y = this.y;
                child.body.velocity.x = this.body.velocity.x;

            };

            this.kill();
        };

        bubbleGO.grab = function(collidedSprite){

            if(collidedSprite.body.immovable){
                this.pop();
                return;
            }

            this.toybox.sfx.bubbleGrab.play();
            this.addChild(collidedSprite);
            collidedSprite.x = 0;
            collidedSprite.y = 0;
            if (typeof(collidedSprite.body) != "undefined" && collidedSprite.body != null){
                var averageX = Phaser.Math.average(this.body.velocity.x, collidedSprite.body.velocity.x)
                var averageY = Phaser.Math.average(this.body.velocity.x, collidedSprite.body.velocity.y)
                this.body.velocity = new Phaser.Point( averageX, averageY );
            }
            if ( typeof(collidedSprite.isHeld) != "undefined"){
                collidedSprite.isHeld = false;
            }
        };

        if (bubbleOptions.killTimer > 0) {
            bubbleGO.toybox.game.time.events.add( bubbleOptions.killTimer, function(){ bubbleGO.pop() }, this );
        }

     	return bubbleGO;
 	}

};
