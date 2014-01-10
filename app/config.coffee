config =
  seed: 20140109 #+new Date

  maxElevation: 10

  generator:
    location: 'generators/WorldGenerator'
    name: 'WorldGenerator.Generator'

  worldChunkWidth: 20
  worldChunkHeight: 20

  chunkTileWidth: 20
  chunkTileHeight: 20

  tileWidth: 16
  tileHeight: 16

  viewportOptions:
    width: 32
    height: 32

config.canvasAdapterOptions =
  width: config.viewportOptions.width * config.tileWidth
  height: config.viewportOptions.height * config.tileHeight
config.worldTileWidth = config.worldChunkWidth * config.chunkTileWidth
config.worldTileHeight = config.worldChunkHeight * config.chunkTileHeight

moduleLibrary.define 'config', config
