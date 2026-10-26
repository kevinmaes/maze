import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { URLSearchParams } from 'node:url';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { updateRelease } from './release.mjs';

// Git and Changesets subprocesses need headroom on busy hosts.
vi.setConfig({ testTimeout: 15_000 });

let directory;
let work;
let remote;
let git;
let server;
let api;
let events;
let pullRequest;
let closedPulls;
let releaseShas;
let canCreatePulls;
let nextPull;
const repository = 'owner/maze';
const branch = 'changeset-release/dev';
const ref = `refs/heads/${branch}`;
const temporary = 'changeset-release/tmp-test';
const isTemporary = (name) => /^changeset-release\/tmp-[\w-]+$/.test(name);

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'maze-release-test-'));
  work = join(directory, 'work');
  remote = join(directory, 'remote.git');
  mkdirSync(work);
  const run = (cwd, args, options = {}) =>
    execFileSync('git', ['-c', 'commit.gpgsign=false', ...args], {
      cwd,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'Fixture',
        GIT_AUTHOR_EMAIL: 'fixture@example.com',
        GIT_COMMITTER_NAME: 'Fixture',
        GIT_COMMITTER_EMAIL: 'fixture@example.com',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options,
    });
  git = (...args) => run(work, args);
  server = (args, options) => run(remote, args, options);
  git('init', '-b', 'dev');
  git('init', '--bare', remote);
  git('remote', 'add', 'origin', remote);
  commitDev({
    'package.json': '{"name":"maze","version":"1.0.0"}\n',
    '.changeset/pending.md': 'pending release\n',
    'app.txt': 'initial\n',
  });
  events = [];
  pullRequest = null;
  closedPulls = [];
  releaseShas = [];
  canCreatePulls = true;
  nextPull = 1624;

  // The fake API writes real Git objects, rejects stale expected heads and
  // only lets changeset-release/* refs change. Like GitHub, it closes the open
  // release PR whenever its head is moved onto dev. No GitHub branches change.
  const setRef = (name, sha, old) => {
    server(['update-ref', `refs/heads/${name}`, sha, old]);
    if (name !== branch) return;
    releaseShas.push(sha);
    if (pullRequest && sha === revParse('refs/heads/dev')) {
      closedPulls.push(pullRequest.number);
      pullRequest = null;
    }
  };
  api = (method, endpoint, body) => {
    events.push({ method, endpoint, body });
    if (endpoint.includes('/git/ref')) {
      expect(endpoint).not.toMatch(/heads\/(main|dev)$/);
    }
    const head = (name) =>
      server(['for-each-ref', '--format=%(objectname)', `refs/heads/${name}`])
        .toString()
        .trim();
    const target = endpoint.split('/git/refs/heads/')[1];
    if (endpoint.endsWith(`/git/matching-refs/heads/${branch}`)) {
      const sha = head(branch);
      return sha ? [{ ref, object: { sha } }] : [];
    }
    if (method === 'POST' && endpoint.endsWith('/git/refs')) {
      expect(body.ref).toMatch(/^refs\/heads\/changeset-release\//);
      setRef(body.ref.replace('refs/heads/', ''), body.sha, '0'.repeat(40));
      return { object: { sha: body.sha } };
    }
    if (method === 'PATCH' && target) {
      expect(target).toBe(branch);
      expect(body.force).toBe(true);
      setRef(target, body.sha, head(target));
      return { object: { sha: body.sha } };
    }
    if (method === 'DELETE' && target) {
      expect(isTemporary(target)).toBe(true);
      server(['update-ref', '-d', `refs/heads/${target}`, head(target)]);
      return null;
    }
    if (endpoint === 'graphql') {
      const input = body.variables.input;
      expect(input.branch.repositoryNameWithOwner).toBe(repository);
      const name = input.branch.branchName;
      expect(isTemporary(name)).toBe(true);
      if (head(name) !== input.expectedHeadOid) throw new Error('Stale head');
      const index = join(directory, 'api-index');
      const options = {
        env: { ...process.env, GIT_INDEX_FILE: index, GIT_WORK_TREE: work },
      };
      server(['read-tree', head(name)], options);
      for (const { path } of input.fileChanges.deletions) {
        server(['update-index', '--force-remove', path], options);
      }
      for (const { path, contents } of input.fileChanges.additions) {
        const blob = server(['hash-object', '-w', '--stdin'], {
          input: Buffer.from(contents, 'base64'),
        })
          .toString()
          .trim();
        server(
          ['update-index', '--add', '--cacheinfo', '100644', blob, path],
          options
        );
      }
      const tree = server(['write-tree'], options).toString().trim();
      rmSync(index);
      const oid = server(['commit-tree', tree, '-p', head(name)], {
        input: input.message.headline,
      })
        .toString()
        .trim();
      setRef(name, oid, head(name));
      return {
        data: {
          createCommitOnBranch: {
            commit: { oid, signature: { isValid: true } },
          },
        },
      };
    }
    if (method === 'GET' && endpoint.includes('/pulls?')) {
      const params = new URLSearchParams(endpoint.split('?')[1]);
      expect(params.get('base')).toBe('dev');
      expect(params.get('head')).toBe(`owner:${branch}`);
      return pullRequest ? [pullRequest] : [];
    }
    if (
      method === 'PATCH' &&
      endpoint.endsWith(`/pulls/${pullRequest?.number}`)
    ) {
      expect(body.title).toBe('Version Packages');
      return pullRequest;
    }
    if (method === 'POST' && endpoint.endsWith('/pulls')) {
      if (!canCreatePulls) {
        throw Object.assign(
          new Error(
            'GitHub Actions is not permitted to create or approve pull requests. (HTTP 403)'
          ),
          { status: 403 }
        );
      }
      expect(body).toMatchObject({
        head: branch,
        base: 'dev',
        title: 'Version Packages',
      });
      const number = nextPull++;
      pullRequest = { number, html_url: `https://example.com/pull/${number}` };
      return pullRequest;
    }
    throw new Error(`Unexpected API call: ${method} ${endpoint}`);
  };
});

