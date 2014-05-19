require 'views/Carrot'

CarrotView = moduleLibrary.get 'Carrot.View'

describe 'View Carrot', ->
  beforeEach ->
    @carrotView = CarrotView.create()

  afterEach ->
    @carrotView.dispose()
