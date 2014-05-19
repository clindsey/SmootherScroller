require 'models/Rabbit'

RabbitModel = moduleLibrary.get 'Rabbit.Model'

describe 'Model Rabbit', ->
  beforeEach ->
    @rabbitModel = new RabbitModel
