require 'models/Tile'

TileModel = moduleLibrary.get 'Tile.Model'

describe 'Model Tile', ->
  beforeEach ->
    @tileModel = new TileModel
