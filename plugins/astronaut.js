// astronaut is a player object made for basic platformer-style games.
// It has three controls: left, right, and fly

// playerOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     facing: string ("left" or "right") determines the direction the sprite starts out facing.
//     turnSpeed: number, represents the speed the player will move when activated
//     flyForce: number, represents how fast a player will fly - NOTE: These should be small numbers as it's how much speed to add EVERY FRAME!
//     controls: object, contains key-value pairs of keycodes and named controls
//
// unique astronautOptions attributes:
//      color: string, valid options: "green" "blue" "pink"
//      controls: object, needs to contains keycodes for left,right,fly


var astronautToyboxPlugin = {
	name: "astronaut",
	toyboxType: "player",

	preload: function (toyboxObject) {
		toyboxObject._game.load.spritesheet("astronaut", "../../assets/sprites/SpaceExplorerSheet.png", 16, 16);
		toyboxObject._game.load.spritesheet("heartsAndStar", "../../assets/sprites/heartsAndStarSheet.png", 16, 16);
		toyboxObject._game.load.audio("astronautHit", "../../assets/sfx/chirp-3.wav");
		toyboxObject._game.load.audio("astronautKill", "../../assets/sfx/zap-1.wav");

	},

	sfx: ["astronautJump", "astronautHit", "astronautKill"],

	create: function (astronautOptions) {
		astronautOptions = typeof (astronautOptions) == "undefined" ? {} : astronautOptions;
		const JOYSTICK_THRESHOLD = 0.15;
		var leftStickX = Phaser.Gamepad.XBOX360_STICK_LEFT_X;
		var leftStickY = Phaser.Gamepad.XBOX360_STICK_LEFT_Y;
		var rightStickX = Phaser.Gamepad.XBOX360_STICK_RIGHT_X;
		var rightStickY = Phaser.Gamepad.XBOX360_STICK_RIGHT_Y;
		var accelAxis = Phaser.Gamepad.XBOX360_RIGHT_TRIGGER;
		var decelAxis = Phaser.Gamepad.XBOX360_LEFT_TRIGGER;
		astronautOptions.allowGravity = false;
		astronautOptions.speed = astronautOptions.turnSpeed || 275;
		astronautOptions.flyForce = astronautOptions.flyForce || 1.5;
		astronautOptions.health = astronautOptions.health || 3;
		if (typeof (astronautOptions.controls) == "undefined") {
			astronautOptions.controls = {
				left: 37,
				right: 39,
				fly: 38
			}
		};
		astronautOptions.spriteName = "astronaut";

		var astronautUpdate = function () {
			if (this.isHit) {
				return;
			}

			if (this.health <= 0) {
				this.kill();
				return;
			}

			var usingGamepad = this.toybox.game.input.gamepad.padsConnected > 0;
			var padInput = getPadInput(this.controls.pad);
			this.body.angularVelocity = 0;
			if (this.controls.right.isDown || padInput.leftX > JOYSTICK_THRESHOLD) {
				var modifier = this.controls.right.isDown ? 1 : padInput.leftX;
				this.body.angularVelocity = this.speed * modifier;
			} else if (this.controls.left.isDown || padInput.leftX < -JOYSTICK_THRESHOLD) {
				var modifier = this.controls.left.isDown ? 1 : Math.abs(padInput.leftX);
				this.body.angularVelocity = -this.speed * modifier;
			}

			// checkForBoost
			var angularspeed = new Phaser.Point();
			if (this.controls.fly.isDown || padInput.accel > JOYSTICK_THRESHOLD) {
				this.toybox.game.physics.arcade.velocityFromAngle(this.angle + 90, this.flyForce, angularspeed);
				var modifier = this.controls.fly.isDown ? 1 : padInput.accel;
				this.body.velocity.x -= angularspeed.x * modifier;
				this.body.velocity.y -= angularspeed.y * modifier;
				if (this.animations.name !== "fly") {
					this.animations.play("fly");
				}
      }
			// else if (this.controls.down.isDown || padInput.decel > JOYSTICK_THRESHOLD) {
			// 	this.toybox.game.physics.arcade.velocityFromAngle(this.angle + 90, this.flyForce, angularspeed);
			// 	var modifier = this.controls.down.isDown ? 1 : padInput.decel;
			// 	this.body.velocity.x += angularspeed.x * modifier;
			// 	this.body.velocity.y += angularspeed.y * modifier;
			// 	if (this.animations.name !== "fly") {
			// 		this.animations.play("fly");
			// 	}
			// }
      else if (this.animations.name !== "idle") {
				this.animations.play("idle");
			}
		};

		var getPadInput = function (pad) {
			return {
				leftX: pad.axis(leftStickX),
				leftY: pad.axis(leftStickY),
				rightX: pad.axis(rightStickX),
				rightY: pad.axis(rightStickY),
				accel: pad.buttonValue(accelAxis),
				decel: pad.buttonValue(decelAxis),
			};
		};
		astronautOptions.update = typeof (astronautOptions.update) != "function" ? astronautUpdate : astronautOptions.update;

		var astronautCollide = function (astronaut, collidedSprite) {
			if (collidedSprite.isMob()) {
				if (collidedSprite.health > 0) {
					astronaut.hit();
				}
			}
		};

		astronautOptions.collide = astronautCollide;

		var astronautKill = function (astronaut) {
			var splosion = this.toybox.game.add.emitter(astronaut.x, astronaut.y, 12);
			this.toybox.topDecorations.add(splosion);
			splosion.makeParticles('heartsAndStar', [5]);
			splosion.gravity = 0;
			splosion.minParticleSpeed = new Phaser.Point(-400, -400);
			splosion.maxParticleSpeed = new Phaser.Point(400, 400);
			this.toybox.sfx.astronautKill.play();
			splosion.start(true, 4000, null, 12);
			this.toybox.players.remove(this);
			game.time.events.add(2000, function () {
				splosion.kill()
			}, this);

		}

		astronautOptions.kill = astronautKill;

		var astronautGO = this.toybox.add.player(astronautOptions);
		astronautGO.flyForce = astronautOptions.flyForce;
		astronautGO.health = astronautOptions.health;
		astronautGO.events.onHit = new Phaser.Signal();
		if (typeof (astronautOptions.onHit) == "function") {
			astronautGO.events.onHit.add(astronautOptions.onHit);
		}

		astronautGO.hit = function () {
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
			this.toybox.sfx.astronautHit.play();
			this.events.onHit.dispatch(this);
			var thisastronaut = this;
			this.toybox.game.time.events.add(500, function () {
				if (thisastronaut.health <= 0) {
					thisastronaut.kill();
				} else {
					thisastronaut.animations.play("idle");
					thisastronaut.isHit = false;
				}
			}, this);
		}

		var fps = this.toybox.animationFPS;
		astronautGO.animations.add("idle", [0]);
		astronautGO.animations.add("hit", [4]);
		astronautGO.animations.add("fly", [5, 6, 7], 24, true);

		astronautGO.isHit = false;
		astronautGO.scale.x *= (astronautOptions.facing == "right") ? 1 : -1;
		astronautGO.controls.pad = astronautOptions.pad || game.input.gamepad.pad1;
		return astronautGO;
	}


};
