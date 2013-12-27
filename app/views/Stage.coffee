moduleLibrary.define 'Stage.View', gamecore.Pooled.extend 'StageView',
    create: (canvasEl, sceneLocation, sceneName) ->
      stageView = @_super()

      stageView.el = new createjs.Stage canvasEl

      require sceneLocation

      stageView.scene = (moduleLibrary.get sceneName).create()

      createjs.Ticker.setFPS 60
      createjs.Ticker.useRAF = true

      stageView.el.addChild stageView.scene.el

      stageView.el.update()

      EventBus.addEventListener '!key:down', stageView.onKeyDown, stageView

      stageView
  ,
    onKeyDown: (event) ->
      @el.update()

    dispose: ->
      @scene.dispose()

      @release()
