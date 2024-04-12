#!/usr/bin/env node

const updateUtils = require('./updatesUtil');

async function main() {
  // Allow this to work without server certificate
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const token = process.env.SAS_VIYA_CLI_AUTH_TOKEN;
  if (!token) {
    throw new Error('SAS_VIYA_CLI_AUTH_TOKEN is not set');
  }

  const hostUrl = process.env.SAS_SERVICES_ENDPOINT;
  if (!hostUrl) {
    throw new Error('SAS_SERVICES_ENDPOINT is not set');
  }

  const reportUid = process.env.REPORT_UID;
  if (!reportUid) {
    throw new Error('REPORT_UID is not set');
  }
  const reportUri = `/reports/reports/${reportUid}`;

  // Check to see if the SAS Viya deployment is available.
  // If it is not then just exit (exit code 0) as there is no
  // report package update available.
  const viyaAvailable = await updateUtils.isViyaAvailable(hostUrl, token);
  if (!viyaAvailable) {
    console.log(`${hostUrl} is unreachable. No package update needed.`);
    return;
  }

  // Get the timestamp for the curernt report package, which is
  // the time when that package was generated.
  const packageGeneratedTime = updateUtils.getReportPackageGenerated(reportUid);
  console.log(`Package generated: ${packageGeneratedTime}`);

  // Get the lastModified timestamp for the report.
  const reportLastModifiedTime = await updateUtils.getReportLastModified(
    hostUrl,
    reportUri,
    token
  );
  console.log(`Report modified: ${reportLastModifiedTime}`);

  const pacakgeDate = new Date(packageGeneratedTime);
  const reportDate = new Date(reportLastModifiedTime);

  // If the report has been updated since the last package generation, then we need to updated.
  // Return early (exit code 1)
  if (reportDate > pacakgeDate) {
    console.log('Package update needed');
    process.exitCode = 2;
    return;
  }

  // Get all of the table resource uris for tables that this report uses.
  const tableUris = await updateUtils.getTableDependencies(
    hostUrl,
    `/reports/reports/${reportUid}`,
    token
  );

  // Get all of the lastModified times associated with each table
  const tableLastModifiedTimes = await updateUtils.getTableLastModified(
    hostUrl,
    tableUris,
    token
  );

  if (tableUris.length !== tableLastModifiedTimes.length) {
    throw new Error(
      `Error getting table lastModified times.\nTable uri: ${tableUris}\nTable lastModified: ${tableLastModifiedTimes}`
    );
  }

  // If a table has been updated since the last package generation, then we need to updated.
  // Return early (exit code 1)
  for (let i = 0; i < tableLastModifiedTimes.length; i++) {
    const tableName = tableUris[i].split('/').at(-1);
    const tableDate = new Date(tableLastModifiedTimes[i]);
    console.log(`Table "${tableName}" modified: ${tableLastModifiedTimes[i]}`);
    if (tableDate > pacakgeDate) {
      console.log('Package update needed');
      process.exitCode = 2;
      return;
    }
  }

  console.log('No package update needed');
}

main();
