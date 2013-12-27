moduleLibrary.define 'config',
  seed: 201312262319 #+new Date

  generator:
    location: 'generators/WorldGenerator'
    name: 'WorldGenerator.Generator'

  worldTileWidth: 200
  worldTileHeight: 200

  tileWidth: 16
  tileHeight: 16

  canvasAdapterOptions:
    width: 320
    height: 320

  viewportOptions:
    width: 20
    height: 20