afterEach(() => {
  vi.unstubAllEnvs();
  rmSync(directory, { recursive: true, force: true });
});

const revParse = (name) => server(['rev-parse', name]).toString().trim();
const releaseHead = () =>
  server(['for-each-ref', '--format=%(objectname)', ref]).toString().trim();
const temporaryRefs = () =>
  server([
    'for-each-ref',
    '--format=%(refname)',
    'refs/heads/changeset-release/',
  ])
    .toString()
    .split('\n')
    .filter((name) => name.includes('/tmp-'));
const refWrites = () =>
  events.filter(
    (event) => event.method !== 'GET' && event.endpoint.includes('/git/ref')
  );
const graphqlCalls = () =>
  events.filter((event) => event.endpoint === 'graphql');
const temporaryWrites = (source) => [
  {
    method: 'POST',
    endpoint: `repos/${repository}/git/refs`,
    body: { ref: `refs/heads/${temporary}`, sha: source },
  },
  {
    method: 'DELETE',
    endpoint: `repos/${repository}/git/refs/heads/${temporary}`,
    body: undefined,
  },
];

function writeFiles(files) {
  for (const [path, contents] of Object.entries(files)) {
    const target = join(work, path);
    if (contents === null) rmSync(target);
    else {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, contents);
    }
  }
}

function commitDev(files) {
  writeFiles(files);
  git('add', '--all');
  git('commit', '-m', 'Update dev');
  git('push', 'origin', 'dev');
  return git('rev-parse', 'HEAD').toString().trim();
}

function release(files = {}, options = { id: 'test' }) {
  const source = git('rev-parse', 'HEAD').toString().trim();
  writeFiles({
    'package.json': '{"name":"maze","version":"1.0.1"}\n',
    'CHANGELOG.md': '# 1.0.1\n\nRelease notes\n',
    '.changeset/pending.md': null,
    ...files,
  });
  git('add', '--all');
  const tree = git('write-tree').toString().trim();
  git('reset', '--hard', source);
  const url = updateRelease({ repository, source, tree, git, api, ...options });
  const head = revParse(ref);
  expect(revParse(`${head}^{tree}`)).toBe(tree);
  // The branch is always dev plus exactly one release commit, and never dev
  // itself, which would close the open release PR.
  expect(revParse(`${head}^`)).toBe(source);
  expect(releaseShas).not.toContain(source);
  expect(temporaryRefs()).toEqual([]);
  expect(revParse('refs/heads/dev')).toBe(source);
  return { source, tree, head, url };
}

test('creates a missing release branch at the version commit and opens a PR', () => {
  const binary = Buffer.from([0, 255, 128, 1]);
  const { source, head, url } = release({ 'generated.bin': binary });
  expect(url).toBe('https://example.com/pull/1624');
  expect(server(['show', `${head}:generated.bin`])).toEqual(binary);
  expect(server(['show', `${head}:CHANGELOG.md`]).toString()).toContain(
    '1.0.1'
  );
  expect(() =>
    server(['cat-file', '-e', `${head}:.changeset/pending.md`])
  ).toThrow();
  const [createTemporary, deleteTemporary] = temporaryWrites(source);
  expect(refWrites()).toEqual([
    createTemporary,
    {
      method: 'POST',
      endpoint: `repos/${repository}/git/refs`,
      body: { ref, sha: head },
    },
    deleteTemporary,
  ]);
  expect(releaseShas).toEqual([head]);
  expect(graphqlCalls()).toHaveLength(1);
  expect(graphqlCalls()[0].body.variables.input).toMatchObject({
    branch: { branchName: temporary },
    expectedHeadOid: source,
  });
  expect(events.at(-1)).toMatchObject({
    method: 'POST',
    endpoint: `repos/${repository}/pulls`,
  });
});

