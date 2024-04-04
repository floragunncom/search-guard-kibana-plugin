#!/bin/bash

set -ex

REPOSITORY=$1
ARTIFACT=$2
VERSION=$3
TYPE=$4
FILTER=$5

SEARCH_RESULT=$(curl -LSs --max-redirs 1 --fail "https://maven.search-guard.com/api/search/gavc?g=com.floragunn&a=$ARTIFACT&v=$VERSION&repos=$REPOSITORY")

if [ -z $FILTER ]; then
  METADATA_URI=$(echo $SEARCH_RESULT | jq -r ".results | map(select(.uri | endswith(\"$TYPE\"))) | max_by(.uri) | .uri")
else
  METADATA_URI=$(echo $SEARCH_RESULT | jq -r ".results | map(select(.uri | endswith(\"$TYPE\"))) | map(select(.uri | endswith(\"$FILTER\") | not)) | max_by(.uri) | .uri")
fi

if [ -z $METADATA_URI ] | [ "$METADATA_URI" = "null" ]; then
  echo "Could not find artifact $1 $2 $3 $4 $5" >&2 
  exit 1
fi

METADATA=$(curl -LSs --max-redirs 1 --fail $METADATA_URI)

echo $(echo $METADATA | jq -r '.downloadUri')