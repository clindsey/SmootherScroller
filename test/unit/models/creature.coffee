require 'models/Creature'

CreatureModel = moduleLibrary.get 'Creature.Model'

describe 'Model Creature', ->
  beforeEach ->
    @creatureModel = CreatureModel.create()

  afterEach ->
    @creatureModel.dispose()
