#!/bin/bash
 
set -e
set -x
 
if [[ "$1" == "staging" ]]; then
   MVN_DEPLOY_OPTS="-DaltDeploymentRepository=staging::default::https://maven.search-guard.com:443/search-guard-flx-staging -Prelease"
   ci/setup_gpg.sh
else
   MVN_DEPLOY_OPTS=""
fi

echo -e "\e[0Ksection_start:`date +%s`:deploy\r\e[0KDeploying build"
mvn --batch-mode -s settings.xml -Drevision="$BUILD_VERSION" $MVN_DEPLOY_OPTS clean deploy | tee deploy.out
echo -e "\e[0Ksection_end:`date +%s`:deploy\r\e[0K"

SG_SF_PLUGIN=$(grep -E "Uploaded to .*: https://.*/search-guard-[a-z\-]+-plugin-.*[0-9]+.zip " deploy.out| grep -o 'http.*zip')

echo "==================================="
echo "Deployed to $SG_SF_PLUGIN"
echo "==================================="

if [ -z "$IT_BRANCH" ]; then
  if [ "$CI_COMMIT_REF_NAME" != "master" ] && [ -n $(git ls-remote --heads https://gitlab-ci-token:${CI_JOB_TOKEN}@git.floragunn.com/private/search-guard-integration-tests.git $CI_COMMIT_REF_NAME) ]; then
    IT_BRANCH="$CI_COMMIT_REF_NAME"
  else
    MAJOR=$(echo $SF_VERSION | cut -d. -f1-2)
    IT_BRANCH="$MAJOR.x"
  fi
fi
if [ -z "$ES_VERSION" ]; then
  ES_VERSION=$SF_VERSION
fi

if [ -z "$SG_ES_PLUGIN" ] && [ "$1" == "staging" ]; then
  SG_ES_PLUGIN="$ES_VERSION-*"
fi

if [[ ! "$SG_ES_PLUGIN" =~ ^https?:.*$ ]]; then
  # expand any variables in $SG_ES_PLUGIN
  SG_ES_PLUGIN=$(eval echo $SG_ES_PLUGIN)
  if [[ "$SG_ES_PLUGIN" =~ .*SNAPSHOT.* ]]; then
    SG_ES_PLUGIN=$(ci/artifact_uri.sh $SG_SB_PLUGIN_SNAPSHOT_REPO $SG_SB_PLUGIN_NAME $SG_ES_PLUGIN .zip sgadmin-standalone.zip)
    echo "Found: $SG_ES_PLUGIN"
  else
    SG_ES_PLUGIN=$(ci/artifact_uri.sh $SG_SB_PLUGIN_RELEASE_REPO $SG_SB_PLUGIN_NAME $SG_ES_PLUGIN .zip sgadmin-standalone.zip)
    echo "Found: $SG_ES_PLUGIN"
  fi
fi	

SG_ADMIN="https://maven.search-guard.com/search-guard-suite-release/com/floragunn/search-guard-suite-plugin/7.10.2-53.5.0/search-guard-suite-plugin-7.10.2-53.5.0-sgadmin-standalone.zip"

echo "SG_ES_PLUGIN=$SG_ES_PLUGIN" >> build.env
echo "ES_VERSION=$ES_VERSION" >>build.env
echo "SG_KI_PLUGIN=$SG_SF_PLUGIN" >>build.env
echo "KI_VERSION=$SF_VERSION" >>build.env
echo "IT_BRANCH=$IT_BRANCH" >>build.env

echo "============ build.env ============"
cat build.env
echo "==================================="
