moduleLibrary.define('CanvasAdapter.View', gamecore.Pooled.extend('CanvasAdapterView', {
  create: function(rawOptions) {
    var canvasAdapterView, options;
    if (rawOptions == null) {
      rawOptions = {};
    }
    options = _.defaults(rawOptions, this.DEFAULT_OPTIONS);
    canvasAdapterView = this._super();
    canvasAdapterView.canvasEl = document.createElement('canvas');
    canvasAdapterView.canvasEl.width = options.width;
    canvasAdapterView.canvasEl.height = options.height;
    document.body.appendChild(canvasAdapterView.canvasEl);
    return canvasAdapterView;
  },
  DEFAULT_OPTIONS: {
    width: 480,
    height: 320
  }
}, {
  dispose: function() {
    this.canvasEl.parentNode.removeChild(this.canvasEl);
    return this.release();
  }
}));
