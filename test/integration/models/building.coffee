require 'models/Building'

BuildingModel = moduleLibrary.get 'Building.Model'

describe 'Model Building', ->
  beforeEach ->
    @buildingModel = new BuildingModel
