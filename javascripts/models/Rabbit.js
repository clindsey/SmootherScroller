window.require.register("models/Rabbit", function(require, module) {var config, utils;

require('utils');

require('config');

utils = moduleLibrary.get('utils');

config = moduleLibrary.get('config');

moduleLibrary.define('Rabbit.Model', gamecore.Pooled.extend('RabbitModel', {
  create: function(x, y, tileMapModel, entityManagerView) {
    var rabbitModel;
    rabbitModel = this._super();
    rabbitModel.x = x;
    rabbitModel.y = y;
    rabbitModel.energy = 15;
    rabbitModel.eatCount = 0;
    rabbitModel.direction = 'South';
    rabbitModel.tileMapModel = tileMapModel;
    rabbitModel.entityManagerView = entityManagerView;
    rabbitModel.minimapColor = '#ff9600';
    rabbitModel.moving = false;
    rabbitModel.stateMachine = this.stateMachine(rabbitModel);
    return rabbitModel;
  },
  stateMachine: function(rabbitModel) {
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
          result = rabbitModel.getPathToNearestCarrot();
          path = result.path;
          if (path.length) {
            rabbitModel.path = path;
            rabbitModel.moving = true;
            return rabbitModel.targetCarrot = result.model;
          }
        },
        onwork: function() {
          var ateCarrot;
          ateCarrot = rabbitModel.entityManagerView.removeCarrot(rabbitModel.targetCarrot);
          if (ateCarrot) {
            rabbitModel.energy += 10;
            rabbitModel.eatCount += 1;
            if (rabbitModel.eatCount % 2 === 0) {
              return rabbitModel.entityManagerView.spawnRabbit(rabbitModel);
            }
          }
        }
      }
    });
  }
}, {
  getPathToNearestCarrot: function() {
    var carrotModel, carrotModels, carrotProximityManager, nearestCarrot, path, shortestPath, _i, _len;
    carrotProximityManager = this.entityManagerView.carrotProximityManager;
    carrotModels = carrotProximityManager.getNeighbors(this);
    shortestPath = [];
    nearestCarrot = void 0;
    for (_i = 0, _len = carrotModels.length; _i < _len; _i++) {
      carrotModel = carrotModels[_i];
      if (carrotModel.marked) {
        continue;
      }
      if (carrotModel.maturity < 3) {
        continue;
      }
      path = this.getPath(carrotModel);
      if (path.length > 1) {
        if (shortestPath.length === 0) {
          shortestPath = path;
          nearestCarrot = carrotModel;
        } else if (path.length < shortestPath.length) {
          shortestPath = path;
          nearestCarrot = carrotModel;
        }
      }
    }
    if (nearestCarrot !== void 0) {
      nearestCarrot.marked = true;
    }
    return {
      path: shortestPath,
      model: nearestCarrot
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
    } else {
      switch (this.stateMachine.current) {
        case 'working':
          this.stateMachine.rest();
          break;
        case 'resting':
          if (this.energy < 30) {
            this.stateMachine.work();
          }
      }
    }
    this.energy -= 1;
    if (this.energy < 0) {
      if (this.targetCarrot) {
        this.targetCarrot.marked = false;
      }
      this.targetCarrot = void 0;
      return this.entityManagerView.removeRabbit(this);
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
