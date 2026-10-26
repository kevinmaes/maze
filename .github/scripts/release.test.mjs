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
const repository = 'owner/maze';
const branch = 'changeset-release/dev';
const ref = `refs/heads/${branch}`;

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

  // The fake API writes real Git objects and rejects stale expected heads and
  // any ref write outside the release branch. No GitHub branches change.
  const append = (head, tree, message) => {
    const commit = server(['commit-tree', tree, '-p', head], { input: message })
      .toString()
      .trim();
    server(['update-ref', ref, commit, head]);
    return commit;
  };
  api = (method, endpoint, body) => {
    events.push({ method, endpoint, body });
    expect(method).not.toBe('DELETE');
    if (endpoint.includes('/git/ref')) {
      expect(endpoint).not.toMatch(/heads\/(main|dev)$/);
    }
    const head = () => server(['rev-parse', ref]).toString().trim();
    if (endpoint.endsWith(`/git/matching-refs/heads/${branch}`)) {
      const output = server(['for-each-ref', '--format=%(objectname)', ref])
        .toString()
        .trim();
      return output ? [{ ref, object: { sha: output } }] : [];
    }
    if (method === 'POST' && endpoint.endsWith('/git/refs')) {
      expect(body.ref).toBe(ref);
      server(['update-ref', ref, body.sha, '0'.repeat(40)]);
      return { object: { sha: body.sha } };
    }
    if (method === 'PATCH' && endpoint.endsWith(`/git/refs/heads/${branch}`)) {
      expect(body.force).toBe(true);
      server(['update-ref', ref, body.sha, head()]);
      return { object: { sha: body.sha } };
    }
    if (endpoint === 'graphql') {
      const input = body.variables.input;
      expect(input.branch).toEqual({
        repositoryNameWithOwner: repository,
        branchName: branch,
      });
      if (head() !== input.expectedHeadOid) throw new Error('Stale head');
      const index = join(directory, 'api-index');
      const options = {
        env: { ...process.env, GIT_INDEX_FILE: index, GIT_WORK_TREE: work },
      };
      server(['read-tree', head()], options);
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
      const oid = append(head(), tree, input.message.headline);
      return {
        data: {
          createCommitOnBranch: {
            commit: { oid, signature: { isValid: true } },
          },
        },
      };
    }
    if (method === 'GET' && endpoint.includes('/pulls?')) {
      expect(new URLSearchParams(endpoint.split('?')[1]).get('base')).toBe(
        'dev'
      );
      return pullRequest ? [pullRequest] : [];
    }
    if (method === 'PATCH' && endpoint.endsWith('/pulls/1624')) {
      expect(body.title).toBe('Version Packages');
      return pullRequest;
    }
    if (method === 'POST' && endpoint.endsWith('/pulls')) {
      expect(body).toMatchObject({
        head: branch,
        base: 'dev',
        title: 'Version Packages',
      });
      pullRequest = { number: 1624, html_url: 'https://example.com/pull/1624' };
      return pullRequest;
    }
    throw new Error(`Unexpected API call: ${method} ${endpoint}`);
  };
});

afterEach(() => rmSync(directory, { recursive: true, force: true }));

const revParse = (name) => server(['rev-parse', name]).toString().trim();
const refWrites = () =>
  events.filter(
    (event) => event.method !== 'GET' && event.endpoint.includes('/git/ref')
  );
const graphqlCalls = () =>
  events.filter((event) => event.endpoint === 'graphql');

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

function release(files = {}) {
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
  const url = updateRelease({ repository, source, tree, git, api });
  const head = revParse(ref);
  expect(revParse(`${head}^{tree}`)).toBe(tree);
  // The branch is always dev plus exactly one release commit.
  expect(revParse(`${head}^`)).toBe(source);
  expect(revParse('refs/heads/dev')).toBe(source);
  return { source, tree, head, url };
}

