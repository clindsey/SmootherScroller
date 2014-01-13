require 'models/Building'

BuildingModel = moduleLibrary.get 'Building.Model'

describe 'Model Building', ->
  beforeEach ->
    @buildingModel = BuildingModel.create()

  afterEach ->
    @buildingModel.dispose()
