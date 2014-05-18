moduleLibrary.define 'Wolf.Model', gamecore.Pooled.extend 'WolfModel',
    create: (x, y) ->
      wolfModel = @_super()

      wolfModel.x = x
      wolfModel.y = y

      wolfModel.minimapColor = '#b03c25'

      wolfModel
  ,
    tick: ->

    dispose: ->
      @release()
