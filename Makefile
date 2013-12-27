install:
	npm install && ./node_modules/.bin/bower install

clean:
	rm -rf node_modules
	rm -rf bower_components
	rm -rf public/*

live:
	./node_modules/.bin/grunt live --force

unit:
	./node_modules/.bin/grunt test:unit

integration:
	./node_modules/.bin/grunt test:integration --force

docs:
	./node_modules/.bin/grunt docs

.PHONY: test docs
