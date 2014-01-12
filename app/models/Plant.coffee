moduleLibrary.define 'Plant.Model', gamecore.Pooled.extend 'PlantModel',
    create: (x, y) ->
      plantModel = @_super()

      plantModel.x = x
      plantModel.y = y

      plantModel.minimapColor = '#008800'

      plantModel
  ,
    tick: ->

    dispose: ->
      @release()
