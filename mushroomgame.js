var game = new Phaser.Game(640, 480, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update
});
var toybox;
var player;
var settings = {
    gravity: 980,
    demoMode:true,
    plugins: ["alien","slime","platform","coin","bullet"]
};


function preload() {
    toybox = new Toybox(game, settings);
    toybox.preload();
} 


var canshoot = true; 
function shoot (){
    if (player.controls.fire.isDown && canshoot)
    {
        toybox.add.bullet({
          startingX: this.x+20,
          startingY: this.y,
          speedVector: new Phaser.Point (70,0)
        });
    canshoot = false;
    game.time.events.add(500,function 
    (){
        canshoot = true;
    });
    }  
}
function create() {
  toybox.create();
  player = toybox.add.alien({
      controls:{
          left: 37,
          right: 39,
          jump: 38, 
          fire: 13
      }
  });
  player.events.onUpdate.add(shoot,player);
  toybox.add.slime({
    startingX: 40,
    startingY: 100
  });
    toybox.add.slime({
    startingX: 20,
    startingY: 15
  });  
 toybox.add.slime({
    startingX: 150,
    startingY: 31
  });  
  toybox.add.slime({
    startingX: 40,
    startingY: 100
  });
  toybox.add.platform({
      startingX: 100,
      startingY: 100,
      type: 4,
      width: 500,
      height: 40
       });
  toybox.add.platform({
      startingX: 200,
      startingY: 200,
      type: 4,
      width: 340,
      height: 35
       });
  toybox.add.platform({
      startingX: 1000,
      startingY: 1000,
      type: 4,
      width: 300,
      height: 30
       });
  toybox.add.platform({
      startingX: 20,
      startingY: 20,
      type: 4,
      width: 390,
      height: 90
       });
       toybox.add.platform({
      startingX: 310,
      startingY: 310,
      type: 4,
      width: 390,
      height: 50
       });
       toybox.add.bullet({
           speedVector: new Phaser.Point (-20,20),
           startingX:game.world.width,
           startingY:40
       });
}

function update() {
    toybox.update();
}
