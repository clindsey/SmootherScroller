require 'models/TileMap'

TileMapModel = moduleLibrary.get 'TileMap.Model'

describe 'Model TileMap', ->
  beforeEach ->
    @tileMapModel = new TileMapModel
