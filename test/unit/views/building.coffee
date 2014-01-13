require 'views/Building'

BuildingView = moduleLibrary.get 'Building.View'

describe 'View Building', ->
  beforeEach ->
    @buildingView = BuildingView.create()

  afterEach ->
    @buildingView.dispose()
