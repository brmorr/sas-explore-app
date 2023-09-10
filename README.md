# SAS Explore App

SAS Explore App is a web application built to demonstrate the end-to-end workflow of delivering SAS Visual Analytics insights to the web through a custom web application. This is the companion repository for the SAS Explore 2023 breakout session `Unlocking Actionable Intelligence at Scale: Streamlining Delivery of SAS® Visual Analytics Insights`.

## Getting Started

### Install the project
```bash
git clone git@github.com:brmorr/sas-explore-app.git
cd sas-explore-app
npm install
```

### Build and run
```bash
npm start
```
## Building a SAS Viya CLI container
The SAS Viya CLI is used by the Github Action CI/CD workflow to automatically update our report package. In order to use the CLI in that environment, you need to build it into a docker container.

### Download the CLI (Linux version)
The SAS Viya CLI can be downloaded from [support.sas.com](https://support.sas.com/downloads/package.htm?pid=2512). Note that you need a SAS profile account in order to access the CLI download. The container uses Linux base image, so make sure that you download the Linux version of the CLI.

### Build the docker container
1. Move the CLI zip package into the `sas-viya-cli-container` folder inside this project.
2. Build the container

This step builds a Docker container named `sas-viya-cli` which has the CLI installed, accessible with the `sas-viya` command.

```bash
# From project root
npm run build-cli-container
```

### Test the containerized SAS Viya CLI
#### Start the Container
```bash
# Start the container
npm run viya-cli

# Show CLI help
> sas-viya -h

# Login (follow prompts)
> sas-viya -k auth loginCode

# Exit the container
> exit
```

## Publish `sas-auth-container` image to docker registry
In order to use the container from a Github Actions workflow it must first be published to a registry. If you are using Github's Action runners then using a public registry like Docker Hub is required.

```bash
# Tag the image to reflect org/name of published image.
# Publish to docker hub under your personal repository
docker tag sas-viya-cli:latest ${USERNAME}/sas-viya-cli:latest
docker push ${USERNAME}/sas-viya-cli:latest
```

## Generate an authentication token
The SAS Viya CLI needs to authenticate to SAS Viya in order to function.  When using the CLI interactively you can login with credentials or an auth code, but in CI it needs to use an auth token that you will store as a Github Secret. This is achieved by creating a new oAuth client scoped specifically for this task, and then generating an authentication token for that client.

### Register a new oAuth client
```bash
npm run register-client-id
```
The `register-client-id` script will prompt you to login to SAS Viya and then ask for the desired client id, client secret, and token expiration.

On success it will print out the new environment variables needed for the next step. Copy those values into your `.env` file.

### Generate an authentication token
```bash
npm run generate-client-token
```
The `generate-client-token` script will prompt you to login to SAS Viya and then ask for the client id and client secret. If those values are defined in your `.env` file then you will not be prompted.

On success it will print the name and value for the authentication token environment variable. Copy this to your `.env` file.

## Add Actions secrets/variables
The following secrets and variables are used by this project's Github Actions workflows.

### Secrets
#### PAT
A GitHub personal access token.  This is used to automatically merge report package updates into the repository.
#### SAS_VIYA_CLI_AUTH_TOKEN
The generatd client authentication token from [this step](#generate-an-authentication-token-1), used to authenticate the SAS Viya CLI from the Github Actions workflow.
### Variables
#### CLI_CONTAINER_NAME
The name of the CLI container that was published in [this step](#publish-sas-auth-container-image-to-docker-registry).
#### REPORT_UID
The UID of the SAS Visual Analytics report that is being used to generate an update report package.
#### SAS_SERVICES_ENDPOINT
The URL of the SAS Viya deployment

## Environment Variables
The projects scripts each utilize various environment variables to pass necessary settings.  The following variables should be set in a `.env` file, which will then be used when executing the scripts.

### `.env`
``` bash
# The SAS Viya URL (no trailing /)
SAS_SERVICES_ENDPOINT=
# The oAuth client created to run the CLI from Github
SAS_VIYA_CLI_CLIENT_ID=
# The secret associated with the oAuth client
SAS_VIYA_CLI_CLIENT_SECRET=
# The authentication token for the oAuth client
SAS_VIYA_CLI_AUTH_TOKEN=
```

## References
- SAS Viya Documentation
  - [SAS Viya CLI](https://documentation.sas.com/doc/en/sasadmincdc/v_043/calcli/titlepage.htm)
  - [Obtain an Access Token Using an Authorization Code](https://documentation.sas.com/doc/en/sasadmincdc/v_043/calauthmdl/n1iyx40th7exrqn1ej8t12gfhm88.htm#p0c3t34ecqoe1vn1c4tw0x3wnkcs)
  - [Register an OAuth Client ID](https://documentation.sas.com/doc/en/sasadmincdc/v_043/calauthmdl/n1iyx40th7exrqn1ej8t12gfhm88.htm#n0ce1kz53qzmukn165fzrqdsws3e)
- SAS Viya REST APIs
  - [SAS Logon](https://developer.sas.com/apis/rest/CoreServices/#sas-logon)
  - [Reports](https://developer.sas.com/apis/rest/Visualization/#reports)
  - [Relationships](https://developer.sas.com/apis/rest/CoreServices/#relationships)
  - [Data Tables](https://developer.sas.com/apis/rest/DataManagement/#data-tables)
- [Building a SAS Viya CLI docker container](https://communities.sas.com/t5/SAS-Communities-Library/SAS-administration-command-line-interface-in-a-container-Part-1/ta-p/671505)
- [Microsoft Azure Static Web App Quickstart](https://learn.microsoft.com/en-us/azure/static-web-apps/getting-started?tabs=react)

