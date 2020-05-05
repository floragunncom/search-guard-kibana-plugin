#!/bin/bash

set -e

echo
echo "SGD-231/SGD-19 The patch makes it possible to work with Kibana which is embeded in an iframe on a third party website."
echo "Read more about SameSite=None: https://www.chromestatus.com/feature/5633521622188032 and https://web.dev/samesite-cookies-explained/" 
echo
echo "The following configuration of kibana.yml is required:"
echo "searchguard:"
echo "  cookie:"
echo "    secure: true"
echo "    isSameSite: None"
echo

HAPI_COOKIE_PATH="node_modules/hapi-auth-cookie/lib/index.js"
HAPI_STATEHOOD_PATH="../../node_modules/statehood/lib/index.js"

sed -i.bak "s/isSameSite: Joi.valid('Strict', 'Lax')/isSameSite: Joi.valid('Strict', 'Lax', 'None')/" $HAPI_COOKIE_PATH
sed -i.bak "s/isSameSite: Joi.valid('Strict', 'Lax')/isSameSite: Joi.valid('Strict', 'Lax', 'None')/" $HAPI_STATEHOOD_PATH

echo "Patched $HAPI_COOKIE_PATH. The original file backup is in $HAPI_COOKIE_PATH.bak"
echo "Patched $HAPI_STATEHOOD_PATH. The original file backup is in $HAPI_STATEHOOD_PATH.bak"