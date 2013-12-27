require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'WorldGenerator.Generator', class WorldGenerator
  tileCache: []

  constructor: ->
    for y in [0..config.worldTileHeight]
      @tileCache[y] = []
      for x in [0..config.worldTileWidth]
        @tileCache[y][x] = Math.floor utils.random(y * config.seed + x) * 10

  # returns 0 or 1, latter is walkable
  getCell: (worldX, worldY) ->
    @tileCache[worldY][worldX]
