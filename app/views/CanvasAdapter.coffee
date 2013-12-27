moduleLibrary.define 'CanvasAdapter.View', gamecore.Pooled.extend 'CanvasAdapterView',
    create: (rawOptions = {}) ->
      options = _.defaults rawOptions, @DEFAULT_OPTIONS

      canvasAdapterView = @_super()

      canvasAdapterView.canvasEl = document.createElement 'canvas'
      canvasAdapterView.canvasEl.width = options.width
      canvasAdapterView.canvasEl.height = options.height
      document.body.appendChild canvasAdapterView.canvasEl

      canvasAdapterView

    DEFAULT_OPTIONS:
      width: 480
      height: 320
  ,
    dispose: ->
      @canvasEl.parentNode.removeChild @canvasEl

      @release()
