window.require.register("config", function(require, module) {var config;

config = {
  seed: +(new Date),
  sessionRandom: +(new Date),
  fps: 20,
  spriteSheetSource: 'images/tileset.png',
  generator: {
    location: 'generators/WorldGenerator',
    name: 'WorldGenerator.Generator',
    options: {
      waterCutoff: 0.4,
      worldChunkWidth: 8,
      worldChunkHeight: 8,
      chunkTileWidth: 8,
      chunkTileHeight: 8
    }
  },
  tileWidth: 32,
  tileHeight: 32,
  viewportOptions: {
    width: 20,
    height: 15
  },
  minimapOptions: {
    tileWidth: 2,
    tileHeight: 2
  }
};

config.worldTileWidth = config.generator.options.worldChunkWidth * config.generator.options.chunkTileWidth;

config.worldTileHeight = config.generator.options.worldChunkHeight * config.generator.options.chunkTileHeight;

config.canvasAdapterOptions = {
  width: config.viewportOptions.width * config.tileWidth,
  height: config.viewportOptions.height * config.tileHeight
};

moduleLibrary.define('config', config);
});