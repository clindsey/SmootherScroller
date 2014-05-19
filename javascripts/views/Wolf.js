window.require.register("views/Wolf", function(require, module) {var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Wolf.View', gamecore.Pooled.extend('Wolf', {
  create: function(wolfModel, viewportModel) {
    var wolfView;
    wolfView = this._super();
    wolfView.offsetX = 0;
    wolfView.offsetY = 0;
    wolfView.model = wolfModel;
    wolfView.viewportModel = viewportModel;
    wolfView.spriteSheet = new createjs.SpriteSheet(this.spriteSheetOptions);
    wolfView.el = new createjs.Sprite(wolfView.spriteSheet, 'sleepSouth');
    EventBus.addEventListener("!move:" + wolfModel.uniqueId, wolfView.onModelMove, wolfView);
    EventBus.addEventListener("!move:" + viewportModel.uniqueId, wolfView.setPosition, wolfView);
    wolfView.setPosition();
    _.bindAll(wolfView, 'onTick');
    wolfView.el.addEventListener('tick', wolfView.onTick);
    return wolfView;
  },
  spriteSheetOptions: {
    images: [utils.tilesetImg],
    frames: {
      width: config.tileWidth,
      height: config.tileHeight
    },
    animations: {
      restingEast: {
        frames: [288, 289, 290, 291],
        speed: 0.5
      },
      restingNorth: {
        frames: [292, 293, 294, 295],
        speed: 0.5
      },
      restingWest: {
        frames: [296, 297, 298, 299],
        speed: 0.5
      },
      restingSouth: {
        frames: [300, 301, 302, 303],
        speed: 0.5
      },
      workingSouth: {
        frames: [320, 321],
        speed: 0.1
      },
      workingWest: {
        frames: [322, 323],
        speed: 0.1
      },
      workingNorth: {
        frames: [324, 325],
        speed: 0.1
      },
      workingEast: {
        frames: [326, 327],
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
});
