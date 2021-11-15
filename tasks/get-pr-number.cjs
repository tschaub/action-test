/* eslint-disable import/no-unresolved */
const unzipper = require('unzipper');

module.exports = async ({github, context}) => {
  const artifacts = await github.rest.actions.listWorkflowRunArtifacts({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: github.event.workflow_run.id
  });

  const artifact = artifacts.data.artifacts.filter(
    artifact => artifact.name === 'pr'
  )[0];

  if (!artifact) {
    throw new Error('No pr artifact found');
  }

  const download = await github.rest.actions.downloadArtifact({
    owner: context.repo.owner,
    repo: context.repo.repo,
    artifact_id: artifact.id,
    archive_format: 'zip'
  });

  const directory = await unzipper.Open.buffer(Buffer.from(download.data));
  const file = directory.files.find(d => d.path === 'number');
  const content = await file.buffer();
  const number = parseInt(content.toString(), 10);
  const issueNumber = 1;

  const start = ':package:';
  const author = 'github-actions[bot]';

  const comments = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber
  });

  const commentExists = comments.data.some(
    comment => comment.user.login === author && comment.body.startsWith(start)
  );

  if (!commentExists) {
    const body = [
      `${start} Preview the [examples](https://example.com/${number}/examples/) and`,
      `[docs](https://example.com/${number}/apidoc/) from this branch`,
      `here: https://example.com/${number}.`
    ].join(' ');

    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNumber,
      body: body
    });
  }
};
