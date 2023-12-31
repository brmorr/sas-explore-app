const fs = require('fs');
const path = require('path');

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
  const viyaAvailable = await isViyaAvailable(hostUrl, token);
  if (!viyaAvailable) {
    console.log(`${hostUrl} is unreachable. No package update needed.`);
    return;
  }

  // Get the timestamp for the curernt report package, which is
  // the time when that package was generated.
  const packageGeneratedTime = getReportPackageGenerated(reportUid);
  console.log(`Package generated: ${packageGeneratedTime}`);

  // Get the lastModified timestamp for the report.
  const reportLastModifiedTime = await getReportLastModified(
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
  const tableUris = await getTableDependencies(
    hostUrl,
    `/reports/reports/${reportUid}`,
    token
  );

  // Get all of the lastModified times associated with each table
  const tableLastModifiedTimes = await getTableLastModified(
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

async function isViyaAvailable(hostUrl, token) {
  try {
    const resp = await fetch(hostUrl, {
      method: 'HEAD',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resp.ok) {
      // Non 2xx response code.... consider the server not available.
      console.log(`HEAD call to ${hostUrl} failed with status ${resp.status}`);
      return false;
    }

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function getReportPackageGenerated(reportUid) {
  const projectRootPath = path.join(__dirname, '..', '..');
  const packageMetadataFile = path.join(
    projectRootPath,
    'public',
    'reportPackages',
    reportUid,
    'reportPackage.xml'
  );
  const packageMetadata = fs.readFileSync(packageMetadataFile).toString();
  const match = packageMetadata.match(
    /<generatedTimeStamp>(.*)<\/generatedTimeStamp>/
  );
  if (!match || match.length !== 2) {
    throw new Error(
      `Error: Problem getting generatedTimeStamp from ${packageMetadataFile}`
    );
  }

  return match[1];
}

async function getReportLastModified(hostUrl, reportUri, token) {
  const resp = await fetch(`${hostUrl}${reportUri}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resp.ok) {
    const err = new Error(`HTTP status code: ${resp.status}`);
    err.response = resp;
    throw err;
  }

  const reportInfo = await resp.json();
  return reportInfo.modifiedTimeStamp;
}

async function getTableLastModified(hostUrl, tableUris, token) {
  const lastModified = [];
  for (const uri of tableUris) {
    const resp = await fetch(`${hostUrl}${uri}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.sas.data.table+json',
        'Accept-Language': 'en-US',
      },
    });

    if (!resp.ok) {
      const err = new Error(`HTTP status code: ${resp.status}`);
      err.response = resp;
      throw err;
    }

    const tableInfo = await resp.json();

    // If the table is loaded into CAS (attributes.state === "loaded") then use the modifiedTimeStamp property.
    // If the table is not loaded, use attributes.sourceTableLastModified
    const tableModified =
      tableInfo.attributes?.state === 'loaded'
        ? tableInfo.modifiedTimeStamp
        : tableInfo.attributes?.sourceTableLastModified;

    lastModified.push(tableModified);
  }

  return lastModified;
}

async function getTableDependencies(hostUrl, reportUri, token) {
  const resp = await fetch(
    `${hostUrl}/relationships/relationships/?limit=100&filter=eq(resourceUri,"${reportUri}")`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const reportRelationships = await resp.json();
  const relatedResources = reportRelationships.items.map(
    (value) => value.relatedResourceUri
  );
  const relatedTables = relatedResources.filter((value) =>
    value.startsWith('/dataTables/')
  );

  return relatedTables;
}

main();
