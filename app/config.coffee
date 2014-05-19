config =
  seed: +new Date #1400453311040
  sessionRandom: +new Date #1400453311040

  fps: 20

  spriteSheetSource: 'images/tileset.png'

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
  #width: 640
  #height: 480
  width: config.viewportOptions.width * config.tileWidth
  height: config.viewportOptions.height * config.tileHeight

moduleLibrary.define 'config', config
