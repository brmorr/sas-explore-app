const fs = require('fs');
const path = require('path');



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

module.exports = {
  getTableDependencies,
  getTableLastModified,
  getReportLastModified,
  getReportPackageGenerated,
  isViyaAvailable
}
