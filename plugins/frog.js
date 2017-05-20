// Frog is a player object made for basic platformer-style games.
// It has three controls: left, right, and jump

// playerOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     facing: string ("left" or "right") determines the direction the sprite starts out facing.
//     speed: number, represents the speed the player will move when activated
//     jumpForce: number, represents how hard a player will jump
//     controls: object, contains key-value pairs of keycodes and named controls
//
// unique frogOptions attributes:
//      controls: object, needs to contains keycodes for left,right,jump


var frogToyboxPlugin = {
  name: "frog",
  toyboxType: "player",

  preload: function (toyboxObject) {
    toyboxObject._game.load.spritesheet("frog", "../../assets/sprites/frogSheet.png", 16, 16);
    toyboxObject._game.load.spritesheet("poof", "../../assets/sprites/poofSheet.png", 16, 16);
    toyboxObject._game.load.audio("frogJump", "../../assets/sfx/jump-1.wav");
    toyboxObject._game.load.audio("frogHit", "../../assets/sfx/chirp-1.wav");
    toyboxObject._game.load.audio("frogKill", "../../assets/sfx/zap-1.wav");

  },

  sfx: ["frogJump", "frogHit", "frogKill"],

  create: function (frogOptions) {
    frogOptions = typeof (frogOptions) == "undefined" ? {} : frogOptions;

    frogOptions.allowGravity = true;
    frogOptions.speed = frogOptions.speed || 100;
    frogOptions.jumpForce = frogOptions.jumpForce || 300;
    frogOptions.health = frogOptions.health || 3;
    if (typeof(frogOptions.controls) == "undefined") {
      frogOptions.controls = {
        left: 37,
        right: 39,
        jump: 38
      }
    }
    ;
    frogOptions.spriteName = "frog";

    var frogPlatformerUpdate = function () {
      if (this.isHit) {
        return;
      }

      if (this.health <= 0) {
        this.kill();
        return;
      }

      if (this.controls.right.isDown) {
        this.body.velocity.x = this.speed;
        if (this.scale.x < 0) {
          this.scale.x *= -1;
        }
        if (this.animations.name !== "run") {
          this.animations.play("run");
        }
      } else if (this.controls.left.isDown) {
        this.body.velocity.x = -this.speed;
        if (this.scale.x > 0) {
          this.scale.x *= -1;
        }
        if (this.animations.name !== "run") {
          this.animations.play("run");
        }
      } else {
        // Not moving
        this.body.velocity.x = 0;
        this.animations.play("idle");
      }

      // checkForJump
      if (this.controls.jump.isDown && (this.body.onFloor() || this.body.touching.down)) {
        this.body.velocity.y = -this.jumpForce;
        if (this.animations.name !== "jump") {
          this.animations.play("jump");
          this.toybox.sfx.frogJump.play();
        }
      }
    };
    frogOptions.update = typeof(frogOptions.update) != "function" ? frogPlatformerUpdate : frogOptions.update;

    var frogCollide = function (frog, collidedSprite) {
      var frogIsOnTop = (frog.y + (frog.height / 2)) <= (collidedSprite.y - collidedSprite.height / 2);

      if (collidedSprite.isMob()) {
        if (frogIsOnTop) {
          frog.body.velocity.y = -200;
          collidedSprite.hit();
        } else {
          if (collidedSprite.health > 0) {
            frog.hit();
          }
        }
      }
    };

    frogOptions.collide = frogCollide;

    var frogKill = function (frog) {
      var splosion = this.toybox.game.add.emitter(frog.x, frog.y, 12);
      this.toybox.topDecorations.add(splosion);
      splosion.makeParticles('poof', [5]);
      splosion.gravity = 0;
      splosion.minParticleSpeed = new Phaser.Point(-400, -400);
      splosion.maxParticleSpeed = new Phaser.Point(400, 400);
      this.toybox.sfx.frogKill.play();
      splosion.start(true, 4000, null, 12);
      this.toybox.players.remove(this);
      game.time.events.add(2000, function () {
        splosion.kill()
      }, this);

    }

    frogOptions.kill = frogKill;

    var frogGO = this.toybox.add.player(frogOptions);

    frogGO.health = frogOptions.health;
    frogGO.events.onHit = new Phaser.Signal();
    if (typeof(frogOptions.onHit) == "function") {
      frogGO.events.onHit.add(frogOptions.onHit);
    }

    frogGO.hit = function () {
      if (this.isHit) {
        return;
      }
      this.isHit = true;
      this.health -= 1;
      this.body.velocity.x = -75 * this.scale.x;
      this.body.velocity.y = -200;
      for (var i = this.children.length - 1; i >= 0; i--) {
        this.children[i].drop();
      }
      this.animations.play("hit");
      this.toybox.sfx.frogHit.play();
      this.events.onHit.dispatch(this);
      var thisFrog = this;
      this.toybox.game.time.events.add(500, function () {
        if (thisFrog.health <= 0) {
          thisFrog.kill();
        } else {
          thisFrog.animations.play("idle");
          thisFrog.isHit = false;
        }
      }, this);
    }

    var fps = this.toybox.animationFPS;
    frogGO.animations.add("idle", [0, 1, 2], fps, true);
    frogGO.animations.add("hit", [5]);
    frogGO.animations.add("run", [4]);
    frogGO.animations.add("jump", [2, 3], fps, true);

    frogGO.isHit = false;
    frogGO.scale.x *= (frogOptions.facing == "right") ? 1 : -1;

    return frogGO;
  }

};
