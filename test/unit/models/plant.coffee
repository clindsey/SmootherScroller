require 'models/Plant'

PlantModel = moduleLibrary.get 'Plant.Model'

describe 'Model Plant', ->
  beforeEach ->
    @plantModel = PlantModel.create()

  afterEach ->
    @plantModel.dispose()
