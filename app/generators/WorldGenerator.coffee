require 'utils'

utils = moduleLibrary.get 'utils'

moduleLibrary.define 'WorldGenerator.Generator', class WorldGenerator
  tileCache: []
  chunkCache: []

  constructor: (@seed, @options) ->

  cacheAllTiles: ->
    for y in [0..@options.worldChunkHeight - 1]
      for x in [0..@options.worldChunkWidth - 1]
        chunk = @getChunk x, y

        for cy in [0..chunk.length - 1]
          for cx in [0..chunk[0].length - 1]
            vx = x * @options.chunkTileWidth + cx
            vy = y * @options.chunkTileHeight + cy

            @getCell vx, vy

  getCell: (worldX, worldY) ->
    if @tileCache[worldY] and @tileCache[worldY][worldX]?
      return @tileCache[worldY][worldX]

    worldChunkX = Math.floor worldX / @options.chunkTileWidth
    worldChunkY = Math.floor worldY / @options.chunkTileHeight
    chunkX = worldX % @options.chunkTileWidth
    chunkY = worldY % @options.chunkTileHeight

    chunk = @getChunk worldChunkX, worldChunkY

    cell = +(chunk[chunkY][chunkX] >= @options.waterCutoff)

    @tileCache[worldY] = [] unless @tileCache[worldY]?
    @tileCache[worldY][worldX] = cell

    cell

  getChunk: (worldChunkX, worldChunkY) ->
    nw = @chunkEdgeIndex worldChunkX, worldChunkY

    ne = @chunkEdgeIndex worldChunkX + 1, worldChunkY

    sw = @chunkEdgeIndex worldChunkX, worldChunkY + 1

    se = @chunkEdgeIndex worldChunkX + 1, worldChunkY + 1

    chunkTileWidth = @options.chunkTileWidth
    chunkTileHeight = @options.chunkTileHeight

    chunkData = @bilinearInterpolate nw, ne, se, sw, chunkTileWidth, chunkTileHeight

    chunkData

  chunkEdgeIndex: (x, y) ->
    width = @options.worldChunkWidth
    height = @options.worldChunkHeight
    seed = @seed

    x = @clamp x, width
    y = @clamp y, height

    utils.random(y * width + x + seed)

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
        cells[y][x] = cellHeight

    cells

  clamp: (index, size) ->
    (index + size) % size
