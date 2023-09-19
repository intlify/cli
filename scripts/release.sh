#!/bin/bash

set -xe

# Check edge release
if [[ ! -z ${EDGE_RELEASE} ]] ; then
  npx jiti ./scripts/bump-edge
fi

# Update token
if [[ ! -z ${NPM_TOKEN} ]] ; then
  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> ~/.npmrc
  echo "registry=https://registry.npmjs.org/" >> ~/.npmrc
  echo "always-auth=true" >> ~/.npmrc
fi

# Release packages
echo "Publishing"
npm publish
