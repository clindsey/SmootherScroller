window.require.register("views/Carrot", function(require, module) {var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Carrot.View', gamecore.Pooled.extend('CarrotView', {
  create: function(carrotModel, viewportModel) {
    var carrotView;
    carrotView = this._super();
    carrotView.offsetX = 0;
    carrotView.offsetY = 0;
    carrotView.scrollX = 0;
    carrotView.scrollY = 0;
    carrotView.model = carrotModel;
    carrotView.viewportModel = viewportModel;
    carrotView.spriteSheet = new createjs.SpriteSheet(this.spriteSheetOptions);
    carrotView.el = new createjs.Sprite(carrotView.spriteSheet, ('first second third fourth'.split(' '))[carrotModel.maturity]);
    EventBus.addEventListener("!move:" + viewportModel.uniqueId, carrotView.setPosition, carrotView);
    carrotView.setPosition();
    _.bindAll(carrotView, 'onTick');
    carrotView.el.addEventListener('tick', carrotView.onTick);
    return carrotView;
  },
  spriteSheetOptions: {
    images: [utils.tilesetImg],
    frames: {
      width: config.tileWidth,
      height: config.tileHeight
    },
    animations: {
      first: {
        frames: [272]
      },
      second: {
        frames: [273]
      },
      third: {
        frames: [274]
      },
      fourth: {
        frames: [275]
      }
    }
  }
}, {
  setPosition: function() {
    var centerX, centerY, halfWorldHeight, halfWorldWidth, myNewX, myNewY, myX, myY, newX, newY, offsetX, offsetY, viewX, viewY, worldHeight, worldWidth, x, y;
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
    var animation;
    animation = ('first second third fourth'.split(' '))[this.model.maturity];
    if (this.el.currentAnimation !== animation) {
      this.el.gotoAndPlay(animation);
    }
    this.el.x = this.intendedX + this.scrollX;
    return this.el.y = this.intendedY + this.scrollY;
  },
  dispose: function() {
    EventBus.removeEventListener("!move:" + this.viewportModel.uniqueId, this.setPosition, this);
    return this.release();
  }
}));
});
