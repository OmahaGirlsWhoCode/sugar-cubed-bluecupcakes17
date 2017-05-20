// Coin is a collectible that can only be collected by players, and increase the player's score.
// Coins will eventually dissappear by default, but that can be changed.
// Gold coins are worth 100
// Silver coins are worth 10
// Bronze coins are worth 1

// collectibleOptions attributes:
//     spriteName: string, name of spritesheet loaded in preload
//     spriteIndex: number, starting sprite in spritesheet
//     startingX: number, initial X location for sprite's center
//     startingY: number, initial Y location for sprite's center
//     scale: number, the size of the sprite as a multiple
//
//  unique coinOption attributes:
//      color: string, determines sprite color, bounce, and score value
//          valid values: "bronze", "silver", "gold"
//      killAge: how many update cycles before the coin disappears. 'false' will make the coin last forever.

var coinToyboxPlugin = {
    name: "coin",
    toyboxType: "collectible",

    preload: function(toyboxObject){
        toyboxObject._game.load.spritesheet("coins", "../../assets/sprites/coinsSheet.png", 16, 16);
        toyboxObject._game.load.spritesheet("poof", "../../assets/sprites/poofSheet.png", 16, 24);
        toyboxObject._game.load.audio("coinCollected", "../../assets/sfx/coin-1.wav");
    },

    sfx: ["coinCollected"],

    create: function(coinOptions){
      coinOptions = typeof (coinOptions) == "undefined" ? {} : coinOptions;

        var randomizeCoin = function() {
            var probability = toybox.diceRoll(50);
            if (probability <= 25) {
                return "bronze";
            } else if (probability <= 45){
                return "silver";
            } else {
                return "gold";
            }
        }

        coinOptions.spriteName = "coins";
        coinOptions.color = coinOptions.color || randomizeCoin();
        coinOptions.name = coinOptions.color + "Coin";

        var ageCoin = function(){
            if(this.killAge == false){
                return;
            }
            this.age = this.age || 0;
            if (this.age >= this.killAge){
                this.kill();
            } else {
                this.age++;
            }
        }

        coinOptions.update = ageCoin;

        var tryIncreaseCurrency = function(coin, collidedSprite) {
            if (collidedSprite.isPlayer()) {
                if (typeof(collidedSprite.score) == "undefined"){
                    collidedSprite.score = 0;
                }
                collidedSprite.score += coin.currencyValue;
                this.toybox.sfx.coinCollected.play();
                coin.kill();
            }
        }

        coinOptions.collide = tryIncreaseCurrency;

        var coinKill = function(coin){
            var poofOptions = {
                startingX: coin.x,
                startingY: coin.y,
                spriteName: "poof",
                sendTo: "top"
            }
            var poofGO = this.toybox.add.decoration(poofOptions);
            poofGO.animations.add("poof", [0, 1, 2, 3], this.toybox.animationFPS, true);
            poofGO.animations.play("poof");
            this.game.time.events.add(250, function(){ poofGO.kill(); }, this);

        }

        coinOptions.kill = coinKill;

        switch (coinOptions.color){
            case "gold":
                coinOptions.spriteIndex = 2;
                coinOptions.bounce = 0.75;
                var currencyValue = 100;
            break;
            case "silver":
                coinOptions.spriteIndex = 1;
                coinOptions.bounce = 0.5;
                var currencyValue = 10;
            break;
            default:
                coinOptions.spriteIndex = 0;
                coinOptions.bounce = 0.25;
                var currencyValue = 1;
            break;
        }
        var coinGO = this.toybox.add.collectible(coinOptions);
        coinGO.killAge = (typeof(coinOptions.killAge) !== "undefined") ? coinOptions.killAge : 1000;
        coinGO.currencyValue = currencyValue;
        return coinGO;
    }

};
