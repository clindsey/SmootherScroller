require 'views/Planet'

PlanetView = moduleLibrary.get 'Planet.View'

describe 'View Planet', ->
  beforeEach ->
    @planetView = PlanetView.create()

  afterEach ->
    @planetView.dispose()
