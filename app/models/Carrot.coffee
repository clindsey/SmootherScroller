moduleLibrary.define 'Carrot.Model', gamecore.Pooled.extend 'CarrotModel',
    create: (x, y) ->
      carrotModel = @_super()

      carrotModel.x = x
      carrotModel.y = y

      carrotModel.minimapColor = '#569c8d'

      carrotModel
  ,
    tick: ->

    dispose: ->
      @release()
