#!/bin/bash
function version {
  echo "$@" | awk -F. '{ printf("%d%03d%03d%03d\n", $1,$2,$3,$4); }';
}

GIT_VERSION=$(git --version)
# get currente version of git
GIT_VERSION=($(echo $GIT_VERSION))
GIT_VERSION=${GIT_VERSION[@]:(-1)}

# now let's check if we need to upgrade
if [ $(version $GIT_VERSION) -ge $(version "2.13.0") ]
then
  echo "============================================================================================================="
  echo "  Git version is up to date!!!!"
  echo ""
  echo "  Let's intall all dependencies"
  echo "============================================================================================================="
else
  echo "============================================================================================================="
  echo "  Git version need to be upgraded"
  echo ""
  echo "  To do this you need to upgrade version of yours Debian from 8 to 9 or greater!!!!"
  echo "============================================================================================================="
  echo "  Steps to upgrade from Derbian 8 to 9:"
  echo "    apt-get update"
  echo "    apt-get upgrade"
  echo "    apt-get dist-upgrade"
  echo "-------------------------------------------------------------------------------------------------------------"
  echo "    change content of file /etc/apt/sources.list to:"
  echo "      deb http://httpredir.debian.org/debian stretch main contrib non-free"
  echo "      deb http://httpredir.debian.org/debian stretch-updates main contrib non-free"
  echo "      deb http://security.debian.org stretch/updates main contrib non-free"
  echo "-------------------------------------------------------------------------------------------------------------"
  echo "    Run again the commands: "
  echo "      apt-get update"
  echo "      apt-get upgrade"
  echo "      apt-get dist-upgrade"
  echo "-------------------------------------------------------------------------------------------------------------"
  echo "    Run git --version to check the new version"
  echo "-------------------------------------------------------------------------------------------------------------"
  echo "  More info see: https://phoenixnap.com/kb/how-to-upgrade-debian-8-jessie-to-debian-9-stretch"
  echo "============================================================================================================="
  exit 1
fi
