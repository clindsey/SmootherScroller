moduleLibrary.define('Viewport.Model', gamecore.Pooled.extend('ViewportModel', {
  create: function(x, y, width, height) {
    var viewportModel;
    viewportModel = this._super();
    viewportModel.x = x;
    viewportModel.y = y;
    viewportModel.width = width;
    viewportModel.height = height;
    viewportModel.scrollX = 0;
    viewportModel.scrollY = 0;
    return viewportModel;
  }
}, {
  setPosition: function(x, y) {
    if (y !== this.y || x !== this.x) {
      this.x = x;
      this.y = y;
      return EventBus.dispatch("!move:" + this.uniqueId, this);
    }
  },
  setScroll: function(x, y) {
    if (y !== this.scrollY || x !== this.scrollX) {
      this.scrollX = x;
      this.scrollY = y;
      return EventBus.dispatch("!scroll:" + this.uniqueId, this);
    }
  },
  dispose: function() {
    return this.release();
  }
}));
