require 'views/Tile'

TileView = moduleLibrary.get 'Tile.View'

describe 'View Tile', ->
  beforeEach ->
    @tileView = TileView.create()

  afterEach ->
    @tileView.dispose()
