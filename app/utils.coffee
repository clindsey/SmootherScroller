require 'config'

config = moduleLibrary.get 'config'

moduleLibrary.define 'utils',
  tilesetImage: undefined

  clamp: (index, size) ->
    (index + size) % size

  random: (seed) ->
    new RNG(seed).uniform()

  loadImages: (imageSource, callback) ->
    @tilesetImage = new Image()

    @tilesetImage.onload = callback

    @tilesetImage.src = imageSource
