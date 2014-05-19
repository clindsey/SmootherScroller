window.require.register("models/Wolf", function(require, module) {var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Wolf.Model', gamecore.Pooled.extend('WolfModel', {
  create: function(x, y, tileMapModel, entityManagerView) {
    var wolfModel;
    wolfModel = this._super();
    wolfModel.x = x;
    wolfModel.y = y;
    wolfModel.path = [];
    wolfModel.direction = 'South';
    wolfModel.tileMapModel = tileMapModel;
    wolfModel.entityManagerView = entityManagerView;
    wolfModel.moving = false;
    wolfModel.stateMachine = this.stateMachine(wolfModel);
    wolfModel.minimapColor = '#b03c25';
    return wolfModel;
  },
  stateMachine: function(wolfModel) {
    return StateMachine.create({
      initial: 'resting',
      events: [
        {
          name: 'work',
          from: 'resting',
          to: 'working'
        }, {
          name: 'work',
          from: 'working',
          to: 'working'
        }, {
          name: 'rest',
          from: 'working',
          to: 'resting'
        }
      ],
      callbacks: {
        onrest: function() {
          var path, result;
          result = wolfModel.getPathToNearestRabbit();
          path = result.path;
          if (path.length) {
            wolfModel.path = path;
            wolfModel.moving = true;
            return wolfModel.targetRabbit = result.model;
          }
        },
        onwork: function() {
          if (wolfModel.path.length <= 1 && wolfModel.targetRabbit) {
            return wolfModel.targetRabbit.energy -= 2;
          }
        }
      }
    });
  }
}, {
  getPathToNearestRabbit: function() {
    var nearestRabbit, path, rabbitModel, rabbitModels, rabbitProximityManager, shortestPath, _i, _len;
    rabbitProximityManager = this.entityManagerView.rabbitProximityManager;
    rabbitModels = rabbitProximityManager.getNeighbors(this);
    shortestPath = [];
    nearestRabbit = void 0;
    for (_i = 0, _len = rabbitModels.length; _i < _len; _i++) {
      rabbitModel = rabbitModels[_i];
      path = this.getPath(rabbitModel);
      if (path.length > 1) {
        if (shortestPath.length === 0) {
          shortestPath = path;
          nearestRabbit = rabbitModel;
        } else if (path.length < shortestPath.length) {
          shortestPath = path;
          nearestRabbit = rabbitModel;
        }
      }
    }
    return {
      path: shortestPath,
      model: nearestRabbit
    };
  },
  setPosition: function(x, y) {
    if (x !== this.x || y !== this.y) {
      this.x = x;
      this.y = y;
      return EventBus.dispatch("!move:" + this.uniqueId);
    }
  },
  tick: function() {
    if (this.moving) {
      this.followPath();
      this.stateMachine.work();
      return this.stateMachine.rest();
    } else {
      switch (this.stateMachine.current) {
        case 'working':
          return this.stateMachine.rest();
        case 'resting':
          return this.stateMachine.work();
      }
    }
  },
  getPath: function(targetModel) {
    var path;
    path = this.tileMapModel.findPath(this.x, this.y, targetModel.x, targetModel.y, 60, 60);
    return path;
  },
  followPath: function() {
    var dX, dY, nearPath, newDirection, newX, newY, path;
    path = this.path;
    nearPath = path.shift();
    this.path = path;
    if (!this.path.length) {
      this.moving = false;
    }
    if (!((nearPath != null) && !!nearPath.length)) {
      return;
    }
    dX = nearPath[0];
    dY = nearPath[1];
    newX = utils.clamp(this.x + dX, config.worldTileWidth);
    newY = utils.clamp(this.y + dY, config.worldTileHeight);
    newDirection = 'South';
    if (dX > 0) {
      this.direction = 'East';
    }
    if (dX < 0) {
      this.direction = 'West';
    }
    if (dY > 0) {
      this.direction = 'South';
    }
    if (dY < 0) {
      this.direction = 'North';
    }
    return this.setPosition(newX, newY);
  },
  dispose: function() {
    return this.release();
  }
}));
});
