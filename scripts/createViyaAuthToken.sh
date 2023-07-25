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
  >&2 echo "ERROR: SAS_SERVICES_ENDPOINT is not set"
  exit 1
elif [[ -z "${SAS_VIYA_ADMIN_ID}" ]]; then
  >&2 echo "ERROR: SAS_VIYA_ADMIN_ID is not set"
  exit 1
elif [[ -z "${SAS_VIYA_ADMIN_PWD}" ]]; then
  >&2 echo "ERROR: SAS_VIYA_ADMIN_PWD is not set"
  exit 1
elif [[ -z "${SAS_VIYA_CLI_CLIENT_ID}" ]]; then
  >&2 echo "ERROR: SAS_VIYA_CLI_CLIENT_ID is not set"
  exit 1
fi

if [[ -z "${SAS_VIYA_AUTH_EXPIRE}" ]]; then
  # default token expiration is 30 days
  SAS_VIYA_AUTH_EXPIRE=2592000
fi

# Get token for SAS_VIYA_ADMIN_ID user
ADMIN_TOKEN_RESP=$(curl -s ${SAS_SERVICES_ENDPOINT}/SASLogon/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "sas.cli:" \
  -d "grant_type=password&username=${SAS_VIYA_ADMIN_ID}&password=${SAS_VIYA_ADMIN_PWD}")

# echo "body is ${TOKEN_RESP}"

# ADMIN_TOKEN=$(echo ${TOKEN_RESP} | grep -o '"access_token": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
ADMIN_TOKEN=$(get_str_prop "${ADMIN_TOKEN_RESP}" "access_token")

# Determine whether or not the client id already exists
CLIENT_ID_RESP=$(curl -s -k -X GET ${SAS_SERVICES_ENDPOINT}/SASLogon/oauth/clients/${SAS_VIYA_CLI_CLIENT_ID} \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

CLIENT_ID=$(get_str_prop "${CLIENT_ID_RESP}" "client_id")

if [[ "${SAS_VIYA_CLI_CLIENT_ID}" = "${CLIENT_ID}" ]]; then
  echo "Using existing client id ${SAS_VIYA_CLI_CLIENT_ID}..."
  TOKEN_VALIDITY=$(get_num_prop "${CLIENT_ID_RESP}" "access_token_validity")
  echo "${CLIENT_ID} token expiration: ${TOKEN_VALIDITY}"

  if [[ -z "${SAS_VIYA_CLI_CLIENT_SECRET}" ]]; then
    >&2 echo "ERROR: SAS_VIYA_CLI_CLIENT_SECRET is not set"
    exit 1
  fi
else
  echo "Creating Client ID ${SAS_VIYA_CLI_CLIENT_ID}..."

  if [[ -z "${SAS_VIYA_CLI_CLIENT_SECRET}" ]]; then
    # Create a random client secret if one is not passed as an env variable
    SAS_VIYA_CLI_CLIENT_SECRET=$(openssl rand -base64 30)
    echo "Generating new client secret..."
  else
    echo "Using existing client secret..."
  fi

  CREATE_CLIENT_RESP=$(curl -s -k -X POST ${SAS_SERVICES_ENDPOINT}/SASLogon/oauth/clients \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -d '{ "client_id": "'${SAS_VIYA_CLI_CLIENT_ID}'",
          "client_secret": "'${SAS_VIYA_CLI_CLIENT_SECRET}'",
          "scope": ["openid"],
          "authorities": ["uaa.none"],
          "access_token_validity": '${SAS_VIYA_AUTH_EXPIRE}',
          "authorized_grant_types": ["password"] }')

  echo "${CREATE_CLIENT_RESP}"
  echo
  echo "Client ID ${SAS_VIYA_CLI_CLIENT_ID} created"
fi

AUTH_TOKEN_RESP=$(curl -s -k ${SAS_SERVICES_ENDPOINT}/SASLogon/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "${SAS_VIYA_CLI_CLIENT_ID}:${SAS_VIYA_CLI_CLIENT_SECRET}" \
  -d "grant_type=password&username=${SAS_VIYA_ADMIN_ID}&password=${SAS_VIYA_ADMIN_PWD}")

AUTH_TOKEN=$(get_str_prop "${AUTH_TOKEN_RESP}" "access_token")

echo
echo "SUCCESS! Auth token generated."
echo
echo "SAS_VIYA_CLI_CLIENT_ID=${SAS_VIYA_CLI_CLIENT_ID}"
echo
echo "SAS_VIYA_CLI_CLIENT_SECRET=${SAS_VIYA_CLI_CLIENT_SECRET}"
echo
echo "SAS_VIYA_CLI_AUTH_TOKEN=${AUTH_TOKEN}"
echo
