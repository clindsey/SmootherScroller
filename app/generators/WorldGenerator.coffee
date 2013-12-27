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
        @tileCache[y][x] = +(utils.random(y * config.seed + x) > 0.1)

  # returns 0 or 1, latter is walkable
  getCell: (worldX, worldY) ->
    @tileCache[worldY][worldX]

  cx: (ox) -> utils.clamp ox, config.worldTileWidth
  cy: (oy) -> utils.clamp oy, config.worldTileHeight

  getSpriteSheetIndex: (worldX, worldY) ->
    cellValue = @getCell worldX, worldY

    n = @getCell worldX, @cy(worldY - 1)
    e =  @getCell @cx(worldX + 1), worldY
    s =  @getCell worldX, @cy(worldY + 1)
    w =  @getCell @cx(worldX - 1), worldY
    ne = @getCell @cx(worldX + 1), @cy(worldY - 1)
    se = @getCell @cx(worldX + 1), @cy(worldY + 1)
    sw = @getCell @cx(worldX - 1), @cy(worldY + 1)
    nw = @getCell @cx(worldX - 1), @cy(worldY - 1)

    index = 0

    if cellValue
      a = n << n * 4
      b = e << e * 5
      c = s << s * 6
      d = w << w * 7
      e = ne << ne * 0
      f = se << se * 1
      g = nw << nw * 3
      h = sw << sw * 2

      index = a + b + c + d + e + f + g + h

    index
