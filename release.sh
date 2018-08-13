#!/bin/bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
# check version matches. Do not use jq here, only bash
while read -r line
do
    if [[ "$line" =~ ^\"version\".* ]]; then
      if [[ "$line" != "\"version\": \"$1-$2\"," ]]; then
        echo "Provided version \"version\": \"$1-$2\" does not match Kibana version: $line"
        exit 1;
      fi
    fi
done < "package.json"
./clean.sh
./build.sh "$1" "$2"
mvn clean deploy -Prelease
