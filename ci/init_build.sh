#!/bin/bash

set -e

# Resolve the project root. In CI it is provided via CI_PROJECT_DIR, otherwise
# default to the root folder of the project (the parent of this ci/ directory).
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="${CI_PROJECT_DIR:-$( cd "$SCRIPT_DIR/.." && pwd )}"

echo "CI_PROJECT_DIR: $CI_PROJECT_DIR"
echo "PROJECT_DIR: $PROJECT_DIR"

# Load shared helpers (start_section/end_section/...).
source "$SCRIPT_DIR/utils.sh"

# Use GNU sed. macOS ships BSD sed, which is incompatible with the in-place
# edits below, so prefer gsed (brew install gnu-sed) when it is available.
if command -v gsed >/dev/null 2>&1; then
   SED="gsed"
else
   SED="sed"
fi

SF_BRANCH_NAME="v$SF_VERSION"
#SF_RELEASE_PACKAGE_URL="https://artifacts.elastic.co/downloads/kibana/kibana-$SF_VERSION-linux-x86_64.tar.gz"

if [[ -f $SF_REPO_DIR/.cached_version ]]; then
   CACHED_VERSION=`cat $SF_REPO_DIR/.cached_version`

   if [ "$CACHED_VERSION" != "$SF_VERSION" ]; then
      echo "Cached version $CACHED_VERSION does not match requested version $SF_VERSION. Deleting cache."
      rm -rf $SF_REPO_DIR
   else
     echo "Cached version $CACHED_VERSION does match requested version $SF_VERSION. Use cache."
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
else
      echo "No git clone necessary. Wille use cache."
fi

cd $SF_REPO_DIR

# The Kibana clone is cached between runs (GitLab cache, local ./kibana) and
# this script patches tracked files in it (optimize.ts below; older script
# versions also edited package.json), and `kbn bootstrap` regenerates tracked
# files. Reset all tracked files to a pristine state so leftovers from a previous
# (possibly older) script version cannot leak into this run: e.g. a leftover
# `resolutions` entry in package.json makes the pnpm-based bootstrap fail with
# 'overrides[...] is both generated from resolutions and authored'.
# Untracked files (node_modules, .pnpm-store, .cached_version) are kept.
#
# Kibana's moon tasks run `git rev-parse --show-toplevel` in the clone. Mark the
# clone as a safe git directory so a cached clone that git considers to be of
# "dubious ownership" (cache restored as another user, su, bind mounts) does not
# fail the bootstrap with "fatal: detected dubious ownership in repository".
if ! git config --global --get-all safe.directory 2>/dev/null | grep -qxF "$PWD"; then
   git config --global --add safe.directory "$PWD"
fi
git checkout --quiet -- .

# Kibana 8.19.22+ ships @moonrepo/cli 2.4.6 (same as Kibana >= 9.5.3), and
# moon's workspace.yml has `vcs.defaultBranch: main`. Since the CI clones a
# single release branch with `--depth 1 --branch v$SF_VERSION`, the local repo
# has no `main` ref, and moon can fail with:
# "fatal: ambiguous argument 'main': unknown revision".
# Create a local `main` ref pointing at HEAD so moon can resolve it.
# We are only interested in our plugin build, so this should not affect us.
if ! git show-ref --verify --quiet refs/heads/main; then
   git update-ref refs/heads/main HEAD
fi

# Hide GitLab from moon (Kibana's build tool) for the rest of this script.
#
# Kibana 8.19.x up to 8.19.21 ships @moonrepo/cli 2.1.0; 8.19.22 (first
# pnpm-based 8.19 release) ships 2.4.6.
# `moon run` always queries the changed files, even without `--affected`. In
# CI it takes base/head from the
# ci_env crate, which detects GitLab solely via GITLAB_CI and then uses the MR
# variables CI_MERGE_REQUEST_TARGET_BRANCH_NAME (moon 2.1, Kibana 8.19/9.5.2:
# "ambiguous argument 'main-es8'") or CI_MERGE_REQUEST_DIFF_BASE_SHA (moon 2.4,
# Kibana >= 9.5.3: "fatal: bad object <sha>"). Those refer to *this plugin
# repo* and do not exist in the shallow Kibana clone. Commit and tag pipelines
# have no MR variables; moon then falls back to the default branch, sees the
# shallow clone and returns an empty file list, which is why they pass.
#
# moon is invoked from TWO places in this script, both must run without
# GITLAB_CI (782faf1e only covered the first one, so `yarn build` still failed
# in MR pipelines):
#   - `yarn kbn bootstrap`            -> moon run :build-webpack
#   - `yarn build` -> plugin-helpers build -> `yarn kbn build-shared`
#                                     -> moon run :build-webpack
# The eui fix block below also runs `yarn remove`/`yarn add` in the Kibana root,
# which triggers Kibana's root lifecycle scripts, so keep this unset before the
# first yarn/kbn command in the Kibana tree.
#
# Do NOT work around this with MOON_BASE / MOON_HEAD (see feff8bc6): on moon
# 2.1 `--base` / `--head` require `--affected`, and Kibana calls plain
# `moon run :build-webpack`, failing with "the following required arguments
# were not provided: <--affected>". Re-check this when Kibana bumps moon.
#
# Scope: without GITLAB_CI the provider detection returns Unknown and none of
# the CI_MERGE_REQUEST_* values are read, so MR pipelines behave exactly like
# commit pipelines. CI=true stays set, so moon's is_ci(), jest --ci and yarn's
# CI mode are unchanged; CI_MERGE_REQUEST_* stay set for other consumers. This
# script is sourced as the last command inside `su -s /bin/bash kibana -c ...`
# in .gitlab-ci.yml, so the job's outer shell keeps GITLAB_CI. Locally
# (./build.sh) GITLAB_CI is never set and `unset` is a no-op.
unset GITLAB_CI

