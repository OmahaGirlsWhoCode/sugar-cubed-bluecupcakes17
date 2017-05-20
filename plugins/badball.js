// Bad Ball is an enemy/mob that move forward until it bumps something else, then it turns around and goes the other way.

// mobOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     kill: function, this is added to the sprite's onKilled signal
//     facing: string ("left" or "right") determines the direction the sprite starts out facing.

var badballToyboxPlugin = {
  name: "badball",
  toyboxType: "mob",

  preload: function (toyboxObject) {
    toyboxObject._game.load.spritesheet("badball", "../../assets/sprites/ballSheet.png", 16, 16);
    toyboxObject._game.load.audio("badballBump", "../../assets/sfx/footsteps-1.wav");
    toyboxObject._game.load.audio("badballDie", "../../assets/sfx/explosion-3.wav");
  },

  sfx: ["badballBump", "badballDie"],

  create: function (ballOptions) {
    ballOptions = typeof (ballOptions) == "undefined" ? {} : ballOptions;

    ballOptions.name = "badball";
    ballOptions.spriteName = "badball";

    ballOptions.allowGravity = true;
    ballOptions.speed = ballOptions.speed || 100;

    var ballUpdate = function () {

      if (this.body !== null) {
        this.body.velocity.x *= 0.95;
      }

      if (this.x >= (this.toybox.game.width - (Math.abs(this.width) / 2) ) || (this.x <= (Math.abs(this.width) / 2) )) {
        this.turnAround();
      }

      var targetPoint = this.findTarget();

      this.xDir = (this.scale.x < 0) ? 1 : -1

      if (typeof(targetPoint) == undefined) {
        return
      } else if ((targetPoint.x < this.x && this.xDir == 1) || (targetPoint.x > this.x && this.xDir == -1)) {
        this.turnAround();
      }

      if (this.timeToMove && !this.isHit && (this.body && (this.body.onFloor() || this.body.touching.down))) {
        this.animations.play("idle");
        this.timeToMove = false;

        this.body.velocity.x = (-1 * this.speed * this.scale.x);
        var thisBall = this;
        this.toybox.game.time.events.add(500, function () {
          thisBall.timeToMove = true;
        }, this);
      }

    };

    ballOptions.update = ballUpdate;

    var ballCollide = function (ball, collidedSprite) {
      var horizDis = collidedSprite.x - ball.x;
      var isBlocked = ((horizDis < 0 && ball.scale.x > 0) || (horizDis > 0 && ball.scale.x < 0));
      var ballIsAbove = (ball.y + ball.height / 2) <= (collidedSprite.y - collidedSprite.height / 2);
      if (isBlocked && !ballIsAbove) {
        ball.turnAround();
      }

    }

    ballOptions.collide = ballCollide;

    var badballGO = this.toybox.add.mob(ballOptions);

    badballGO.turnAround = function () {
      if (!this.canTurnAround) {
        return;
      }
      this.scale.x *= -1;
      this.toybox.sfx.badballBump.play();
      this.canTurnAround = false;
      var thisBall = this;
      this.toybox.game.time.events.add(500, function () {
        thisBall.canTurnAround = true;
      }, this);
    }

    badballGO.hit = function () {
      if (this.isHit) {
        return;
      }
      this.isHit = true;
      this.health -= 1;
      this.animations.play("dead");
      this.events.onUpdate.add(function(){
        if (thisBall.health <= 0) {
          this.rotation += 0.5;
        }
      }, this);
      for (var i = this.children.length - 1; i >= 0; i--) {
        this.children[i].drop();
      }
      this.toybox.sfx.badballDie.play();
      var thisBall = this;
      this.toybox.game.time.events.add(1000, function () {
        if (thisBall.health <= 0) {
          thisBall.kill();
        } else {
          this.rotation = 0;
          thisBall.animations.play("idle");
          thisBall.isHit = false;
        }
      }, this);
    }

    badballGO.findTarget = function () {
      target = (this.xDir < 0) ? new Phaser.Point(0, 0) : new Phaser.Point(this.toybox.game.width, 0);
      return target;
    }

    var fps = this.toybox.animationFPS;
    badballGO.animations.add("dead", [1]);
    badballGO.animations.add("idle", [0, 1, 2, 3, 4, 5], fps, true);
    
    badballGO.speed = 66;
    badballGO.timeToMove = true;
    badballGO.canTurnAround = true;
    badballGO.isHit = false;
    badballGO.scale.x *= (ballOptions.facing == "right") ? -1 : 1;

    return badballGO;
  }

};
