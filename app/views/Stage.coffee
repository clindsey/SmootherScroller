require 'config'

config = moduleLibrary.get 'config'

moduleLibrary.define 'Stage.View', gamecore.Pooled.extend 'StageView',
    create: (canvasEl, sceneLocation, sceneName) ->
      stageView = @_super()

      stageView.el = new createjs.Stage canvasEl

      stageView.el.enableMouseOver 10

      stageView.loadScene sceneLocation, sceneName, config.seed, config.sessionRandom

      createjs.Ticker.setFPS config.fps
      createjs.Ticker.useRAF = true

      _.bindAll stageView, 'onTick'
      createjs.Ticker.addEventListener 'tick', stageView.onTick

      EventBus.addEventListener '!planet:load', stageView.onPlanetLoad, stageView

      EventBus.addEventListener '!key:down', (_event, args) ->
        if args.keyCode is 78
          stageView.loadScene 'scenes/StarMap', 'StarMap.Scene', config.seed, config.sessionRandom
      , this

      stageView
  ,
    onPlanetLoad: (event, planetModel) ->
      @loadScene 'scenes/PlanetSurface', 'PlanetSurface.Scene', planetModel.seed, planetModel.seed

    loadScene: (sceneLocation, sceneName, seed, sessionRandom) ->
      if @scene
        @scene.dispose()

        @el.removeChild @scene.el

      require sceneLocation

      @scene = (moduleLibrary.get sceneName).create seed, sessionRandom

      @el.addChild @scene.el

    onTick: (event) ->
      @el.update()

    dispose: ->
      @scene.dispose()

      @release()
