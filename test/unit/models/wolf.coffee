require 'models/Wolf'

WolfModel = moduleLibrary.get 'Wolf.Model'

describe 'Model Wolf', ->
  beforeEach ->
    @wolfModel = WolfModel.create()

  afterEach ->
    @wolfModel.dispose()
