config =
  seed: +new Date
  sessionRandom: +new Date

  fps: 20

  spriteSheetSource: 'images/tileset_terra.png'

  generator:
    location: 'generators/WorldGenerator'
    name: 'WorldGenerator.Generator'
    options:
      waterCutoff: 0.5
      # world size
      worldChunkWidth: 7
      worldChunkHeight: 7
      # zoom level
      chunkTileWidth: 13
      chunkTileHeight: 13

  tileWidth: 16
  tileHeight: 16

  viewportOptions:
    width: 32
    height: 32

  minimapOptions:
    tileWidth: 2
    tileHeight: 2

config.worldTileWidth = config.generator.options.worldChunkWidth * config.generator.options.chunkTileWidth
config.worldTileHeight = config.generator.options.worldChunkHeight * config.generator.options.chunkTileHeight

config.canvasAdapterOptions =
  width: (config.viewportOptions.width * config.tileWidth) + (config.minimapOptions.tileWidth * config.worldTileWidth)
  height: config.viewportOptions.height * config.tileHeight

moduleLibrary.define 'config', config

console.log 'seed:', config.seed
console.log 'sessionSeed:', config.sessionRandom
