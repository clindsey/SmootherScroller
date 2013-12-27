require 'scenes/PlanetSurface'

PlanetSurfaceScene = moduleLibrary.get 'PlanetSurface.Scene'

describe 'Scene PlanetSurface', ->
  beforeEach ->
    @planetSurfaceScene = PlanetSurfaceScene.create()

  afterEach ->
    @planetSurfaceScene.dispose()
