all: setup test build

start:
	@npm run start

clean:
	@rm -rf dist

build:
	@npm run build

test: tests

tests:
	@npm run test

cover:
	@npm run cover

setup:
	@npm install

publish: all
	@npm publish --access public
