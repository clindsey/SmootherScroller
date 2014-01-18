require 'scenes/StarMap'

StarMapScene = moduleLibrary.get 'StarMap.Scene'

describe 'Scene StarMap', ->
  beforeEach ->
    @starMapScene = StarMapScene.create()

  afterEach ->
    @starMapScene.dispose()
