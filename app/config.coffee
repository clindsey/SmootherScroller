config =
  seed: 20140111 # +new Date
  sessionRandom: 20140111

  fps: 20

  spriteSheetSource: 'images/tileset_terra.png'

  generator:
    location: 'generators/WorldGenerator'
    name: 'WorldGenerator.Generator'
    options:
      waterCutoff: 0.5
      # world size
      worldChunkWidth: 5
      worldChunkHeight: 5
      # zoom level
      chunkTileWidth: 10
      chunkTileHeight: 10

  tileWidth: 16
  tileHeight: 16

  viewportOptions:
    width: 32
    height: 32

config.canvasAdapterOptions =
  width: config.viewportOptions.width * config.tileWidth
  height: config.viewportOptions.height * config.tileHeight

config.worldTileWidth = config.generator.options.worldChunkWidth * config.generator.options.chunkTileWidth
config.worldTileHeight = config.generator.options.worldChunkHeight * config.generator.options.chunkTileHeight

moduleLibrary.define 'config', config