test('updates the open release PR without resetting its branch to dev', () => {
  const first = release();
  const source = commitDev({
    'app.txt': 'current dev\n',
    'binary.dat': Buffer.from([0, 1, 255]),
  });
  events.length = 0;
  releaseShas.length = 0;
  const { head, url } = release();
  expect(url).toBe(first.url);
  expect(pullRequest.number).toBe(1624);
  expect(closedPulls).toEqual([]);
  expect(
    server(['rev-list', '--count', `dev..${head}`])
      .toString()
      .trim()
  ).toBe('1');
  expect(server(['show', `${head}:app.txt`]).toString()).toBe('current dev\n');
  expect(server(['show', `${head}:binary.dat`])).toEqual(
    Buffer.from([0, 1, 255])
  );
  const [createTemporary, deleteTemporary] = temporaryWrites(source);
  expect(refWrites()).toEqual([
    createTemporary,
    {
      method: 'PATCH',
      endpoint: `repos/${repository}/git/refs/heads/${branch}`,
      body: { sha: head, force: true },
    },
    deleteTemporary,
  ]);
  expect(graphqlCalls()).toHaveLength(1);
  expect(events.some((event) => event.endpoint.endsWith('/pulls'))).toBe(false);
  expect(events.at(-1)).toMatchObject({
    method: 'PATCH',
    endpoint: `repos/${repository}/pulls/1624`,
  });
});

test('replaces an append-only history that conflicts with dev', () => {
  // Reproduce #1624: the branch tree matched dev through a sync commit, but
  // its history never included dev, so a changeset deleted on the branch and
  // modified on dev became a modify/delete conflict.
  const previous = release();
  commitDev({ '.changeset/pending.md': 'pending release, edited\n' });
  const sync = server(['commit-tree', 'dev^{tree}', '-p', previous.head], {
    input: 'Sync release branch with current dev',
  })
    .toString()
    .trim();
  const index = join(directory, 'stale-index');
  const options = {
    env: { ...process.env, GIT_INDEX_FILE: index, GIT_WORK_TREE: work },
  };
  server(['read-tree', sync], options);
  server(['update-index', '--force-remove', '.changeset/pending.md'], options);
  const staleTree = server(['write-tree'], options).toString().trim();
  const stale = server(['commit-tree', staleTree, '-p', sync], {
    input: 'Version Packages',
  })
    .toString()
    .trim();
  server(['update-ref', ref, stale]);
  expect(() => server(['merge-tree', '--write-tree', 'dev', ref])).toThrow();

  const { head } = release();
  server(['merge-tree', '--write-tree', 'dev', ref]);
  expect(
    server(['rev-list', '--count', `dev..${head}`])
      .toString()
      .trim()
  ).toBe('1');
  expect(pullRequest.number).toBe(1624);
});

test.each(['merge', 'squash'])(
  'opens a new PR from dev after a %s release',
  (mode) => {
    const previous = release();
    git('fetch', 'origin', branch);
    git('merge', mode === 'squash' ? '--squash' : '--no-edit', previous.head);
    if (mode === 'squash') git('commit', '-m', 'Version Packages (#1624)');
    commitDev({ '.changeset/pending.md': 'next release\n' });
    // Merging closes the PR and the repo auto-deletes its branch.
    pullRequest = null;
    server(['update-ref', '-d', ref]);
    events.length = 0;
    const { head, url } = release({
      'package.json': '{"name":"maze","version":"1.0.2"}\n',
    });
    expect(url).toBe('https://example.com/pull/1625');
    expect(refWrites().map(({ method, body }) => [method, body?.ref])).toEqual([
      ['POST', `refs/heads/${temporary}`],
      ['POST', ref],
      ['DELETE', undefined],
    ]);
    expect(refWrites()[1].body.sha).toBe(head);
    expect(graphqlCalls()).toHaveLength(1);
    expect(events.at(-1).method).toBe('POST');
  }
);

test('deletes the temp ref when createCommitOnBranch throws', () => {
  const previous = release();
  commitDev({ 'app.txt': 'new dev content\n' });
  const originalApi = api;
  api = (method, endpoint, body) => {
    if (endpoint === 'graphql') {
      events.push({ method, endpoint, body });
      throw new Error('Interrupted');
    }
    return originalApi(method, endpoint, body);
  };
  events.length = 0;
  expect(() => release()).toThrow('Interrupted');
  expect(events.map(({ method, endpoint }) => `${method} ${endpoint}`)).toEqual(
    [
      `POST repos/${repository}/git/refs`,
      'POST graphql',
      `DELETE repos/${repository}/git/refs/heads/${temporary}`,
    ]
  );
  expect(temporaryRefs()).toEqual([]);
  expect(releaseHead()).toBe(previous.head);
  expect(pullRequest.number).toBe(1624);

  api = originalApi;
  const { head } = release();
  expect(server(['show', `${head}:app.txt`]).toString()).toBe(
    'new dev content\n'
  );
  expect(events.at(-1).endpoint).toContain('/pulls/1624');
});

