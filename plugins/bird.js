// Bird is player that stays afloat by flapping around.
// Birds don't have a 'up'/jump control, left and right both flap in that direction.

// playerOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     facing: string ("left" or "right") determines the direction the sprite starts out facing.
//     speed: number, represents the speed the player will move when activated (in this case, horizontal force of flaps)
//     jumpForce: number, represents how hard a player will jump (in this case, vertical force of flaps)
//     controls: object, contains key-value pairs of keycodes and named controls
//
// unique birdOptions attributes:
//      color: string, valid options: "green" "blue" "pink" "orange"
//      controls: object, needs to contains keycodes for left,right,jump

var birdToyboxPlugin = {
 	name: "bird",
    toyboxType: "player",

 	preload: function(toyboxObject){
 		toyboxObject._game.load.spritesheet("greenBird", "../../assets/sprites/greenBirdSheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("blueBird", "../../assets/sprites/blueBirdSheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("pinkBird", "../../assets/sprites/pinkBirdSheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("orangeBird", "../../assets/sprites/orangeBirdSheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("heartsAndStar", "../../assets/sprites/heartsAndStarSheet.png", 16, 16);
        toyboxObject._game.load.audio("birdFlap", "../../assets/sfx/impact-6.wav");
        toyboxObject._game.load.audio("birdChirp", "../../assets/sfx/chirp-2.wav");
        toyboxObject._game.load.audio("birdFall", "../../assets/sfx/falling-3.wav");
        toyboxObject._game.load.audio("birdKill", "../../assets/sfx/zap-1.wav");

 	},

    sfx: ["birdFlap","birdChirp","birdFall","birdKill"],

 	create: function(birdOptions){
    birdOptions = typeof (birdOptions) == "undefined" ? {} : birdOptions;

 		birdOptions.allowGravity = true;

        var validColors = ["green","blue","pink","orange"];

        var randomizeBird = function() {
            return validColors[Phaser.Math.between(0,(validColors.length - 1))];
        }

        if (typeof(birdOptions.color) == "undefined" || validColors.indexOf(birdOptions.color) == -1){
            birdOptions.color = randomizeBird();
        }

        birdOptions.speed = birdOptions.speed || 50;
        birdOptions.jumpForce = birdOptions.jumpForce || 200;
        birdOptions.health = birdOptions.health || 3;
 
        if (typeof(birdOptions.controls) == "undefined"){
            birdOptions.controls = {
                left: 37,
                right: 39,
            }
        };
        birdOptions.spriteName = birdOptions.color + "Bird";

        var birdPlatformerUpdate = function(){
            if (this.body == null){
                return;
            }

            if (this.isHit || this.health <= 0){
                birdGO.animations.play("hit");
                if ((this.body.onFloor() || this.body.touching.down) && this.health <= 0 ){
                    this.kill();
                }
                return;
            }

            if (this.controls.right.isDown) {
                this.scale.x = Math.abs(this.scale.x) * -1;
                this.flap();
            } else if (this.controls.left.isDown) {
                this.scale.x = Math.abs(this.scale.x) * 1;
                this.flap();
            } else {
                if (this.body.onFloor() || this.body.touching.down){
                    this.body.velocity.x *= 0.95;
                    this.animations.play("standing");
                } else {
                    this.animations.play("falling");
                }
            }

        };

        birdOptions.update = birdPlatformerUpdate;

        var birdCollide = function(bird, collidedSprite){
            var birdIsOnTop = (bird.y + (bird.height / 2)) <= (collidedSprite.y - collidedSprite.height / 2) ;

            if (collidedSprite.isMob()){
                if (birdIsOnTop){
                    bird.body.velocity.y = -200;
                    collidedSprite.hit();
                } else {
                    if (collidedSprite.health > 0){
                        bird.hit();
                    }
                }
            }
        };

        birdOptions.collide = birdCollide;

        var birdKill = function(bird){
            var splosion = this.toybox.game.add.emitter(bird.x, bird.y, 12);
            this.toybox.topDecorations.add(splosion);
            splosion.makeParticles('heartsAndStar',[5]);
            splosion.gravity = 0;
            splosion.minParticleSpeed = new Phaser.Point(-400,-400);
            splosion.maxParticleSpeed = new Phaser.Point(400,400);
            this.toybox.sfx.birdKill.play();
            splosion.start(true,4000,null,12);
            this.toybox.players.remove(this);
            game.time.events.add(10000, function(){ splosion.kill()}, this);

        }

        birdOptions.kill = birdKill;

        var birdGO = this.toybox.add.player(birdOptions);

        birdGO.health = birdOptions.health;
        birdGO.events.onHit = new Phaser.Signal();
        if(typeof(birdOptions.onHit) == "function"){
          birdGO.events.onHit.add(birdOptions.onHit);
        }

        birdGO.hit = function(){
            if (this.isHit){
                return;
            }
            this.isHit = true;
            this.health -= 1;
            var xDir = (this.scale.x > 0) ? 1 : -1;
            this.body.velocity.x = 75 * xDir;
            this.body.velocity.y = -200;
            for (var i = this.children.length - 1; i >= 0; i--) {
                this.children[i].drop();
            }
            this.toybox.sfx.birdChirp.play();
            this.events.onHit.dispatch(this);
            var thisBird = this;
            this.toybox.game.time.events.add(500, function(){
                if (thisBird.health > 0){
                    thisBird.animations.play("idle");
                    thisBird.isHit = false;
                }
            }, this);
            if (this.health == 0){
                this.toybox.sfx.birdFall.play();
            } else {
                this.animations.play("hit");
            }
        }

        birdGO.flap = function(){
            if (!this.canFlap){
                return;
            }
            this.canFlap = false;
            if (this.animations.name !== "flap") {
                this.animations.play("flap");
            }
            var xDir = (this.scale.x > 0) ? 1 : -1;
            if (this.body.onFloor() || this.body.touching.down){
                this.body.velocity.y = -this.jumpForce;
            } else {
                this.body.velocity.y -= this.jumpForce;
            }
            this.body.velocity.x -= this.speed * xDir;
            this.toybox.sfx.birdFlap.play();
            this.toybox.game.time.events.add(250, function(){ this.canFlap = true; }, this);

        }

        var fps = this.toybox.animationFPS;
        birdGO.animations.add("falling", [5]);
        birdGO.animations.add("standing", [0]);
        birdGO.animations.add("hit", [6]);
        birdGO.animations.add("flap", [1, 2, 3, 0], fps, true);

        birdGO.isHit = false;
        birdGO.canFlap = true;
        birdGO.scale.x *= (birdOptions.facing == "left") ? 1 : -1 ;

        return birdGO;
 	}

};
