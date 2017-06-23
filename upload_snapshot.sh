#!/bin/bash
PLUGIN_NAME=searchguard-kibana
PLUGIN_VERSION=5.4.0-4-SNAPSHOT

echo "Uploading ./releases/$PLUGIN_VERSION/$PLUGIN_NAME-$PLUGIN_VERSION.zip"
cresponse=$(curl --write-out %{http_code} --silent --output uploadresult -X POST -F fileUpload=@./releases/$PLUGIN_VERSION/$PLUGIN_NAME-$PLUGIN_VERSION.zip 'https://www.filestackapi.com/api/store/S3?key=$FILESTACK_KEY')
response="$(echo "$cresponse" | cut -c1-3)"

if ! [[ $response == "200" ]] ; then
  echo "Upload failed with status $response"
  exit 1
fi

echo "Upload response: $response"
