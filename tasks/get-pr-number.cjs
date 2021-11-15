/* eslint-disable import/no-unresolved */
const unzipper = require('unzipper');
const request = require('request');

module.exports = async ({github, context}) => {
  const artifacts = github.rest.actions.listWorkflowRunArtifacts({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: github.event.workflow_run.id
  });

  console.log('artifacts', artifacts); /* eslint-disable-line no-console */

  const artifact = artifacts.data.artifacts.filter(
    artifact => artifact.name === 'pr'
  )[0];

  if (!artifact) {
    throw new Error('No pr artifact found');
  }

  const directory = await unzipper.Open.url(
    request,
    artifact['archive_download_url']
  );
  const file = directory.files.find(d => d.path === 'number');
  const content = await file.buffer();
  const number = parseInt(content.toString(), 10);

  console.log('pr number', number); /* eslint-disable-line no-console */
};
