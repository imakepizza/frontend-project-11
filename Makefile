develop:
	npx webpack serve

publish:
	npm publish --dry-run

install:
	npm ci

lint:
	npx eslint .
