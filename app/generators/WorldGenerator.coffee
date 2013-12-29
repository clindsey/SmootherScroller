require 'utils'
require 'config'

utils = moduleLibrary.get 'utils'
config = moduleLibrary.get 'config'

moduleLibrary.define 'WorldGenerator.Generator', class WorldGenerator
  tileCache: []
  chunkCache: []

  constructor: (@seed = config.seed) ->
    @cacheAllTiles()

  cacheAllTiles: ->
    for y in [0..config.worldChunkHeight - 1]
      for x in [0..config.worldChunkWidth - 1]
        @getCell x, y

  getCell: (worldX, worldY) ->
    if @tileCache[worldY] and @tileCache[worldY][worldX]
      return @tileCache[worldY][worldX]

    worldChunkX = Math.floor worldX / config.chunkTileWidth
    worldChunkY = Math.floor worldY / config.chunkTileHeight
    chunkX = worldX % config.chunkTileWidth
    chunkY = worldY % config.chunkTileHeight

    chunk = @getChunk worldChunkX, worldChunkY

    cell = chunk[chunkY][chunkX]

  getChunk: (worldChunkX, worldChunkY) ->
    nw = @chunkEdgeIndex worldChunkX, worldChunkY

    ne = @chunkEdgeIndex worldChunkX + 1, worldChunkY

    sw = @chunkEdgeIndex worldChunkX, worldChunkY + 1

    se = @chunkEdgeIndex worldChunkX + 1, worldChunkY + 1

    chunkTileWidth = config.chunkTileWidth
    chunkTileHeight = config.chunkTileHeight

    chunkData = @bilinearInterpolate nw, ne, se, sw, chunkTileWidth, chunkTileHeight

    for y in [0..chunkData.length - 1]
      vy = y + worldChunkY * chunkTileHeight
      @tileCache[vy] = [] unless @tileCache[vy]?

      for x in [0..chunkData[y].length - 1]
        vx = x + worldChunkX * chunkTileWidth
        @tileCache[vy][vx] = chunkData[y][x]

    chunkData

  chunkEdgeIndex: (x, y) ->
    width = config.worldChunkWidth
    height = config.worldChunkHeight
    maxElevation = config.maxElevation
    seed = @seed

    x = utils.clamp x, width
    y = utils.clamp y, height

    utils.random(y * width + x + seed) * maxElevation

  bilinearInterpolate: (nw, ne, se, sw, width, height) ->
    xLookup = []
    cells = []

    for y in [0..height - 1]
      cells[y] = []
      yStep = y / (height - 1)

      for x in [0..width - 1]
        if xLookup[x]?
          xStep = xLookup[x]
        else
          xStep = xLookup[x] = x / (width - 1)

        topHeight = nw + xStep * (ne - nw)
        bottomHeight = sw + xStep * (se - sw)
        cellHeight = topHeight + yStep * (bottomHeight - topHeight)
        cells[y][x] = Math.floor cellHeight

    cells
