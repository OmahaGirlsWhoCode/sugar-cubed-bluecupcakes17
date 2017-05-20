class ToyboxGameObjectFactory {
    constructor(toybox) {
        this.toybox = toybox;
        //this.playerGO = null;
    }

    // objectOptions attributes:
    //     spriteName: string, name of spritesheet loaded in preload
    //     spriteIndex: number, starting sprite in spritesheet
    //     startingX: number, initial X location for sprite's center
    //     startingY: number, initial Y location for sprite's center
    //     scale: number, the size of the sprite as a multiple
    //     update: function, this is run every update cycle
    //     collide: function, this is added to the sprite's onCollide signal
    //     kill: function, this is added to the sprite's onKilled signal
    //     enablePhysics: boolean, true: sprite collides with other sprites
    //     allowGravity: boolean, true: sprite falls with gravity
    //     immovable: boolean, true: object will be fixed in place and cannot move
    //     collideWorld: boolean, true: object will collide with the edges of the game
    //     bounce: number, how elastic collisions with this object are
    //     name: string, name of the object type, meant mostly for debugging
    //

    toyboxObject(objectOptions) {
        objectOptions.spriteIndex = objectOptions.spriteIndex || 0;
        objectOptions.bounce = objectOptions.bounce || 0;
        objectOptions.scale = objectOptions.scale || 1;
        objectOptions.enablePhysics = typeof (objectOptions.enablePhysics) == "undefined" ? true : objectOptions.enablePhysics;
        objectOptions.allowGravity = typeof (objectOptions.allowGravity) == "undefined" ? true : objectOptions.allowGravity;
        objectOptions.immovable = typeof (objectOptions.immovable) == "undefined" ? false : objectOptions.immovable;
        objectOptions.collideWorld = typeof (objectOptions.collideWorld) == "undefined" ? true : objectOptions.collideWorld;

        var objectGO = this.toybox.game.add.sprite(objectOptions.startingX, objectOptions.startingY, objectOptions.spriteName, objectOptions.spriteIndex);

        objectGO.scale.x = objectOptions.scale;
        objectGO.scale.y = objectOptions.scale;
        objectGO.anchor.setTo(0.5, 0.5);

        objectGO.name = objectOptions.name;

        objectGO.isBlock = function(){
            return objectGO.toyboxType == "block";
        }

        objectGO.isPlayer = function(){
            return objectGO.toyboxType == "player";
        }

        objectGO.isDecoration = function(){
            return objectGO.toyboxType == "decoration";
        }

        objectGO.isCollectible = function(){
            return objectGO.toyboxType == "collectible";
        }

        objectGO.isMob = function(){
            return objectGO.toyboxType == "mob";
        }

        if (objectOptions.enablePhysics){
            this.toybox.game.physics.enable(objectGO);

            if (typeof (objectOptions.dX) !== "undefined") {
                objectGO.body.velocity.x = objectOptions.dX;
            }
            if (typeof (objectOptions.dY) !== "undefined") {
                objectGO.body.velocity.y = objectOptions.dY;
            }

            objectGO.body.collideWorldBounds = objectOptions.collideWorld;
            objectGO.body.bounce.set(objectOptions.bounce);
            objectGO.body.allowGravity = objectOptions.allowGravity;
            objectGO.body.immovable = objectOptions.immovable;
            objectGO.body.drag.x = (typeof(objectOptions.drag) != "undefined") ? objectOptions.drag : objectGO.body.drag.x;

            objectGO.body.onCollide = new Phaser.Signal();
            if (typeof (objectOptions.collide) == "function") {
                objectGO.body.onCollide.add(objectOptions.collide, toybox);
            }
        }

        objectGO.events.onUpdate = new Phaser.Signal();
        if(typeof (objectOptions.update) == "function"){
          objectGO.events.onUpdate.add(objectOptions.update, objectGO);
        }

        if (typeof (objectOptions.kill) == "function") {
            objectGO.events.onKilled.addOnce(objectOptions.kill);
        }

        objectGO.events.onKilled.addOnce(function(){
            objectGO.toybox.game.time.events.add(2000, function(){
                this.destroy();
                var cGO = this.toybox.currentGameObjects;
                var index = cGO.indexOf(this);
                cGO.splice(index,1);
            }, objectGO);
        });

        objectGO.toybox = this.toybox;
        return objectGO;
    }

    // playerOptions attributes:
    //     spriteName: string, name of spritesheet loaded in preload
    //     spriteIndex: number, starting sprite in spritesheet
    //     startingX: number, initial X location for sprite's center
    //     startingY: number, initial Y location for sprite's center
    //     scale: number, the size of the sprite as a multiple
    //     update: function, this is run every update cycle
    //     collide: function, this is added to the sprite's onCollide signal
    //     kill: function, this is added to the sprite's onKilled signal
    //     enablePhysics: boolean, true: sprite collides with other sprites
    //     allowGravity: boolean, true: sprite falls with gravity
    //     immovable: boolean, true: object will be fixed in place and cannot move
    //     collideWorld: boolean, true: object will collide with the edges of the game
    //     bounce: number, how elastic collisions with this object are
    //     name: string, name of the object type, meant mostly for debugging
    //     facing: string ("left" or "right") determines the direction the sprite starts out facing.
    //     speed: number, represents the speed the player will move when activated
    //     jumpForce: number, represents how hard a player will jump
    //     controls: object, contains key-value pairs of keycodes and named controls

    player(playerOptions) {
        if(typeof(playerOptions) == "undefined"){
          playerOptions = {};
        }
        playerOptions.name = "player";

        var playerGO = this.toybox.add.toyboxObject(playerOptions);

        playerGO.speed = playerOptions.speed;
        playerGO.jumpForce = playerOptions.jumpForce;
        playerGO.score = 0;
        this.playerAttachControls(playerGO,playerOptions.controls);
        this.toybox.addPlayer(playerGO);
        playerGO.toyboxType = "player";
        return playerGO;
    }

    playerAttachControls(playerGO,controlsObject){
        playerGO.controls = {};
        if (typeof(controlsObject) == "undefined"){
            return;
        }
        for (var i = Object.keys(controlsObject).length - 1; i >= 0; i--) {
            var controlName = Object.keys(controlsObject)[i];
            playerGO.controls[controlName] = this.toybox.game.input.keyboard.addKey(controlsObject[controlName]);
        }
    }

    // collectibleOptions attributes:
    //     spriteName: string, name of spritesheet loaded in preload
    //     spriteIndex: number, starting sprite in spritesheet
    //     startingX: number, initial X location for sprite's center
    //     startingY: number, initial Y location for sprite's center
    //     scale: number, the size of the sprite as a multiple
    //     update: function, this is run every update cycle
    //     collide: function, this is added to the sprite's onCollide signal
    //     kill: function, this is added to the sprite's onKilled signal
    //     enablePhysics: boolean, true: sprite collides with other sprites
    //     allowGravity: boolean, true: sprite falls with gravity
    //     immovable: boolean, true: object will be fixed in place and cannot move
    //     collideWorld: boolean, true: object will collide with the edges of the game
    //     bounce: number, how elastic collisions with this object are
    //     name: string, name of the object type, meant mostly for debugging


    collectible(collectibleOptions) {
        collectibleOptions.spriteIndex = collectibleOptions.spriteIndex || 0;
        collectibleOptions.bounce = collectibleOptions.bounce || 0;
        collectibleOptions.scale = collectibleOptions.scale || 1;

        var collectibleGO = this.toybox.add.toyboxObject(collectibleOptions);

        collectibleGO.toyboxType = "collectible";
        this.toybox.addCollectible(collectibleGO);
        return collectibleGO;
    }

    // blockOptions attributes:
    //     spriteName: string, name of spritesheet loaded in preload
    //     spriteIndex: number, starting sprite in spritesheet
    //     startingX: number, initial X location for sprite's center
    //     startingY: number, initial Y location for sprite's center
    //     scale: number, the size of the sprite as a multiple
    //     update: function, this is run every update cycle
    //     collide: function, this is added to the sprite's onCollide signal
    //     kill: function, this is added to the sprite's onKilled signal
    //     enablePhysics: boolean, true: sprite collides with other sprites
    //     allowGravity: boolean, true: sprite falls with gravity
    //     immovable: boolean, true: object will be fixed in place and cannot move
    //     collideWorld: boolean, true: object will collide with the edges of the game
    //     bounce: number, how elastic collisions with this object are
    //     name: string, name of the object type, meant mostly for debugging

    block(blockOptions) {
        blockOptions.spriteIndex = blockOptions.spriteIndex || 0;
        blockOptions.bounce = blockOptions.bounce || 0;
        blockOptions.scale = blockOptions.scale || 1;
        blockOptions.drag = blockOptions.drag || 200;

        var blockGO = this.toybox.add.toyboxObject(blockOptions);
        blockGO.toyboxType = "block";
        this.toybox.addBlock(blockGO);
        return blockGO;
    }

    // decorationOptions attributes:
    //     spriteName: string, name of spritesheet loaded in preload
    //     spriteIndex: number, starting sprite in spritesheet
    //     startingX: number, initial X location for sprite's center
    //     startingY: number, initial Y location for sprite's center
    //     scale: number, the size of the sprite as a multiple
    //     update: function, this is run every update cycle
    //     collide: function, this is added to the sprite's onCollide signal
    //     kill: function, this is added to the sprite's onKilled signal
    //     enablePhysics: boolean, true: sprite collides with other sprites
    //     allowGravity: boolean, true: sprite falls with gravity
    //     immovable: boolean, true: object will be fixed in place and cannot move
    //     collideWorld: boolean, true: object will collide with the edges of the game
    //     name: string, name of the object type, meant mostly for debugging
    //     sendTo: string, 'top' or 'bottom', determines whether decoration is drawn above or below all other sprites

    decoration(decoOptions) {
        decoOptions.spriteIndex = decoOptions.spriteIndex || 0;
        decoOptions.bounce = 0;
        decoOptions.scale = decoOptions.scale || 1;
        decoOptions.enablePhysics = typeof (decoOptions.enablePhysics) == "undefined" ? false : decoOptions.enablePhysics;

        var decoGO = this.toybox.add.toyboxObject(decoOptions);
        decoGO.toyboxType = "decoration";
        decoGO.sendTo = decoOptions.sendTo || 'bottom';
        this.toybox.addDecoration(decoGO);
        return decoGO;
    }

    // mobOptions attributes:
    //     spriteName: string, name of spritesheet loaded in preload
    //     spriteIndex: number, starting sprite in spritesheet
    //     startingX: number, initial X location for sprite's center
    //     startingY: number, initial Y location for sprite's center
    //     scale: number, the size of the sprite as a multiple
    //     update: function, this is run every update cycle
    //     collide: function, this is added to the sprite's onCollide signal
    //     kill: function, this is added to the sprite's onKilled signal
    //     enablePhysics: boolean, true: sprite collides with other sprites
    //     allowGravity: boolean, true: sprite falls with gravity
    //     immovable: boolean, true: object will be fixed in place and cannot move
    //     collideWorld: boolean, true: object will collide with the edges of the game
    //     bounce: number, how elastic collisions with this object are
    //     name: string, name of the object type, meant mostly for debugging
    //     facing: string ("left" or "right") determines the direction the sprite starts out facing.

    mob(mobOptions) {
        var mobGO = this.toybox.add.toyboxObject(mobOptions);
        mobGO.speed = mobOptions.speed;
        mobGO.jumpforce = mobOptions.speed;
        this.toybox.addMob(mobGO);
        mobGO.toyboxType = "mob";
        return mobGO;
    }

    text(x,y,text,styleObject) {
        var textGO = this.toybox.game.add.text(x,y,text,styleObject);

        textGO.events.onUpdate = new Phaser.Signal();

        this.toybox.addText(textGO);
        return textGO;
    }

}
