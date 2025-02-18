#!/bin/bash
set -e

# Start Elasticsearch in the background
/usr/share/elasticsearch/bin/elasticsearch -d

sleep 13

# Start Kibana in the foreground
/usr/share/kibana/bin/kibana
