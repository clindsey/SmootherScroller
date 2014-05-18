require 'scenes/FoodChain'

FoodChainScene = moduleLibrary.get 'FoodChain.Scene'

describe 'Scene FoodChain', ->
  beforeEach ->
    @foodChainScene = FoodChainScene.create()

  afterEach ->
    @foodChainScene.dispose()
