#!/usr/bin/env node

const updateUtils = require('./updatesUtil');

async function main() {
  const reportUid = process.env.REPORT_UID;
  if (!reportUid) {
    throw new Error('REPORT_UID is not set');
  }
  const packageGeneratedTime = updateUtils.getReportPackageGenerated(reportUid);
  console.log(packageGeneratedTime || '');
}

main();
