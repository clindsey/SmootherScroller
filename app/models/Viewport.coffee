moduleLibrary.define 'Viewport.Model', gamecore.Pooled.extend 'ViewportModel',
    create: (x, y, width, height) ->
      viewportModel = @_super()

      viewportModel.x = x
      viewportModel.y = y
      viewportModel.width = width
      viewportModel.height = height

      viewportModel
  ,
    setPosition: (x, y) ->
      if y isnt @y or x isnt @x
        @x = x
        @y = y

        EventBus.dispatch "!move:#{@uniqueId}", this

    dispose: ->
      @release()
