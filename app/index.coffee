( ->
  require 'views/CanvasAdapter'
  require 'views/Stage'
  require 'views/Viewport'
  require 'config'
  require 'utils'

  utils = moduleLibrary.get 'utils'
  config = moduleLibrary.get 'config'

  app =
    onLoad: ->
      utils.loadImages config.spriteSheetSource, app.onImagesLoad

    onImagesLoad: ->
      app.canvasAdapterView = (moduleLibrary.get 'CanvasAdapter.View').create config.canvasAdapterOptions

      app.stageView = (moduleLibrary.get 'Stage.View').create app.canvasAdapterView.canvasEl, 'scenes/StarMap', 'StarMap.Scene'

      document.onkeydown = app.onKeyDown

    onKeyDown: (event) ->
      EventBus.dispatch '!key:down', this, event

    dispose: ->
      document.onkeydown = undefined
      @canvasAdapterView.dispose()
      @stageView.dispose()

  app.onLoad()
)()
