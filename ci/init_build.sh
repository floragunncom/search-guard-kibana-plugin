#!/bin/bash

set -e

SF_BRANCH_NAME="v$SF_VERSION"
SF_RELEASE_PACKAGE_URL="https://artifacts.elastic.co/downloads/kibana/kibana-$SF_VERSION-linux-x86_64.tar.gz"

if [[ -f $SF_REPO_DIR/.cached_version ]]; then
   CACHED_VERSION=`cat $SF_REPO_DIR/.cached_version`

   if [ "$CACHED_VERSION" != "$SF_VERSION" ]; then
      echo "Cached version $CACHED_VERSION does not match requested version $SF_VERSION. Deleting cache."
      rm -rf $SF_REPO_DIR
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

# The cache is restored with a different owner than the build user; git refuses to work
# on it otherwise ("fatal: detected dubious ownership in repository").
git config --global --add safe.directory "$(pwd)"

# moon (run by `pnpm kbn bootstrap` and `plugin_helpers build`) detects the GitLab CI
# environment and tries to compare against the pipeline SHAs of THIS repo, which do not
# exist in the Kibana checkout ("Detected a shallow checkout while comparing against an
# explicit base" / "fatal: bad object <sha>"). Hide the CI from moon.
unset GITLAB_CI

# Kibana >= 9.3 bootstraps via moon, and moon's workspace.yml has
# `vcs.defaultBranch: main`. Since the CI clones a single release branch
# with `--depth 1 --branch v$SF_VERSION`, the local repo has no `main` ref,
# and moon fails with: "fatal: ambiguous argument 'main': unknown revision".
# Create a local `main` ref pointing at HEAD so moon can resolve it.
# We are only interested in our plugin build, so this should not affect us.
if ! git show-ref --verify --quiet refs/heads/main; then
   git update-ref refs/heads/main HEAD
fi

echo -e "\e[0Ksection_start:`date +%s`:patch_kbn_optimizer[collapsed=true]\r\e[0KPatch kbn optimizer"

sed -i "/observeLines(proc.stderr\!).pipe(Rx.map((line) => ({ type: 'stderr', data: line }))),/s/^/\/\//" packages/kbn-plugin-helpers/src/tasks/optimize.ts

echo -e "\e[0Ksection_end:`date +%s`:patch_kbn_optimizer\r\e[0K"


echo -e "\e[0Ksection_start:`date +%s`:nvm_install[collapsed=true]\r\e[0KDoing nvm install"

# Node version from Kibana's .node-version
nvm install

echo -e "\e[0Ksection_end:`date +%s`:nvm_install\r\e[0K"

echo -e "\e[0Ksection_start:`date +%s`:pnpm_install[collapsed=true]\r\e[0KInstalling pnpm"

# Kibana >= 9.5 uses pnpm (engines.pnpm / packageManager in Kibana's package.json)
PNPM_VERSION=$(node -p "require('./package.json').engines.pnpm.replace(/^[^\d]*/, '')")
npm install -g "pnpm@$PNPM_VERSION"
echo "node $(node -v), pnpm $(pnpm -v)"

echo -e "\e[0Ksection_end:`date +%s`:pnpm_install\r\e[0K"

if [[ -d plugins/search-guard ]]; then
  rm -rf plugins/search-guard
fi

echo -e "\e[0Ksection_start:`date +%s`:pnpm_bootstrap[collapsed=true]\r\e[0KDoing pnpm kbn bootstrap"

CI=true pnpm kbn bootstrap

echo -e "\e[0Ksection_end:`date +%s`:pnpm_bootstrap\r\e[0K"


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
cp -a "../pnpm-lock.yaml" plugins/search-guard
cp -a "../pnpm-workspace.yaml" plugins/search-guard
cp -a "../.kibana-plugin-helpers.json" plugins/search-guard

cd plugins/search-guard

echo -e "\e[0Ksection_start:`date +%s`:pnpm_install[collapsed=true]\r\e[0KDoing pnpm install"

CI=true pnpm install --frozen-lockfile

echo -e "\e[0Ksection_end:`date +%s`:pnpm_install\r\e[0K"

start_section tests "Unit Tests"

export JEST_JUNIT_OUTPUT_FILE=$CI_PROJECT_DIR/junit-server.xml
../../node_modules/.bin/jest --clearCache && ../../node_modules/.bin/jest --testPathIgnorePatterns=server --config ./tests/jest.config.js --reporters="default"
export JEST_JUNIT_OUTPUT_FILE=$CI_PROJECT_DIR/junit-public.xml
../../node_modules/.bin/jest --clearCache && ../../node_modules/.bin/jest --testPathIgnorePatterns=public  --config ./tests/jest.config.js --reporters="default"
end_section tests
rm -rf "node_modules"
start_section build "Building Search Guard Plugin"
start_section pnpm_install "Doing pnpm install --prod --frozen-lockfile"
CI=true pnpm install --prod --frozen-lockfile
end_section pnpm_install
start_section pnpm_build "Doing plugin_helpers build -v $SF_VERSION --skip-archive"

# This was a fix for 8.10.4 but it should not be neccessary for >= 8.11.4
#export NODE_OPTIONS=--openssl-legacy-provider

# .kibana-plugin-helpers.json sets skipInstallDependencies; node_modules is moved into the build below
node ../../scripts/plugin_helpers build -v $SF_VERSION --skip-archive

# Fix only for Kibana 8.7.x
cd build
find ./ -type f -exec sed -i -e 's#".*core-doc-links-server-internal"#"@kbn/core-doc-links-server-internal"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*packages/kbn-config-schema"#"@kbn/config-schema"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*core-saved-objects-migration-server-internal"#"@kbn/core-saved-objects-migration-server-internal"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*core-http-router-server-internal"#"@kbn/core-http-router-server-internal"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*core-http-server"#"@kbn/core-http-server"#g' {} \;
cd ..

end_section pnpm_build
# plugin_helpers does not copy node_modules when skipInstallDependencies is set
mv node_modules build/kibana/searchguard/node_modules
end_section build
# Move build result from repo dir to the build folder in the CI root dir.
cd $CI_PROJECT_DIR
rm -rf build
mv $SF_REPO_DIR/plugins/search-guard/build build
# Remove search-guard dir from repo to have a clean repo for the Gitlab CI cache
rm -rf $SF_REPO_DIR/plugins/search-guard
