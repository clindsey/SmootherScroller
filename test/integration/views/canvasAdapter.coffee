require 'views/CanvasAdapter'

CanvasAdapterView = moduleLibrary.get 'CanvasAdapter.View'

describe 'View CanvasAdapter', ->
  beforeEach ->
    @canvasAdapterView = CanvasAdapterView.create()

  afterEach ->
    @canvasAdapterView.dispose()
