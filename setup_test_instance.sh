#!/bin/bash

set -e

MAIN_DIR=~/searchguard-test
DOWNLOAD_CACHE="$MAIN_DIR/download-cache"
INSTALL_DIR="$MAIN_DIR/ki"
REPO_DIR=$(pwd)

VERSION=$(grep -e '\bversion\b' package.json | tr -d "[:blank:]" | sed -E 's/"version":"(.*)"(.*)/\1/')
KI_VERSION=$(echo "$VERSION" | cut -d "-" -f 1)
echo "KI version: $KI_VERSION"

if ! ./build.sh install-local; then
  echo "Building Search Guard Kibana Plugin failed"
  exit 1
fi

mkdir -p "$DOWNLOAD_CACHE"

if [[ "$OSTYPE"  == "linux"* ]]; then
  KI_ARCHIVE="kibana-$KI_VERSION-linux-x86_64.tar.gz"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  KI_ARCHIVE="kibana-$KI_VERSION-darwin-x86_64.tar.gz"
else
  echo "OS type $OSTYPE not supported"
  exit
fi

if [ ! -f "$DOWNLOAD_CACHE/$KI_ARCHIVE" ]; then
	wget "https://artifacts.elastic.co/downloads/kibana/$KI_ARCHIVE" -P "$DOWNLOAD_CACHE"
fi

if [ -d "$INSTALL_DIR" ]; then
  rm -r "$INSTALL_DIR"
fi

mkdir -p "$INSTALL_DIR"

echo "Extracting $KI_ARCHIVE to $INSTALL_DIR"

tar xfz "$DOWNLOAD_CACHE/$KI_ARCHIVE" -C "$INSTALL_DIR" --strip-components 1

cd "$INSTALL_DIR"

KI_SNAPSHOT=$(echo "$REPO_DIR"/target/releases/search-guard-kibana-plugin-*.zip)
bin/kibana-plugin install file:///"$KI_SNAPSHOT"

chmod u+x plugins/searchguard/install_demo_configuration.sh

cd plugins/searchguard
./install_demo_configuration.sh

cd ../../
echo "Starting Kibana"
bin/kibana