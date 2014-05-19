require 'views/Rabbit'

RabbitView = moduleLibrary.get 'Rabbit.View'

describe 'View Rabbit', ->
  beforeEach ->
    @rabbitView = RabbitView.create()

  afterEach ->
    @rabbitView.dispose()
