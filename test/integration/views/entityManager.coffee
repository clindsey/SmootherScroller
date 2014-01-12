require 'views/EntityManager'

EntityManagerView = moduleLibrary.get 'EntityManager.View'

describe 'View EntityManager', ->
  beforeEach ->
    @entityManagerView = EntityManagerView.create()

  afterEach ->
    @entityManagerView.dispose()
