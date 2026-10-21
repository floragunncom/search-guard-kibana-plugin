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

# The Kibana clone is cached between runs (GitLab cache, local ./kibana) and
# this script patches tracked files in it (optimize.ts below), and `kbn bootstrap`
# regenerates tracked files. Reset all tracked files to a pristine state so
# leftovers from a previous (possibly older) script version cannot leak into this
# run. Untracked files (node_modules, .pnpm-store, .cached_version) are kept.
#
# Kibana's moon tasks run `git rev-parse --show-toplevel` in the clone. Mark the
# clone as a safe git directory so a cached clone that git considers to be of
# "dubious ownership" (cache restored as another user, su, bind mounts) does not
# fail the bootstrap with "fatal: detected dubious ownership in repository".
if ! git config --global --get-all safe.directory 2>/dev/null | grep -qxF "$PWD"; then
   git config --global --add safe.directory "$PWD"
fi
git checkout --quiet -- .

# Kibana >= 9.3 bootstraps via moon, and moon's workspace.yml has
# `vcs.defaultBranch: main`. Since the CI clones a single release branch
# with `--depth 1 --branch v$SF_VERSION`, the local repo has no `main` ref,
# and moon fails with: "fatal: ambiguous argument 'main': unknown revision".
# Create a local `main` ref pointing at HEAD so moon can resolve it.
# We are only interested in our plugin build, so this should not affect us.
if ! git show-ref --verify --quiet refs/heads/main; then
   git update-ref refs/heads/main HEAD
fi

# Hide GitLab from moon (Kibana's build tool) for the rest of this script.
#
# `moon run` always queries the changed files, even without `--affected`. In CI
# it takes base/head from its ci_env crate, which detects GitLab solely via
# GITLAB_CI and then reads GitLab's pipeline variables: CI_COMMIT_BEFORE_SHA /
# CI_COMMIT_SHA on push pipelines, CI_MERGE_REQUEST_DIFF_BASE_SHA on MR
# pipelines. Those SHAs refer to *this plugin repo* and do not exist in the
# shallow Kibana clone, so with the moon 2.4.x shipped by Kibana >= 9.5.3 the
# bootstrap fails with e.g.
#   Unable to resolve a merge base between the base and head revisions ...
#   fatal: bad object a7a8e3faabda7c3286ba6d376db06bb0b16d815a
#
# moon is invoked from TWO places in this script, both must run without GITLAB_CI:
#   - `pnpm kbn bootstrap`                          -> moon run :build-webpack
#   - plugin_helpers build -> `pnpm kbn build-shared` -> moon run :build-webpack
#
# Do NOT work around this with MOON_BASE / MOON_HEAD: `--base` / `--head` may
# require `--affected`, and Kibana calls plain `moon run :build-webpack`.
# Re-check this when Kibana bumps moon.
#
# Scope: without GITLAB_CI the provider detection returns Unknown and none of
# the CI_MERGE_REQUEST_* values are read, so MR pipelines behave exactly like
# commit pipelines. CI=true stays set, so moon's is_ci(), jest --ci and pnpm's
# CI mode (frozen lockfile) are unchanged; CI_MERGE_REQUEST_* stay set for other
# consumers. This script is sourced as the last command inside
# `su -s /bin/bash kibana -c ...` in .gitlab-ci.yml, so the job's outer shell
# keeps GITLAB_CI. Locally GITLAB_CI is never set and `unset` is a no-op.
unset GITLAB_CI

echo -e "\e[0Ksection_start:`date +%s`:patch_kbn_optimizer[collapsed=true]\r\e[0KPatch kbn optimizer"

sed -i "/observeLines(proc.stderr\!).pipe(Rx.map((line) => ({ type: 'stderr', data: line }))),/s/^/\/\//" packages/kbn-plugin-helpers/src/tasks/optimize.ts

echo -e "\e[0Ksection_end:`date +%s`:patch_kbn_optimizer\r\e[0K"


echo -e "\e[0Ksection_start:`date +%s`:nvm_install[collapsed=true]\r\e[0KDoing nvm install"