test('never writes main or dev refs', () => {
  git('push', 'origin', 'dev:main');
  const main = revParse('refs/heads/main');
  release();
  const dev = commitDev({ 'app.txt': 'later dev\n' });
  release();
  expect(revParse('refs/heads/main')).toBe(main);
  expect(revParse('refs/heads/dev')).toBe(dev);
  expect(refWrites()).toHaveLength(6);
  for (const event of refWrites()) {
    expect(event.body?.ref ?? event.endpoint).toMatch(
      /heads\/changeset-release\/(dev|tmp-test)$/
    );
  }
  for (const event of graphqlCalls()) {
    expect(event.body.variables.input.branch.branchName).toBe(temporary);
  }
});

test('makes no API calls when the versioned tree matches dev', () => {
  const source = git('rev-parse', 'HEAD').toString().trim();
  const tree = git('write-tree').toString().trim();
  expect(() => updateRelease({ repository, source, tree, git, api })).toThrow(
    'nothing to release'
  );
  expect(events).toEqual([]);
});

test('exits without contacting GitHub when the real CLI reports no pending releases', () => {
  commitDev({
    'package.json': JSON.stringify({
      name: 'maze',
      version: '1.0.0',
      private: true,
      scripts: { changeset: 'changeset' },
    }),
    '.changeset/pending.md': null,
    '.changeset/config.json': JSON.stringify({ baseBranch: 'dev' }),
  });
  writeFileSync(join(work, '.git/info/exclude'), 'node_modules\n');
  symlinkSync(
    join(process.cwd(), 'node_modules'),
    join(work, 'node_modules'),
    'dir'
  );
  const script = join(process.cwd(), '.github/scripts/release.mjs');
  // A gh shim fails the test if the script reaches the GitHub API.
  const bin = join(directory, 'bin');
  mkdirSync(bin);
  writeFileSync(join(bin, 'gh'), '#!/bin/sh\necho "gh called" >&2\nexit 1\n', {
    mode: 0o755,
  });
  const output = execFileSync(process.execPath, [script], {
    cwd: work,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      GH_REPO: repository,
      GITHUB_REF: 'refs/heads/dev',
      GH_TOKEN: 'test-token',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  expect(output.toString()).toBe('No pending releases.\n');
});

test('stops when the temp branch moves before the version commit', () => {
  const previous = release();
  commitDev({ 'app.txt': 'concurrent dev\n' });
  const originalApi = api;
  api = (method, endpoint, body) => {
    const result = originalApi(method, endpoint, body);
    if (method === 'POST' && body?.ref === `refs/heads/${temporary}`) {
      const concurrent = server(
        ['commit-tree', `${previous.head}^{tree}`, '-p', body.sha],
        { input: 'Concurrent push' }
      )
        .toString()
        .trim();
      server(['update-ref', body.ref, concurrent]);
    }
    return result;
  };
  expect(() => release()).toThrow('Stale head');
  expect(releaseHead()).toBe(previous.head);
  expect(temporaryRefs()).toEqual([]);
  expect(events.at(-1).method).toBe('DELETE');
});

test('stops before moving the release branch if the commit signature is not verified', () => {
  const originalApi = api;
  api = (method, endpoint, body) => {
    const result = originalApi(method, endpoint, body);
    if (endpoint === 'graphql') {
      result.data.createCommitOnBranch.commit.signature.isValid = false;
    }
    return result;
  };
  expect(() => release()).toThrow('did not verify');
  expect(releaseHead()).toBe('');
  expect(temporaryRefs()).toEqual([]);
  expect(pullRequest).toBeNull();
});

test('names the Actions setting when GitHub refuses to create the PR', () => {
  canCreatePulls = false;
  expect(() => release()).toThrow(
    'Settings → Actions → General → Allow GitHub Actions to create and approve pull requests'
  );
  expect(temporaryRefs()).toEqual([]);
  expect(pullRequest).toBeNull();
});

test('names the temp ref after the workflow run', () => {
  vi.stubEnv('GITHUB_RUN_ID', '40409473291');
  vi.stubEnv('GITHUB_RUN_ATTEMPT', '2');
  release({}, {});
  expect(graphqlCalls()[0].body.variables.input.branch.branchName).toBe(
    'changeset-release/tmp-40409473291-2'
  );
});
