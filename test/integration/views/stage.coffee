require 'views/Stage'

StageView = moduleLibrary.get 'Stage.View'

describe 'View Stage', ->
  beforeEach ->
    @stageView = StageView.create()

  afterEach ->
    @stageView.dispose()
