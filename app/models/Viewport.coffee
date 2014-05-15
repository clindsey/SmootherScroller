moduleLibrary.define 'Viewport.Model', gamecore.Pooled.extend 'ViewportModel',
    create: (x, y, width, height) ->
      viewportModel = @_super()

      viewportModel.x = x
      viewportModel.y = y
      viewportModel.width = width
      viewportModel.height = height
      viewportModel.scrollX = 0
      viewportModel.scrollY = 0

      viewportModel
  ,
    setPosition: (x, y) ->
      if y isnt @y or x isnt @x
        @x = x
        @y = y

        EventBus.dispatch "!move:#{@uniqueId}", this

    setScroll: (x, y) ->
      if y isnt @scrollY or x isnt @scrollX
        @scrollX = x
        @scrollY = y

        EventBus.dispatch "!scroll:#{@uniqueId}", this

    dispose: ->
      @release()
