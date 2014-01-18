require 'models/Planet'

PlanetModel = moduleLibrary.get 'Planet.Model'

describe 'Model Planet', ->
  beforeEach ->
    @planetModel = PlanetModel.create()

  afterEach ->
    @planetModel.dispose()
