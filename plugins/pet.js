// Pet is an unsual plugin because it requires other plugins to work.
// A pet is a mob/enemy that has been modified to follow the player without hurting it.
// When you create a pet, you pass it a 'type' that tells it what type of mob the pet is.
// currently, supported mob types are slime, jelly, and fly.

// mobOptions attributes:
//     spriteName: string, name of spritesheet loaded in preload
//     spriteIndex: number, starting sprite in spritesheet
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//     facing: string ("left" or "right") determines the direction the sprite starts out facing.
//
//  unique petOptions attributes:
//      color: string, determines mob type
//          valid values: "fly" "slime" "jelly"
//      color: string, determines speed and sprite color
//          valid values: determined by type
//      owner: the player object the pet should follow, will default to the first player added.

var petToyboxPlugin = {
 	name: "pet",
    toyboxType: "mob",

 	preload: function(toyboxObject){
        toyboxObject._game.load.spritesheet("heartsAndStar", "../../assets/sprites/heartsAndStarSheet.png", 16, 16);
 	},

    sfx: [],

 	create: function(petOptions){

        if (typeof(this.toybox.loadedPlugins[petOptions.type]) !== "undefined"){
            petGO = this.toybox.add[petOptions.type](petOptions);
        } else {
            console.log(petOptions.type + ' plugin was not found, cannot make pet');
            return;
        };

        petGO.name = "pet-" + petGO.name;

        petGO.owner = (typeof(petOptions.owner) !== "undefined")? petOptions.owner : this.toybox.players.children[0];

        petGO.findTarget = function(){
            if (this.canMakeHeart && this.health > 0){
                this.canMakeHeart = false;
                this.makeHeart();
                var thisPet = this;
                this.toybox.game.time.events.add(250, function(){
                    thisPet.canMakeHeart = true;
                } , this);
            }
            return this.owner;
        };

        petGO.isPlayer = function(){
            return true;
        };

        petGO.isMob = function(){
            return false;
        };

        petGO.canMakeHeart = true;

        petGO.makeHeart = function(){
            var heartOptions = {
                spriteName: "heartsAndStar",
                spriteIndex: 4,
                startingX: this.x + Phaser.Math.between(-4,4),
                startingY: this.y - (this.height / 2) - 4 + Phaser.Math.between(-4,4),
                scale: 0.5,
                sendTo: "top",
                update: function(){
                    this.timer = ((this.timer + 1 ) % 60);
                    this.y -= 0.5;
                    var dX = Math.sin( this.timer * 7.28 / 60 )
                    this.x += dX;
                    this.alpha -= 0.01;
                    this.scale.x *= 1.01;
                    this.scale.y *= 1.01;
                }
            };
            newHeart = this.toybox.add.decoration(heartOptions);
            newHeart.timer = Phaser.Math.between(0,20);
            this.toybox.game.time.events.add(750, this.destroy , newHeart);
        };

        return petGO;
 	}

};