echo -e "\e[0Ksection_start:`date +%s`:patch_kbn_optimizer[collapsed=true]\r\e[0KPatch kbn optimizer"

$SED -i "/observeLines(proc.stderr\!).pipe(Rx.map((line) => ({ type: 'stderr', data: line }))),/s/^/\/\//" packages/kbn-plugin-helpers/src/tasks/optimize.ts

echo -e "\e[0Ksection_end:`date +%s`:patch_kbn_optimizer\r\e[0K"


echo -e "\e[0Ksection_start:`date +%s`:nvm_install[collapsed=true]\r\e[0KDoing nvm install"

# Ensure nvm is loaded, but only if it isn't already (e.g. when this script is
# run standalone locally). In CI nvm is sourced by install_dependencies.sh, and
# re-sourcing nvm.sh there breaks the subsequent `nvm install`.
if ! command -v nvm >/dev/null 2>&1; then
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   echo "nvm loaded"
else
   echo "nvm already loaded"
fi

echo "nvm version $(nvm --version)"

nvm install

echo -e "\e[0Ksection_end:`date +%s`:nvm_install\r\e[0K"

# Kibana >= 8.19.22 / >= 9.5.x (pnpm-based) needs pnpm on the PATH for
# `kbn bootstrap` and for plugin-helpers (`pnpm kbn build-shared`). Kibana
# provisions pnpm through corepack (bundled with Node.js), pinned to the version
# in package.json "engines.pnpm". Older (yarn-based) Kibana trees have no
# "engines.pnpm", so this block is skipped there.
start_collapsed_section pnpm_setup "Setting up pnpm via corepack"
PNPM_VERSION=$(jq -r '.engines.pnpm // empty' package.json | $SED -E 's/^[^0-9]*//')
if [[ -n "$PNPM_VERSION" ]]; then
   export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
   corepack enable
   corepack prepare "pnpm@${PNPM_VERSION}" --activate
   echo "pnpm version $(pnpm --version) (engines.pnpm: $(jq -r '.engines.pnpm' package.json))"
else
   echo "No engines.pnpm in package.json, Kibana tree is yarn-based, skipping pnpm setup"
fi
end_section pnpm_setup

if [[ -d plugins/search-guard ]]; then
  rm -rf plugins/search-guard
fi




echo -e "\e[0Ksection_start:`date +%s`:yarn_bootstrap[collapsed=true]\r\e[0KDoing yarn bootstrap"
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
cp -a "../.kibana-plugin-helpers.json" plugins/search-guard


cd plugins/search-guard

echo -e "\e[0Ksection_start:`date +%s`:yarn_install[collapsed=true]\r\e[0KDoing yarn install"

yarn install

echo -e "\e[0Ksection_end:`date +%s`:yarn_install\r\e[0K"

start_section tests "Unit Tests"

export JEST_JUNIT_OUTPUT_FILE=$PROJECT_DIR/junit-server.xml
../../node_modules/.bin/jest --clearCache && ../../node_modules/.bin/jest --testPathIgnorePatterns=server --config ./tests/jest.config.js --reporters="default"
export JEST_JUNIT_OUTPUT_FILE=$PROJECT_DIR/junit-public.xml
../../node_modules/.bin/jest --clearCache && ../../node_modules/.bin/jest --testPathIgnorePatterns=public  --config ./tests/jest.config.js --reporters="default"
end_section tests
rm -rf "node_modules"
start_section build "Building Search Guard Plugin"
start_section yarn_install "Doing yarn install --production"
yarn install --production --frozen-lockfile
end_section yarn_install
start_section yarn_build "Doing yarn build -v $SF_VERSION --skip-archive"

# This was a fix for 8.10.4 but it should not be neccessary for >= 8.11.4
#export NODE_OPTIONS=--openssl-legacy-provider

yarn build -v $SF_VERSION --skip-archive

# Since Kibana 8.19.22 plugin-helpers install the plugin's production
# dependencies with `pnpm install --prod` from a pnpm-lock.yaml. This plugin
# keeps yarn.lock as its single lockfile, so .kibana-plugin-helpers.json sets
# skipInstallDependencies=true and we do the install ourselves, exactly like
# plugin-helpers <= 8.19.21 did (yarn install --production in the build dir).
# plugin-helpers copy package.json but not yarn.lock into the build dir.
start_section plugin_deps "Installing plugin production dependencies into build dir"
cp -a yarn.lock build/kibana/searchguard/
(cd build/kibana/searchguard && yarn install --production --frozen-lockfile)
end_section plugin_deps

# Fix only for Kibana 8.7.x
cd build
find ./ -type f -exec $SED -i -e 's#".*core-doc-links-server-internal"#"@kbn/core-doc-links-server-internal"#g' {} \;
find ./ -type f -exec $SED -i -e 's#".*packages/kbn-config-schema"#"@kbn/config-schema"#g' {} \;
find ./ -type f -exec $SED -i -e 's#".*core-saved-objects-migration-server-internal"#"@kbn/core-saved-objects-migration-server-internal"#g' {} \;
find ./ -type f -exec $SED -i -e 's#".*core-http-router-server-internal"#"@kbn/core-http-router-server-internal"#g' {} \;
find ./ -type f -exec $SED -i -e 's#".*core-http-server"#"@kbn/core-http-server"#g' {} \;
cd ..

end_section yarn_build
end_section build
# Move build result from repo dir to the build folder in the project root dir.
cd $PROJECT_DIR
rm -rf build
mv $SF_REPO_DIR/plugins/search-guard/build build
# Remove search-guard dir from repo to have a clean repo for the Gitlab CI cache
rm -rf $SF_REPO_DIR/plugins/search-guard