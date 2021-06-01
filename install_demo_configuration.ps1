$NODE_PATH = ".\..\..\node\nnode.exe" # The Kibana prod built-in Node.js
if(!(Test-Path $NODE_PATH])) {
    $NODE_PATH = (gcm node.exe).Path # Find Node.js on the system
}

$ARG = "install_demo_configuration.js"
& $NODE_PATH $ARG