#!/bin/bash
cd "$(dirname "$0")"
echo $(pwd)

# Get the name of the SAS Viya CLI tarball, which should exist in this directory.
# If more than one exists then this just gets the first listed.
NAME=$(ls | grep -o 'sas-viya-cli\S*\.tgz')

# Make sure a cli file exists before continuing
if [[ -z "${NAME}" ]]; then
  >&2 echo "ERROR: The SAS Viya CLI package file can not be found. Download the Linux CLI package from https://support.sas.com/downloads/package.htm?pid=2512"
  exit 1
fi

echo Building the SAS Viya CLI container using ${NAME}
docker build --build-arg CLI_TAR_FILE=${NAME} -t sas-viya-cli .