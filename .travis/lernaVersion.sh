#!/bin/bash

VERSION=patch

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git remote add with-credentials https://${GITHUB_TOKEN}@github.com/vidarc/website.git

if [[ $TRAVIS_COMMIT_MESSAGE == *'chore(deps)'* ]]; then
  exit 0
fi

if [[ $TRAVIS_COMMIT_MESSAGE == *'[patch]'* ]]; then
  VERSION=patch
elif [[ $TRAVIS_COMMIT_MESSAGE == *'[minor]'* ]]; then
  VERSION=minor
elif [[ $TRAVIS_COMMIT_MESSAGE == *'[major]'* ]]; then
  VERSION=major
fi

echo doing a $VERSION bump

git fetch with-credentials
git checkout master
lerna version $VERSION --yes --no-commit-hooks --git-remote with-credentials \
-m "ci(release): :tada: releasing version: %s"
