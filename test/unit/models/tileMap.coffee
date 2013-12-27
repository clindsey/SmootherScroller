require 'models/TileMap'

TileMapModel = moduleLibrary.get 'TileMap.Model'

describe 'Model TileMap', ->
  beforeEach ->
    @tileMapModel = TileMapModel.create()

  afterEach ->
    @tileMapModel.dispose()
