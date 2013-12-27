require 'models/Viewport'

ViewportModel = moduleLibrary.get 'Viewport.Model'

describe 'Model Viewport', ->
  beforeEach ->
    @viewportModel = new ViewportModel
