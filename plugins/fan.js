// a fan is an object blows objects above it upwards

// blockOptions attributes:
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     kill: function, this is added to the sprite's onKilled signal
//     allowGravity: boolean, true: sprite falls with gravity
//     immovable: boolean, true: object will be fixed in place and cannot move
//     collideWorld: boolean, true: object will collide with the edges of the game
//     bounce: number, how elastic collisions with this object are

// unique fanOptions attributes
//      height: number, the height of the area above the fan affected
//      blowStrength: number, how much the fan pushes upward each update cycle

var fanToyboxPlugin = {
    name: "fan",
    toyboxType: "block",
    preload: function (toyboxObject) {
        toyboxObject._game.load.spritesheet("fan", "../../assets/sprites/fan.png", 32, 16);
    },
    create: function (fanOptions) {
        fanOptions.height = fanOptions.height || 100;
        fanOptions.blowStrength = fanOptions.blowStrength || 50;
        fanOptions.spriteName = "fan";

        var blowObjects = function() {
            gos = this.toybox.currentGameObjects;
            var pointsArray = [];
            pointsArray.push( new Phaser.Point(this.x - this.width * 0.5, this.y - this.blowHeight - this.height * 0.5) ); // top left
            pointsArray.push( new Phaser.Point( this.x + this.width * 0.5, this.y - this.blowHeight - this.height * 0.5 ) ); // top right
            pointsArray.push( new Phaser.Point( this.x + this.width * 0.5, this.y - this.height * 0.5 ) ); // bottom right
            pointsArray.push( new Phaser.Point( this.x - this.width * 0.5, this.y - this.height * 0.5 ) ); // bottom left
            for (var i = pointsArray.length - 1; i >= 0; i--) {
                pointsArray[i].rotate(this.x,this.y,this.rotation);
            }
            var blowRect = new Phaser.Polygon(pointsArray);
            for (var i = 0; i < gos.length; i++) {
                if (blowRect.contains(gos[i].x, gos[i].y)) {
                    var blowDir = this.rotation - Math.PI * 0.5;
                    var normalizedDir = new Phaser.Point( Math.cos(blowDir), Math.sin(blowDir));
                    var dist = Phaser.Math.distance(this.x, this.y, gos[i].x, gos[i].y);
                    var distanceModifier = Phaser.Math.linear(1, 0.25, dist / this.blowHeight);
                    if (typeof(gos[i].body) !== "undefined" && gos[i].body !== null){
                        if (!(gos[i].body.immovable)){
                            gos[i].body.velocity.x += normalizedDir.x * this.blowStrength * distanceModifier;
                            gos[i].body.velocity.y += normalizedDir.y * this.blowStrength * distanceModifier;
                        }
                    }
                }
            }
            if(fanOptions.draw){
              this.graphics.clear();
              this.graphics.beginFill(0xffffff);
              this.graphics.drawRect(blowRect.x, blowRect.y, blowRect.width, blowRect.height);
            }
        }
        fanOptions.update = blowObjects;
        var fanGO = this.toybox.add.block(fanOptions);
        fanGO.blowHeight = fanOptions.height;
        fanGO.blowStrength = fanOptions.blowStrength;
        fanGO.animations.add("blow", [0,1,2,3], 24, true);
        fanGO.animations.play("blow");
        if(fanOptions.draw){
          fanGO.graphics = this.toybox.game.add.graphics(0,0);
        }
        return fanGO;
    }
};
