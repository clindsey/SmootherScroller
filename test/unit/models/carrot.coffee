require 'models/Carrot'

CarrotModel = moduleLibrary.get 'Carrot.Model'

describe 'Model Carrot', ->
  beforeEach ->
    @carrotModel = CarrotModel.create()

  afterEach ->
    @carrotModel.dispose()
