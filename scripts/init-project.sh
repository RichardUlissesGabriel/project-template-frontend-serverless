#!/bin/bash
ENV_PATH="./scripts/.env"

# load env variables
if [[ ! -f $ENV_PATH ]]
then
  echo "============================================================================================================="
  echo "  Missing .env file inside ./script folder"
  echo "============================================================================================================="
else
  export $(cat $ENV_PATH | grep -v '#' | awk '/=/ {print $1}')
fi

# check if api github exists
if [[ ! $API_GITHUB_KEY ]]
then
  echo "============================================================================================================="
  echo "  Missing API_GITHUB_KEY value inside ./script/.env file"
  echo "============================================================================================================="
else

  REPOSITORY_NAME=${PWD##*/}
  GIT_REMOTE=$(git remote -v)

  if [[ "$GIT_REMOTE" != *"$REPOSITORY_NAME"* ]]
  then
    echo "============================================================================================================="
    echo "  Initializing the project $REPOSITORY_NAME"
    echo "============================================================================================================="

    # erase this project-template-serverless
    echo "============================================================================================================="
    echo "  Erasing old reference to project-template-serverless project!!!!"
    echo "============================================================================================================="
    rm -rf .git
    rm -rf CHANGELOG.md

    echo "============================================================================================================="
    echo "  Creating the new repository $REPOSITORY_NAME this name is equal the folder's name"
    echo "============================================================================================================="
    # creating the repo
    curl -H "Authorization: token $API_GITHUB_KEY" --data "{\"name\":\"$REPOSITORY_NAME\", \"private\": $PRIVATE}" https://api.github.com/user/repos

    echo ""
    echo "============================================================================================================="
    echo "  Adding all files inside the new repository"
    echo "============================================================================================================="
    # change package name
    sed -i "/\"name\":/c\\\  \"name\": \"$REPOSITORY_NAME\"," package.json
    sed -i "/\"version\":/c\\\  \"version\": \"1.0.0\"," package.json

    # start a new repository
    git init
    git add .
    git remote add origin git@github.com:$USER_GITHUB/$REPOSITORY_NAME.git

    echo "============================================================================================================="
    echo "  Sending everthing to the origin master"
    echo "============================================================================================================="

    git commit -m "feat: Add initial configuration of project" -m "this commit is automated from script init-project"
    git push -u origin master

    # create initial tag
    git tag 1.0.0
    git push --tags

    # let's add some restriction to work with this project, we need to use all of features
    # but we need git in version 2.13.x or greater, let's put the restriction to install dependencies
    npm config set unsafe-perm true

    # let's verify the version of git from user
    npm run update-git-version
  else
    echo "============================================================================================================="
    echo "  this project has already initialized!!!"
    echo "============================================================================================================="
  fi
fi