test('creates a missing release branch from dev with one signed commit and a PR', () => {
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
  expect(refWrites()).toEqual([
    {
      method: 'POST',
      endpoint: `repos/${repository}/git/refs`,
      body: { ref, sha: source },
    },
  ]);
  expect(graphqlCalls()).toHaveLength(1);
  expect(graphqlCalls()[0].body.variables.input.expectedHeadOid).toBe(source);
  expect(events.at(-1).method).toBe('POST');
});

test('resets an existing release branch to dev plus one commit', () => {
  release();
  const source = commitDev({
    'app.txt': 'current dev\n',
    'binary.dat': Buffer.from([0, 1, 255]),
  });
  events.length = 0;
  const { head } = release();
  expect(
    server(['rev-list', '--count', `dev..${head}`])
      .toString()
      .trim()
  ).toBe('1');
  expect(server(['show', `${head}:app.txt`]).toString()).toBe('current dev\n');
  expect(server(['show', `${head}:binary.dat`])).toEqual(
    Buffer.from([0, 1, 255])
  );
  expect(refWrites()).toEqual([
    {
      method: 'PATCH',
      endpoint: `repos/${repository}/git/refs/heads/${branch}`,
      body: { sha: source, force: true },
    },
  ]);
  expect(graphqlCalls()).toHaveLength(1);
  expect(events.at(-1).endpoint).toContain('/pulls/1624');
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
});

test.each(['merge', 'squash'])(
  'starts the next release from dev after a %s release',
  (mode) => {
    const previous = release();
    git('fetch', 'origin', branch);
    git('merge', mode === 'squash' ? '--squash' : '--no-edit', previous.head);
    if (mode === 'squash') git('commit', '-m', 'Version Packages (#1624)');
    commitDev({ '.changeset/pending.md': 'next release\n' });
    pullRequest = null;
    events.length = 0;
    release({ 'package.json': '{"name":"maze","version":"1.0.2"}\n' });
    expect(refWrites()).toHaveLength(1);
    expect(refWrites()[0].method).toBe('PATCH');
    expect(graphqlCalls()).toHaveLength(1);
    expect(events.at(-1).method).toBe('POST');
  }
);

test('recovers after an interrupted version commit', () => {
  release();
  commitDev({ 'app.txt': 'new dev content\n' });
  const originalApi = api;
  api = (method, endpoint, body) => {
    if (endpoint === 'graphql') throw new Error('Interrupted');
    return originalApi(method, endpoint, body);
  };
  expect(() => release()).toThrow('Interrupted');
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
  for (const event of refWrites()) {
    expect(event.body.ref ?? event.endpoint).toMatch(
      new RegExp(`heads/${branch}$`)
    );
  }
  expect(
    events.every(
      (event) =>
        event.endpoint !== 'graphql' ||
        event.body.variables.input.branch.branchName === branch
    )
  ).toBe(true);
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

test('stops when the release branch moves after the reset', () => {
  const previous = release();
  commitDev({ 'app.txt': 'concurrent dev\n' });
  const originalApi = api;
  let concurrent;
  api = (method, endpoint, body) => {
    const result = originalApi(method, endpoint, body);
    if (method === 'PATCH' && endpoint.includes('/git/refs/')) {
      concurrent = server(
        ['commit-tree', `${previous.head}^{tree}`, '-p', body.sha],
        {
          input: 'Concurrent push',
        }
      )
        .toString()
        .trim();
      server(['update-ref', ref, concurrent]);
    }
    return result;
  };
  expect(() => release()).toThrow('Stale head');
  expect(revParse(ref)).toBe(concurrent);
  expect(events.at(-1).endpoint).toBe('graphql');
});

test('stops before updating the PR if the commit signature is not verified', () => {
  const originalApi = api;
  api = (method, endpoint, body) => {
    const result = originalApi(method, endpoint, body);
    if (endpoint === 'graphql') {
      result.data.createCommitOnBranch.commit.signature.isValid = false;
    }
    return result;
  };
  expect(() => release()).toThrow('did not verify');
  expect(pullRequest).toBeNull();
});
