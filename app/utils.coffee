require 'config'

config = moduleLibrary.get 'config'

moduleLibrary.define 'utils',
  clamp: (index, size) ->
    (index + size) % size

  random: (seed) ->
    new RNG(seed).uniform()
