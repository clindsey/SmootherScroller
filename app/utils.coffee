require 'config'

config = moduleLibrary.get 'config'

moduleLibrary.define 'utils',
  clamp: (index, size) ->
    (index + size) % size

  random: (seed) ->
    new RNG(seed).uniform()

  sessionRandom: ->
    randomVal = new RNG(config.sessionRandom).uniform()

    config.sessionRandom += 1

    randomVal

  loadImages: (spriteSheetSource, callback) ->
    @tilesetImg = new Image()

    @tilesetImg.onload = callback

    @tilesetImg.src = spriteSheetSource
