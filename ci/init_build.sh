#!/bin/bash

set -e

SF_BRANCH_NAME="v$SF_VERSION"
SF_RELEASE_PACKAGE_URL="https://artifacts.elastic.co/downloads/kibana/kibana-$SF_VERSION-linux-x86_64.tar.gz"

if [[ -f $SF_REPO_DIR/.cached_version ]]; then
   CACHED_VERSION=`cat $SF_REPO_DIR/.cached_version`

   if [ "$CACHED_VERSION" != "$SF_VERSION" ]; then
      echo "Cached version $CACHED_VERSION does not match requested version $SF_VERSION. Deleting cache."
      rm -rf $SF_REPO_DIR
   else
     echo  "Using cached version $(cat $SF_REPO_DIR/.cached_version)"
   fi
elif [[ -d $SF_REPO_DIR ]]; then
   echo "No cached_version file. Deleting cache."
   rm -rf $SF_REPO_DIR
fi

if [[ ! -d $SF_REPO_DIR ]]; then
      echo -e "\e[0Ksection_start:`date +%s`:sf_clone\r\e[0KCloning $SF_REPO_URL $SF_BRANCH_NAME"
      git clone --depth 1 --branch $SF_BRANCH_NAME --quiet --config advice.detachedHead=false $SF_REPO_URL
      echo >$SF_REPO_DIR/.cached_version $SF_VERSION
      echo -e "\e[0Ksection_end:`date +%s`:sf_clone\r\e[0K"
fi

cd $SF_REPO_DIR




echo -e "\e[0Ksection_start:`date +%s`:patch_kbn_optimizer[collapsed=true]\r\e[0KPatch kbn optimizer"

sed -i "/observeLines(proc.stderr\!).pipe(Rx.map((line) => ({ type: 'stderr', data: line }))),/s/^/\/\//" packages/kbn-plugin-helpers/src/tasks/optimize.ts

echo -e "\e[0Ksection_end:`date +%s`:patch_kbn_optimizer\r\e[0K"


echo -e "\e[0Ksection_start:`date +%s`:nvm_install[collapsed=true]\r\e[0KDoing nvm install"

nvm install

echo -e "\e[0Ksection_end:`date +%s`:nvm_install\r\e[0K"

if [[ -d plugins/search-guard ]]; then
  rm -rf plugins/search-guard
fi

# This should not be needed for >= 8.11.4
#if grep -q "$packages.atlassian.com/api/npm/npm-remote/react-remove-scroll/-/react-remove-scroll-2.5.6.tgz" "yarn.lock"; then
#    echo -e "\e[0Ksection_start:`date +%s`:patch_yarn_lock[collapsed=true]\r\e[0KPatching yarn.lock file"
#    echo "Patching react-remove-scroll-2.5.6 in yarn.lock file"
#
#    patch yarn.lock << 'EOF'
#--- yarn.lock
#+++ yarn.lock
#@@ -25275,9 +25275,9 @@
#     react-style-singleton "^2.2.1"
#     tslib "^2.0.0"
#
#-react-remove-scroll@^2.5.6:
#+react-remove-scroll@2.5.6:
#   version "2.5.6"
#-  resolved "https://packages.atlassian.com/api/npm/npm-remote/react-remove-scroll/-/react-remove-scroll-2.5.6.tgz#7510b8079e9c7eebe00e65a33daaa3aa29a10336"
#+  resolved "https://registry.yarnpkg.com/react-remove-scroll/-/react-remove-scroll-2.5.6.tgz#7510b8079e9c7eebe00e65a33daaa3aa29a10336"
#   integrity sha512-bO856ad1uDYLefgArk559IzUNeQ6SWH4QnrevIUjH+GczV56giDfl3h0Idptf2oIKxQmd1p9BN25jleKodTALg==
#   dependencies:
#     react-remove-scroll-bar "^2.3.4"
#EOF
#  echo -e "\e[0Ksection_end:`date +%s`:patch_yarn_lock\r\e[0K"
#fi


echo -e "\e[0Ksection_start:`date +%s`:yarn_bootstrap[collapsed=true]\r\e[0KDoing yarn bootstrap"

# Prevent warning about outdated caniuse-lite, which seems to block the build
if grep -q '"@elastic/eui@104.0.0-amsterdam.0"' yarn.lock; then
   rm -rf ./node_modules/@elastic/eui-amsterdam
   echo "Update checksums"
   yarn install --update-checksums
fi
npx update-browserslist-db@latest


yarn kbn bootstrap

echo -e "\e[0Ksection_end:`date +%s`:yarn_bootstrap\r\e[0K"


mkdir -p plugins/search-guard
cp -a "../babel.config.js" plugins/search-guard
cp -a "../package.json" plugins/search-guard
cp -a "../$SF_JSON" plugins/search-guard
cp -a "../tsconfig.json" plugins/search-guard
cp -a "../public" plugins/search-guard
cp -a "../server" plugins/search-guard
cp -a "../common" plugins/search-guard
cp -a "../tests"  plugins/search-guard
cp -a "../__mocks__" plugins/search-guard
cp -a "../yarn.lock" plugins/search-guard

# Prevent warning about outdated caniuse-lite, which seems to block the build
npx --yes update-browserslist-db@latest

cd plugins/search-guard

echo -e "\e[0Ksection_start:`date +%s`:yarn_install[collapsed=true]\r\e[0KDoing yarn install"

yarn install

echo -e "\e[0Ksection_end:`date +%s`:yarn_install\r\e[0K"

start_section tests "Unit Tests"

export JEST_JUNIT_OUTPUT_FILE=$CI_PROJECT_DIR/junit-server.xml
../../node_modules/.bin/jest --clearCache && ../../node_modules/.bin/jest --testPathIgnorePatterns=server --config ./tests/jest.config.js --reporters="default"
export JEST_JUNIT_OUTPUT_FILE=$CI_PROJECT_DIR/junit-public.xml
../../node_modules/.bin/jest --clearCache && ../../node_modules/.bin/jest --testPathIgnorePatterns=public  --config ./tests/jest.config.js --reporters="default"
end_section tests
rm -rf "node_modules"
start_section build "Building Search Guard Plugin"
start_section yarn_install "Doing yarn install --production"
yarn install --production #--frozen-lockfile
end_section yarn_install
start_section yarn_build "Doing yarn build -v $SF_VERSION --skip-archive"

# This was a fix for 8.10.4 but it should not be neccessary for >= 8.11.4
#export NODE_OPTIONS=--openssl-legacy-provider

yarn build -v $SF_VERSION --skip-archive

# Fix only for Kibana 8.7.x
cd build
find ./ -type f -exec sed -i -e 's#".*core-doc-links-server-internal"#"@kbn/core-doc-links-server-internal"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*packages/kbn-config-schema"#"@kbn/config-schema"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*core-saved-objects-migration-server-internal"#"@kbn/core-saved-objects-migration-server-internal"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*core-http-router-server-internal"#"@kbn/core-http-router-server-internal"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*core-http-server"#"@kbn/core-http-server"#g' {} \;
cd ..

end_section yarn_build
end_section build
# Move build result from repo dir to the build folder in the CI root dir.
cd $CI_PROJECT_DIR
rm -rf build
mv $SF_REPO_DIR/plugins/search-guard/build build
# Remove search-guard dir from repo to have a clean repo for the Gitlab CI cache
rm -rf $SF_REPO_DIR/plugins/search-guard
