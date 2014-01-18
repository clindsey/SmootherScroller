config =
  seed: 201401172019 #+new Date
  sessionRandom: 201401172019 #+new Date

  fps: 20

  spriteSheetSource: 'images/tileset_32.png'

  generator:
    location: 'generators/WorldGenerator'
    name: 'WorldGenerator.Generator'
    options:
      waterCutoff: 0.4
      # world size
      worldChunkWidth: 8
      worldChunkHeight: 8
      # zoom level
      chunkTileWidth: 8
      chunkTileHeight: 8

  tileWidth: 32
  tileHeight: 32

  viewportOptions:
    width: 20
    height: 15

  minimapOptions:
    tileWidth: 2
    tileHeight: 2

config.worldTileWidth = config.generator.options.worldChunkWidth * config.generator.options.chunkTileWidth
config.worldTileHeight = config.generator.options.worldChunkHeight * config.generator.options.chunkTileHeight

config.canvasAdapterOptions =
  width: 640
  height: 480
  #width: (config.viewportOptions.width * config.tileWidth) + (config.minimapOptions.tileWidth * config.worldTileWidth)
  #height: config.viewportOptions.height * config.tileHeight

moduleLibrary.define 'config', config
