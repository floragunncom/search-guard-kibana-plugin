#!/bin/bash

set -e 

SF_BRANCH_NAME="v$SF_VERSION"

if [[ -f kibana/.cached_version ]]; then
   CACHED_VERSION=`cat kibana/.cached_version`

   if [ "$CACHED_VERSION" != "$SF_VERSION" ]; then 
      echo "Cached version $CACHED_VERSION does not match requested version $SF_VERSION. Deleting cache."
      rm -rf kibana
   fi
elif [[ -d kibana ]]; then
   echo "No cached_version file. Deleting cache."
   rm -rf kibana
fi

if [[ ! -d kibana ]]; then
      echo -e "\e[0Ksection_start:`date +%s`:sf_clone\r\e[0KCloning $SF_REPO_URL $SF_BRANCH_NAME"
      git clone --depth 1 --branch $SF_BRANCH_NAME --quiet --config advice.detachedHead=false $SF_REPO_URL
      echo >kibana/.cached_version $SF_VERSION
      echo -e "\e[0Ksection_end:`date +%s`:sf_clone\r\e[0K"
fi

cd kibana

echo -e "\e[0Ksection_start:`date +%s`:nvm_install[collapsed=true]\r\e[0KDoing nvm install"

nvm install

echo -e "\e[0Ksection_end:`date +%s`:nvm_install\r\e[0K"

if [[ -d plugins/search-guard ]]; then
  rm -rf plugins/search-guard 
fi

mkdir -p plugins/search-guard
cp -a "../babel.config.js" plugins/search-guard
cp -a "../package.json" plugins/search-guard
cp -a "../kibana.json" plugins/search-guard
cp -a "../tsconfig.json" plugins/search-guard
cp -a "../public" plugins/search-guard
cp -a "../server" plugins/search-guard
cp -a "../common" plugins/search-guard
cp -a "../tests"  plugins/search-guard
cp -a "../__mocks__" plugins/search-guard

echo -e "\e[0Ksection_start:`date +%s`:yarn_bootstrap[collapsed=true]\r\e[0KDoing yarn bootstrap"

yarn kbn bootstrap --oss

echo -e "\e[0Ksection_end:`date +%s`:yarn_bootstrap\r\e[0K"

cd ..
