moduleLibrary.define 'config',
  seed: 201312262319 #+new Date

  worldTileWidth: 20
  worldTileHeight: 20

  tileWidth: 16
  tileHeight: 16

  canvasAdapterOptions:
    width: 320
    height: 320

  viewportOptions:
    width: 20
    height: 20

  spriteSheetSource: 'images/tileset_terra.png'

  generator:
    location: 'generators/WorldGenerator'
    name: 'WorldGenerator.Generator'
