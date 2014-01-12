require 'views/Plant'

PlantView = moduleLibrary.get 'Plant.View'

describe 'View Plant', ->
  beforeEach ->
    @plantView = PlantView.create()

  afterEach ->
    @plantView.dispose()