nvm install

echo -e "\e[0Ksection_end:`date +%s`:nvm_install\r\e[0K"

start_collapsed_section pnpm_setup "Enabling corepack-managed pnpm"

# Kibana >= 9.5.5 is bootstrapped with pnpm instead of yarn. Like Kibana's own CI
# (.buildkite/scripts/common/setup_node.sh) we provision the exact version pinned in
# Kibana's package.json "engines.pnpm" through corepack, which ships with Node.js.
PNPM_VERSION="$(node -p "require('./package.json').engines.pnpm.replace(/^[^\d]*/, '')")"
corepack enable
corepack prepare "pnpm@${PNPM_VERSION}" --activate
echo "    -> pnpm $(pnpm --version)"

end_section pnpm_setup

if [[ -d plugins/search-guard ]]; then
  rm -rf plugins/search-guard
fi

echo -e "\e[0Ksection_start:`date +%s`:pnpm_bootstrap[collapsed=true]\r\e[0KDoing pnpm kbn bootstrap"

# Note: the former "npx update-browserslist-db@latest" workaround was dropped. With pnpm it
# rewrites Kibana's pnpm-lock.yaml, and bootstrap runs "pnpm install --frozen-lockfile" in CI.

pnpm kbn bootstrap

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

# The plugin's own pnpm-workspace.yaml makes this a standalone pnpm workspace with a
# flat (hoisted) node_modules and no auto-installed peers (react etc. must come from Kibana).
pnpm install --frozen-lockfile

echo -e "\e[0Ksection_end:`date +%s`:pnpm_install\r\e[0K"

start_section tests "Unit Tests"

export JEST_JUNIT_OUTPUT_FILE=$CI_PROJECT_DIR/junit-server.xml
../../node_modules/.bin/jest --clearCache && ../../node_modules/.bin/jest --testPathIgnorePatterns=server --config ./tests/jest.config.js --reporters="default"
export JEST_JUNIT_OUTPUT_FILE=$CI_PROJECT_DIR/junit-public.xml
../../node_modules/.bin/jest --clearCache && ../../node_modules/.bin/jest --testPathIgnorePatterns=public  --config ./tests/jest.config.js --reporters="default"
end_section tests
rm -rf "node_modules"
start_section build "Building Search Guard Plugin"
start_section pnpm_install "Doing pnpm install --prod"
pnpm install --prod --frozen-lockfile
end_section pnpm_install
start_section plugin_build "Doing plugin_helpers build -v $SF_VERSION --skip-archive"

# This was a fix for 8.10.4 but it should not be neccessary for >= 8.11.4
#export NODE_OPTIONS=--openssl-legacy-provider

node ../../scripts/plugin_helpers build -v $SF_VERSION --skip-archive

# plugin_helpers would run "pnpm install --prod --ignore-workspace" inside the build dir, which
# ignores our pnpm-workspace.yaml settings. We disable that via .kibana-plugin-helpers.json
# (skipInstallDependencies) and ship the production node_modules installed above instead.
mv node_modules build/kibana/searchguard/node_modules

# Fix only for Kibana 8.7.x
cd build
find ./ -type f -exec sed -i -e 's#".*core-doc-links-server-internal"#"@kbn/core-doc-links-server-internal"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*packages/kbn-config-schema"#"@kbn/config-schema"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*core-saved-objects-migration-server-internal"#"@kbn/core-saved-objects-migration-server-internal"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*core-http-router-server-internal"#"@kbn/core-http-router-server-internal"#g' {} \;
find ./ -type f -exec sed -i -e 's#".*core-http-server"#"@kbn/core-http-server"#g' {} \;
cd ..

end_section plugin_build
end_section build
# Move build result from repo dir to the build folder in the CI root dir.
cd $CI_PROJECT_DIR
rm -rf build
mv $SF_REPO_DIR/plugins/search-guard/build build
# Remove search-guard dir from repo to have a clean repo for the Gitlab CI cache
rm -rf $SF_REPO_DIR/plugins/search-guard
