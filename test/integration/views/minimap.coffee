require 'views/Minimap'

MinimapView = moduleLibrary.get 'Minimap.View'

describe 'View Minimap', ->
  beforeEach ->
    @minimapView = MinimapView.create()

  afterEach ->
    @minimapView.dispose()
