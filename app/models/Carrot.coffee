moduleLibrary.define 'Carrot.Model', gamecore.Pooled.extend 'CarrotModel',
    create: (x, y, maturity, maturityCounter = 20) ->
      carrotModel = @_super()

      carrotModel.x = x
      carrotModel.y = y
      carrotModel.marked = false
      carrotModel.maturity = maturity
      carrotModel.maturityCounter = maturityCounter

      carrotModel.minimapColor = ['#b5e565', '#8dd862', '#65cc60', '#3dbf5d'][carrotModel.maturity]

      carrotModel
  ,
    tick: ->
      if @maturity is 3
        return

      @maturityCounter -= 1

      @minimapColor = ['#b5e565', '#8dd862', '#65cc60', '#3dbf5d'][@maturity]

      if @maturityCounter < 0
        @maturityCounter = 20
        @maturity += 1

    dispose: ->
      @release()
