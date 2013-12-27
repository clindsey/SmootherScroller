require 'Router'

Router = moduleLibrary.get 'Router'

describe 'Router', ->
  beforeEach ->
    @router = new Router

  it 'works', ->
    expect(true).to.equal true
