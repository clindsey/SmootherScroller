require 'views/Wolf'

WolfView = moduleLibrary.get 'Wolf.View'

describe 'View Wolf', ->
  beforeEach ->
    @wolfView = WolfView.create()

  afterEach ->
    @wolfView.dispose()
