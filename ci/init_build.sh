#!/bin/bash

set -e 

SF_BRANCH_NAME="$SF_VERSION"
  
if [[ -f $SF_REPO_DIR/.cached_version ]]; then
   CACHED_VERSION=`cat $SF_REPO_DIR/.cached_version`

   if [ "$CACHED_VERSION" != "$SF_VERSION" ]; then 
      echo "Cached version $CACHED_VERSION does not match requested version $SF_VERSION. Deleting cache."
      rm -rf $SF_REPO_DIR
   fi
elif [[ -d $SF_REPO_DIR ]]; then
   echo "No cached_version file. Deleting cache."
   rm -rf $SF_REPO_DIR
fi

if [[ ! -d $SF_REPO_DIR ]]; then
      echo -e "\e[0Ksection_start:`date +%s`:sf_clone\r\e[0KCloning $SF_REPO_URL $SF_BRANCH_NAME"
      git clone --depth 1 --branch $SF_BRANCH_NAME --quiet --config advice.detachedHead=false $SF_REPO_URL
      echo >$SF_REPO_DIR/.cached_version $SF_VERSION
      echo -e "\e[0Ksection_end:`date +%s`:sf_clone\r\e[0K"
fi

cd $SF_REPO_DIR

echo -e "\e[0Ksection_start:`date +%s`:nvm_install[collapsed=true]\r\e[0KDoing nvm install"

nvm install

echo -e "\e[0Ksection_end:`date +%s`:nvm_install\r\e[0K"

if [[ -d plugins/eliatrasuite ]]; then
  rm -rf plugins/eliatrasuite
fi

mkdir -p plugins/eliatrasuite
cp -a "../babel.config.js" plugins/eliatrasuite
cp -a "../package.json" plugins/eliatrasuite
cp -a "../$SF_JSON" plugins/eliatrasuite
cp -a "../tsconfig.json" plugins/eliatrasuite
cp -a "../public" plugins/eliatrasuite
cp -a "../server" plugins/eliatrasuite
cp -a "../common" plugins/eliatrasuite
cp -a "../tests"  plugins/eliatrasuite
cp -a "../__mocks__" plugins/eliatrasuite

echo -e "\e[0Ksection_start:`date +%s`:yarn_bootstrap[collapsed=true]\r\e[0KDoing yarn bootstrap"

yarn osd bootstrap
    
echo -e "\e[0Ksection_end:`date +%s`:yarn_bootstrap\r\e[0K"

cd ..
