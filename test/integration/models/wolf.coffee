require 'models/Wolf'

WolfModel = moduleLibrary.get 'Wolf.Model'

describe 'Model Wolf', ->
  beforeEach ->
    @wolfModel = new WolfModel
