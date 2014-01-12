require 'views/Creature'

CreatureView = moduleLibrary.get 'Creature.View'

describe 'View Creature', ->
  beforeEach ->
    @creatureView = CreatureView.create()

  afterEach ->
    @creatureView.dispose()
