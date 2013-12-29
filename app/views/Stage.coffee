moduleLibrary.define 'Stage.View', gamecore.Pooled.extend 'StageView',
    create: (canvasEl, sceneLocation, sceneName) ->
      stageView = @_super()

      stageView.el = new createjs.Stage canvasEl

      require sceneLocation

      stageView.scene = (moduleLibrary.get sceneName).create()

      stageView.el.addChild stageView.scene.el

      createjs.Ticker.setFPS 60
      createjs.Ticker.useRAF = true

      _.bindAll stageView, 'onTick'
      createjs.Ticker.addEventListener 'tick', stageView.onTick

      stageView.el.update()

      stageView
  ,
    onTick: (event) ->
      @el.update()

    dispose: ->
      @scene.dispose()

      @release()
