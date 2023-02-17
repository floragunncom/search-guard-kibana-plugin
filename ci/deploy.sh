#!/bin/bash
 
set -e
set -x
 
if [[ "$1" == "staging" ]]; then
   MVN_DEPLOY_OPTS="-DaltDeploymentRepository=staging::default::https://maven.eliatra.com/artifactory/eliatra-suite-staging -Prelease"
   ci/setup_gpg.sh
else
   MVN_DEPLOY_OPTS=""
fi

echo -e "\e[0Ksection_start:`date +%s`:deploy\r\e[0KDeploying build"
mvn --batch-mode -s settings.xml -Drevision="$BUILD_VERSION" $MVN_DEPLOY_OPTS clean deploy | tee deploy.out
echo -e "\e[0Ksection_end:`date +%s`:deploy\r\e[0K"

OSD_PLUGIN=$(grep -E "Uploaded to .*: https://.*/eliatra-suite-opensearch-dashboards-plugin-.*[0-9]+.zip " deploy.out| grep -o 'http.*zip')

echo "==================================="
echo "Deployed to $OSD_PLUGIN"
echo "==================================="

if [ -z "$IT_BRANCH" ]; then
  if [ "$CI_COMMIT_REF_NAME" != "master" ] && [ -n $(git ls-remote --heads https://gitlab-ci-token:${CI_JOB_TOKEN}@git.eliatra.com/eliatra-suite/eliatra-opensearch-integration-tests.git $CI_COMMIT_REF_NAME) ]; then
    IT_BRANCH="$CI_COMMIT_REF_NAME"
  else
    MAJOR=$(echo $OSD_VERSION | cut -d. -f1-2)
    IT_BRANCH="$MAJOR.x"
  fi
fi
if [ -z "$OS_VERSION" ]; then
  OS_VERSION=$OSD_VERSION
fi
if [ -z "$OS_PLUGIN" ] && [ "$1" == "staging" ]; then
  OS_PLUGIN="$OS_VERSION-*"
fi


if [[ ! "$OS_PLUGIN" =~ ^https?:.*$ ]]; then
  if [[ "$OS_PLUGIN" =~ .*SNAPSHOT.* ]]; then
    OS_PLUGIN=$(ci/artifact_uri.sh eliatra-suite-snapshot eliatra-suite-opensearch-plugin $OS_PLUGIN .zip sgadmin-standalone.zip)
    echo "Found: $OS_PLUGIN"
  else
    OS_PLUGIN=$(ci/artifact_uri.sh eliatra-suite eliatra-suite-opensearch-plugin $OS_PLUGIN .zip sgadmin-standalone.zip)
    echo "Found: $OS_PLUGIN"
  fi
fi  


echo "OS_PLUGIN=$OS_PLUGIN" >> build.env
echo "OS_VERSION=$OS_VERSION" >>build.env
echo "OSD_PLUGIN=$OSD_PLUGIN" >>build.env
echo "OSD_VERSION=$OSD_VERSION" >>build.env
echo "IT_BRANCH=$IT_BRANCH" >>build.env

echo "============ build.env ============"
cat build.env
echo "==================================="
