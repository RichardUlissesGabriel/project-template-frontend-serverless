#!/bin/bash

# this parameter may be tag or package
ORIGIN=$1

# Get the highest tag number
VERSION=`git tag -l --sort -version:refname | head -n 1`
VERSION=${VERSION:-'0.0.0'}

# Get number parts
MAJOR="${VERSION%%.*}"; VERSION="${VERSION#*.}"
MINOR="${VERSION%%.*}"; VERSION="${VERSION#*.}"
PATCH="${VERSION%%.*}"; VERSION="${VERSION#*.}"

GIT_COMMIT=`git rev-parse HEAD`
GIT_MESSAGE=`git log --format=%B -n 1 $GIT_COMMIT`

# Use this to compare at the end
OLD_TAG="$MAJOR.$MINOR.$PATCH"

# Increase version
if [[ "$GIT_MESSAGE" == *"feat"* ]]
then
  MINOR=$((MINOR+1))
fi

if [[ "$GIT_MESSAGE" == *"fix"* ]]
then
  PATCH=$((PATCH+1))
fi

# Create new tag
NEW_TAG="$MAJOR.$MINOR.$PATCH"

if [[ "$OLD_TAG" != "$NEW_TAG" ]]
then
  if [[ "$ORIGIN" == "tag" ]]
  then
    git tag $NEW_TAG
  else
    # Change package.json version
    sed -i "/\"version\":/c\\\  \"version\": \"$NEW_TAG\"," package.json
  fi
fi
