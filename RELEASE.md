How to do a release:

- git checkout master
- Check all PRs in github
- merge development branch into master - probably conflicts in dist/
- remove dist/ & package-lock.json & node_modules
- bump version in package.json & docs/conf.py
- add entry in docs/releasenotes.rst 
- npm install and make build
- add dist/ and package-lock.json and package.json and docs and commit
- git tag, push, push tags
- make release in github
- npm publish
