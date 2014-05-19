var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Rabbit.View', gamecore.Pooled.extend('RabbitView', {
  create: function(rabbitModel, viewportModel) {
    var rabbitView;
    rabbitView = this._super();
    rabbitView.offsetX = 0;
    rabbitView.offsetY = 0;
    rabbitView.model = rabbitModel;
    rabbitView.viewportModel = viewportModel;
    rabbitView.spriteSheet = new createjs.SpriteSheet(this.spriteSheetOptions);
    rabbitView.el = new createjs.Sprite(rabbitView.spriteSheet, 'walkEast');
    EventBus.addEventListener("!move:" + rabbitModel.uniqueId, rabbitView.onModelMove, rabbitView);
    EventBus.addEventListener("!move:" + viewportModel.uniqueId, rabbitView.setPosition, rabbitView);
    rabbitView.setPosition();
    _.bindAll(rabbitView, 'onTick');
    rabbitView.el.addEventListener('tick', rabbitView.onTick);
    return rabbitView;
  },
  spriteSheetOptions: {
    images: [utils.tilesetImg],
    frames: {
      width: config.tileWidth,
      height: config.tileHeight
    },
    animations: {
      restingEast: {
        frames: [304, 305, 306, 307],
        speed: 0.5
      },
      restingNorth: {
        frames: [308, 309, 310, 311],
        speed: 0.5
      },
      restingWest: {
        frames: [312, 313, 314, 315],
        speed: 0.5
      },
      restingSouth: {
        frames: [316, 317, 318, 319],
        speed: 0.5
      },
      workingSouth: {
        frames: [328, 329],
        speed: 0.1
      },
      workingWest: {
        frames: [330, 331],
        speed: 0.1
      },
      workingNorth: {
        frames: [332, 333],
        speed: 0.1
      },
      workingEast: {
        frames: [334, 335],
        speed: 0.1
      }
    }
  }
}, {
  onModelMove: function() {
    var dX, dY;
    dX = 0;
    dY = 0;
    switch (this.model.direction) {
      case 'North':
        dY = config.tileHeight;
        break;
      case 'East':
        dX = 0 - config.tileWidth;
        break;
      case 'South':
        dY = 0 - config.tileHeight;
        break;
      case 'West':
        dX = config.tileWidth;
    }
    this.offsetX = dX;
    this.offsetY = dY;
    createjs.Tween.get(this).to({
      offsetX: 0,
      offsetY: 0
    }, 450);
    return this.setPosition();
  },
  setPosition: function() {
    var animation, centerX, centerY, halfWorldHeight, halfWorldWidth, myNewX, myNewY, myX, myY, newX, newY, offsetX, offsetY, viewX, viewY, worldHeight, worldWidth, x, y;
    animation = "" + this.model.stateMachine.current + this.model.direction;
    if (this.el.currentAnimation !== animation) {
      this.el.gotoAndPlay(animation);
    }
    centerX = Math.floor(this.viewportModel.width / 2);
    centerY = Math.floor(this.viewportModel.height / 2);
    viewX = this.viewportModel.x;
    viewY = this.viewportModel.y;
    myX = this.model.x;
    myY = this.model.y;
    x = (myX - viewX) + centerX;
    y = (myY - viewY) + centerY;
    worldWidth = config.worldTileWidth;
    halfWorldWidth = Math.floor(worldWidth / 2);
    worldHeight = config.worldTileHeight;
    halfWorldHeight = Math.floor(worldHeight / 2);
    offsetX = 0;
    offsetY = 0;
    if (myX > viewX + halfWorldWidth) {
      offsetX -= worldWidth;
    }
    if (myX < viewX - halfWorldWidth) {
      offsetX += worldWidth;
    }
    if (myY > viewY + halfWorldHeight) {
      offsetY -= worldHeight;
    }
    if (myY < viewY - halfWorldHeight) {
      offsetY += worldHeight;
    }
    myNewX = x + offsetX;
    myNewY = y + offsetY;
    newX = myNewX * config.tileWidth;
    newY = myNewY * config.tileHeight;
    this.intendedX = newX;
    return this.intendedY = newY;
  },
  onTick: function() {
    this.el.x = this.intendedX + this.offsetX;
    return this.el.y = this.intendedY + this.offsetY;
  },
  dispose: function() {
    EventBus.removeEventListener("!move:" + this.viewportModel.uniqueId, this.setPosition, this);
    EventBus.removeEventListener("!move:" + this.model.uniqueId, this.onModelMove, this);
    return this.release();
  }
}));
