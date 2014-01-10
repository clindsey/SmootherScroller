config =
  seed: +new Date

  maxElevation: 10

  generator:
    location: 'generators/WorldGenerator'
    name: 'WorldGenerator.Generator'

  worldChunkWidth: 5
  worldChunkHeight: 5

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
