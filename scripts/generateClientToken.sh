#!/bin/bash

# Parses the JSON response ($1) returning the value of the string property with name $2
get_str_prop () {
  echo $(echo $1 | grep -o '"'$2'": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
}

# Parses the JSON response ($1) returning the value of the numeric property with name $2
get_num_prop () {
  echo $(echo $1 | grep -o '"'$2'": *\d*' | grep -o '\d*$' | tr -d '"')
}

if [[ -z "${SAS_SERVICES_ENDPOINT}" ]]; then
  read -p "Enter SAS Viya URL: " SAS_SERVICES_ENDPOINT
fi


if [[ -z "${SAS_SERVICES_ENDPOINT}" ]]; then
  >&2 echo "ERROR: SAS_SERVICES_ENDPOINT is not set"
  exit 1
else
  echo "SAS Viya URL: $SAS_SERVICES_ENDPOINT"
fi

if [[ -z "${SAS_VIYA_CLI_CLIENT_ID}" ]]; then
  read -p  "Enter Client ID: " SAS_VIYA_CLI_CLIENT_ID
fi

if [[ -z "${SAS_VIYA_CLI_CLIENT_SECRET}" ]]; then
  read -p  "Enter Client Secret: " SAS_VIYA_CLI_CLIENT_SECRET
fi

# This script uses the authorization code flow in order to obtain an access token.
# This method is documented at 
# https://documentation.sas.com/doc/en/sasadmincdc/v_043/calauthmdl/n1iyx40th7exrqn1ej8t12gfhm88.htm#p0c3t34ecqoe1vn1c4tw0x3wnkcs

# Prompt user to login and get authorization code
AUTH_URL="${SAS_SERVICES_ENDPOINT}/SASLogon/oauth/authorize?client_id=${SAS_VIYA_CLI_CLIENT_ID}&response_type=code"
echo "Open the following link in a web browser and sign in to obtain an authorization code:"
echo "${AUTH_URL}"
echo

read -p "Code: " AUTH_CODE


echo
echo "Generating auth token for ${SAS_VIYA_CLI_CLIENT_ID}:${SAS_VIYA_CLI_CLIENT_SECRET}"
echo

# Obtain the Client ID access token
AUTH_TOKEN_RESP=$(curl -s -k ${SAS_SERVICES_ENDPOINT}/SASLogon/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "${SAS_VIYA_CLI_CLIENT_ID}:${SAS_VIYA_CLI_CLIENT_SECRET}" \
  -d "grant_type=authorization_code&code=${AUTH_CODE}")

AUTH_TOKEN=$(get_str_prop "${AUTH_TOKEN_RESP}" "access_token")
ERROR=$(get_str_prop "${AUTH_TOKEN_RESP}" "error")
if [ ! -z "${ERROR}" ]; then
  >&2 echo "Error generating auth token for $SAS_VIYA_CLI_CLIENT_ID"
  >&2 echo "$AUTH_TOKEN_RESP"
  exit 1
fi

echo
echo "SUCCESS! Auth token generated."
echo
echo "SAS_VIYA_CLI_AUTH_TOKEN=${AUTH_TOKEN}"
echo
