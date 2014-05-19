var config;

require('config');

config = moduleLibrary.get('config');

moduleLibrary.define('Stage.View', gamecore.Pooled.extend('StageView', {
  create: function(canvasEl, sceneLocation, sceneName) {
    var stageView;
    stageView = this._super();
    stageView.el = new createjs.Stage(canvasEl);
    stageView.el.enableMouseOver(10);
    stageView.loadScene(sceneLocation, sceneName, config.seed, config.sessionRandom);
    createjs.Ticker.setFPS(config.fps);
    createjs.Ticker.useRAF = true;
    _.bindAll(stageView, 'onTick');
    createjs.Ticker.addEventListener('tick', stageView.onTick);
    EventBus.addEventListener('!scene:load', stageView.onSceneLoad, stageView);
    return stageView;
  }
}, {
  onSceneLoad: function(event, sceneProperties) {
    return this.loadScene(sceneProperties.sceneLocation, sceneProperties.sceneName, sceneProperties.seed, sceneProperties.seed);
  },
  loadScene: function(sceneLocation, sceneName, seed, sessionRandom) {
    if (this.scene) {
      this.scene.dispose();
      this.el.removeChild(this.scene.el);
    }
    require(sceneLocation);
    this.scene = (moduleLibrary.get(sceneName)).create(seed, sessionRandom);
    return this.el.addChild(this.scene.el);
  },
  onTick: function(event) {
    return this.el.update();
  },
  dispose: function() {
    this.scene.dispose();
    return this.release();
  }
}));
