require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'Planet.View', gamecore.Pooled.extend 'PlanetView',
    create: (planetModel) ->
      planetView = @_super()

      planetView.model = planetModel

      planetView.el = new createjs.Container

      _.bindAll planetView, 'onMouseDown'

      planetView.el.cursor = 'pointer'
      planetView.el.addEventListener 'mousedown', planetView.onMouseDown

      @addPlanet planetView

      @addText planetView

      planetView

    addText: (planetView) ->
      textEl = new createjs.Text planetView.model.name, '14px Monaco', '#fff'

      textEl.x -= (textEl.getMeasuredWidth() / 2) - (config.tileWidth / 2)
      textEl.y += config.tileHeight + 2

      planetView.el.addChild textEl

    addPlanet: (planetView) ->
      spriteSheet = new createjs.SpriteSheet @spriteSheetOptions
      planetEl = new createjs.Sprite spriteSheet

      planetEl.gotoAndPlay 'first'

      planetView.el.addChild planetEl

    spriteSheetOptions:
      images: [utils.tilesetImg]
      frames:
        width: config.tileWidth
        height: config.tileHeight
      animations:
        first:
          frames: [640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654]
  ,
    onMouseDown: (_event) ->
      EventBus.dispatch '!scene:load', this, {
        sceneLocation: 'scenes/PlanetSurface'
        sceneName: 'PlanetSurface.Scene'
        seed: @model.seed
      }

    dispose: ->
      @release()
