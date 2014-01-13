moduleLibrary.define 'Building.Model', gamecore.Pooled.extend 'BuildingModel',
    create: (x, y, color) ->
      buildingModel = @_super()

      buildingModel.x = x
      buildingModel.y = y
      buildingModel.color = color

      buildingModel.minimapColor = '#888800'

      buildingModel
  ,
    tick: ->

    dispose: ->
      @release()
