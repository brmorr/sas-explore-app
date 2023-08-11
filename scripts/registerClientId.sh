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

AUTH_URL="${SAS_SERVICES_ENDPOINT}/SASLogon/oauth/authorize?client_id=sas.cli&response_type=code"
echo "Open the following link in a web browser and sign in to obtain an authorization code:"
echo "${AUTH_URL}"
echo

read -p "Code: " AUTH_CODE


# Get token for SAS_VIYA_ADMIN_ID user
ADMIN_TOKEN_RESP=$(curl -s -k ${SAS_SERVICES_ENDPOINT}/SASLogon/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "sas.cli:" \
  -d "grant_type=authorization_code&code=$AUTH_CODE")

# Parse token (or error) from the response
ADMIN_TOKEN=$(get_str_prop "${ADMIN_TOKEN_RESP}" "access_token")
ERROR=$(get_str_prop "${ADMIN_TOKEN_RESP}" "error")

# Exit on error or missing token
if [ ! -z "${ERROR}" ] || [ -z "${ADMIN_TOKEN}" ]; then
  >&2 echo "Login Error"
  >&2 echo "$ADMIN_TOKEN_RESP"
  exit 1
fi

read -p  "Enter Client ID: " SAS_VIYA_CLI_CLIENT_ID

read -p "Enter Client Secret [default]: " SAS_VIYA_CLI_CLIENT_SECRET
SAS_VIYA_CLI_CLIENT_SECRET=${SAS_VIYA_CLI_CLIENT_SECRET:-$(openssl rand -hex 20)}

read -p  "Enter token expiration days [30]: " SAS_VIYA_AUTH_EXPIRE
SAS_VIYA_AUTH_EXPIRE=${SAS_VIYA_AUTH_EXPIRE:-30}
# default token expiration is 30 days
SAS_VIYA_AUTH_EXPIRE=$(($SAS_VIYA_AUTH_EXPIRE * 86400))

CREATE_CLIENT_RESP=$(curl -s -k -X POST ${SAS_SERVICES_ENDPOINT}/SASLogon/oauth/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{ "client_id": "'${SAS_VIYA_CLI_CLIENT_ID}'",
        "client_secret": "'${SAS_VIYA_CLI_CLIENT_SECRET}'",
        "scope": ["openid"],
        "authorities": ["uaa.none"],
        "access_token_validity": '${SAS_VIYA_AUTH_EXPIRE}',
        "authorized_grant_types": ["password", "authorization_code"],
        "redirect_uri": "urn:ietf:wg:oauth:2.0:oob" }')

CLIENT_ID_RESP=$(get_str_prop "${CREATE_CLIENT_RESP}" "client_id")
if [ "${CLIENT_ID_RESP}" != "${SAS_VIYA_CLI_CLIENT_ID}" ]; then
  >&2 echo "Error registering client id $SAS_VIYA_CLI_CLIENT_ID"
  >&2 echo "$CREATE_CLIENT_RESP"
  exit 1
fi 


echo
echo "SUCCESS! Client ID registered."
echo
echo "SAS_VIYA_CLI_CLIENT_ID=${SAS_VIYA_CLI_CLIENT_ID}"
echo
echo "SAS_VIYA_CLI_CLIENT_SECRET=${SAS_VIYA_CLI_CLIENT_SECRET}"
echo
# echo "SAS_VIYA_AUTH_EXPIRE=${SAS_VIYA_AUTH_EXPIRE}"
# echo