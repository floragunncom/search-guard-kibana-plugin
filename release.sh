#!/bin/bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
./clean.sh
./build.sh "$1"
mvn clean deploy -Prelease