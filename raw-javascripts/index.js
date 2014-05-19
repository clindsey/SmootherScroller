(function() {
  var app, config, utils;
  require('views/CanvasAdapter');
  require('views/Stage');
  require('views/Viewport');
  require('config');
  require('utils');
  utils = moduleLibrary.get('utils');
  config = moduleLibrary.get('config');
  app = {
    onLoad: function() {
      return utils.loadImages(config.spriteSheetSource, app.onImagesLoad);
    },
    onImagesLoad: function() {
      app.canvasAdapterView = (moduleLibrary.get('CanvasAdapter.View')).create(config.canvasAdapterOptions);
      app.stageView = (moduleLibrary.get('Stage.View')).create(app.canvasAdapterView.canvasEl, 'scenes/FoodChain', 'FoodChain.Scene');
      return document.onkeydown = app.onKeyDown;
    },
    onKeyDown: function(event) {
      return EventBus.dispatch('!key:down', this, event);
    },
    dispose: function() {
      document.onkeydown = void 0;
      this.canvasAdapterView.dispose();
      return this.stageView.dispose();
    }
  };
  return app.onLoad();
})();
