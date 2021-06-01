#!/bin/bash

NODE_PATH="../../node/bin/node" # The Kibana prod built-in Node.js
if [ ! -f "$NODE_PATH" ]; then
  NODE_PATH=$(which node) # Find Node.js on the system (for dev) 
fi

$NODE_PATH install_demo_configuration.js