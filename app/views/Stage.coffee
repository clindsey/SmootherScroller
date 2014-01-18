require 'config'

config = moduleLibrary.get 'config'

moduleLibrary.define 'Stage.View', gamecore.Pooled.extend 'StageView',
    create: (canvasEl, sceneLocation, sceneName) ->
      stageView = @_super()

      stageView.el = new createjs.Stage canvasEl

      stageView.el.enableMouseOver 10

      stageView.loadScene sceneLocation, sceneName

      createjs.Ticker.setFPS config.fps
      createjs.Ticker.useRAF = true

      _.bindAll stageView, 'onTick'
      createjs.Ticker.addEventListener 'tick', stageView.onTick

      EventBus.addEventListener '!planet:load', stageView.onPlanetLoad, stageView

      EventBus.addEventListener '!key:down', (_event, args) ->
        if args.keyCode is 78
          config.seed = +new Date
          config.sessionRandom = +new Date
          stageView.loadScene sceneLocation, sceneName
      , this

      stageView
  ,
    onPlanetLoad: (event, planetModel) ->
      @loadScene 'scenes/PlanetSurface', 'PlanetSurface.Scene'

    loadScene: (sceneLocation, sceneName) ->
      if @scene
        @scene.dispose()

        @el.removeChild @scene.el

      require sceneLocation

      @scene = (moduleLibrary.get sceneName).create()

      @el.addChild @scene.el

    onTick: (event) ->
      @el.update()

    dispose: ->
      @scene.dispose()

      @release()
