require 'views/Viewport'

ViewportView = moduleLibrary.get 'Viewport.View'

describe 'View Viewport', ->
  beforeEach ->
    @viewportView = ViewportView.create()

  afterEach ->
    @viewportView.dispose()
