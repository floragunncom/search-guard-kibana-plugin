#!/bin/bash
 
#in BUILD_VERSION 1.0.0-es-7.17.6 or 

#in IT_BRANCH 8.3.x

set -ex
 
MVN_DEPLOY_OPTS=""

#echo -e "\e[0Ksection_start:`date +%s`:deploy\r\e[0KDeploying build"
mvn --batch-mode -s settings.xml -Drevision="$BUILD_VERSION" $MVN_DEPLOY_OPTS clean install | tee install.out
#echo -e "\e[0Ksection_end:`date +%s`:deploy\r\e[0K"

if [ -z "$IT_BRANCH" ]; then
  if [ "$CI_COMMIT_REF_NAME" != "master" ] && [ -n $(git ls-remote --heads https://gitlab-ci-token:${CI_JOB_TOKEN}@git.floragunn.com/private/sgi8.git $CI_COMMIT_REF_NAME) ]; then
    IT_BRANCH="$CI_COMMIT_REF_NAME"
  else
    MAJOR=$(echo $SF_VERSION | cut -d. -f1-2)
    IT_BRANCH="$MAJOR.x"
  fi
fi

if [ ! -z "$SG_ES_PLUGIN" ]; then
  # $SG_ES_PLUGIN not empty
  if [[ ! "$SG_ES_PLUGIN" =~ ^https?:.*$ ]]; then
    if [[ "$SG_ES_PLUGIN" =~ .*SNAPSHOT.* ]]; then
      SG_ES_PLUGIN=$(ci/artifact_uri.sh $SG_SB_PLUGIN_SNAPSHOT_REPO $SG_SB_PLUGIN_NAME $SG_ES_PLUGIN .zip sgadmin-standalone.zip)
    else
      SG_ES_PLUGIN=$(ci/artifact_uri.sh $SG_SB_PLUGIN_RELEASE_REPO $SG_SB_PLUGIN_NAME ${SG_ES_PLUGIN}-es-${SF_VERSION} .zip sgadmin-standalone.zip)
    fi
  fi	
else
    #$SG_ES_PLUGIN empty -> auto
    #if [[ $CI_COMMIT_TAG =~ ^sg-flx-([a-z0-9\.\-]+)-(es)-([0-9\.]+)$ ]]; then
    #  #1.0.0-beta-4-es-8.2.3
    #  SG_ES_PLUGIN=$(ci/artifact_uri.sh $SG_SB_PLUGIN_RELEASE_REPO $SG_SB_PLUGIN_NAME $SG_ES_PLUGIN .zip sgadmin-standalone.zip)
    #else
    #  SG_ES_PLUGIN=$(ci/artifact_uri.sh $SG_SB_PLUGIN_RELEASE_REPO $SG_SB_PLUGIN_NAME $SG_ES_PLUGIN .zip sgadmin-standalone.zip)
    #fi
    :

fi


echo "SG_ES_PLUGIN=$SG_ES_PLUGIN" >> build.env
echo "IT_BRANCH=$IT_BRANCH" >>build.env

echo "============ build.env ============"
cat build.env
echo "==================================="
