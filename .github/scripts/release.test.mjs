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

  // The fake API writes real Git objects, rejecting stale expected heads and
  // every non-fast-forward update. No GitHub requests or real branches change.
  const append = (head, tree, message, parents = [head]) => {
    const commit = server(
      ['commit-tree', tree, ...parents.flatMap((parent) => ['-p', parent])],
      { input: message }
    )
      .toString()
      .trim();
    server(['merge-base', '--is-ancestor', head, commit]);
    server(['update-ref', ref, commit, head]);
    return commit;
  };
  api = (method, endpoint, body) => {
    events.push({ method, endpoint, body });
    expect(method).not.toBe('DELETE');
    const head = () => server(['rev-parse', ref]).toString().trim();
    if (endpoint.endsWith(`/git/matching-refs/heads/${branch}`)) {
      const output = server(['for-each-ref', '--format=%(objectname)', ref])
        .toString()
        .trim();
      return output ? [{ ref, object: { sha: output } }] : [];
    }
    if (endpoint.endsWith('/git/refs')) {
      expect(body.ref).toBe(ref);
      server(['update-ref', ref, body.sha, '0'.repeat(40)]);
      return {};
    }
    if (method === 'PATCH' && endpoint.endsWith(`/git/refs/heads/${branch}`)) {
      expect(body.force).toBe(false);
      const current = head();
      server(['merge-base', '--is-ancestor', current, body.sha]);
      server(['update-ref', ref, body.sha, current]);
      return { object: { sha: body.sha } };
    }
    expect(body?.force).toBeUndefined();
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
    if (endpoint.endsWith(`/git/ref/heads/${branch}`)) {
      return { object: { sha: head() } };
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
  git('fetch', 'origin', branch);
  const head = server(['rev-parse', ref]).toString().trim();
  expect(
    server(['rev-parse', `${head}^{tree}`])
      .toString()
      .trim()
  ).toBe(tree);
  return { source, tree, head, url };
}

test('creates a signed release commit and PR, including additions and deletions', () => {
  const binary = Buffer.from([0, 255, 128, 1]);
  const { head, url } = release({ 'generated.bin': binary });
  expect(url).toBe('https://example.com/pull/1624');
  expect(server(['show', `${head}:generated.bin`])).toEqual(binary);
  expect(server(['show', `${head}:CHANGELOG.md`]).toString()).toContain(
    '1.0.1'
  );
  expect(events.filter((event) => event.endpoint === 'graphql')).toHaveLength(
    1
  );
});

test('updates a divergent release branch without losing history or current dev files', () => {
  const previous = release();
  commitDev({
    'app.txt': 'current dev\n',
    'binary.dat': Buffer.from([0, 1, 255]),
  });
  events.length = 0;
  const { head } = release();
  server(['merge-base', '--is-ancestor', previous.head, head]);
  expect(server(['show', `${head}:app.txt`]).toString()).toBe('current dev\n');
  expect(server(['show', `${head}:binary.dat`])).toEqual(
    Buffer.from([0, 1, 255])
  );
  expect(events.filter((event) => event.endpoint === 'graphql')).toHaveLength(
    2
  );
  expect(events.some((event) => event.endpoint.endsWith('/merges'))).toBe(
    false
  );
  expect(events.at(-1).endpoint).toContain('/pulls/1624');
});

test.each(['sync', 'version'])(
  'recovers after an interrupted %s step',
  (step) => {
    const previous = release();
    commitDev({ 'app.txt': 'new dev content\n' });
    const originalApi = api;
    api = (method, endpoint, body) => {
      if (
        (step === 'sync' &&
          endpoint === 'graphql' &&
          body.variables.input.message.headline ===
            'Sync release branch with current dev') ||
        (step === 'version' &&
          endpoint === 'graphql' &&
          body.variables.input.message.headline === 'Version Packages')
      ) {
        throw new Error('Interrupted');
      }
      return originalApi(method, endpoint, body);
    };
    expect(() => release()).toThrow('Interrupted');
    api = originalApi;
    const { head } = release();
    server(['merge-base', '--is-ancestor', previous.head, head]);
    expect(server(['show', `${head}:app.txt`]).toString()).toBe(
      'new dev content\n'
    );
    expect(events.at(-1).endpoint).toContain('/pulls/1624');
  }
);

test('does not append commits when rerun with the same release tree', () => {
  const previous = release();
  events.length = 0;
  expect(release().head).toBe(previous.head);
  expect(events.some((event) => event.endpoint === 'graphql')).toBe(false);
  expect(
    events.some(
      (event) =>
        event.method === 'PATCH' &&
        event.endpoint.endsWith(`/git/refs/heads/${branch}`)
    )
  ).toBe(false);
});

test.each(['merge', 'squash'])(
  'reuses the retained branch after a %s release',
  (mode) => {
    const previous = release();
    git('merge', mode === 'squash' ? '--squash' : '--no-edit', previous.head);
    commitDev({ '.changeset/pending.md': 'next release\n' });
    pullRequest = null;
    events.length = 0;
    const { head } = release({
      'package.json': '{"name":"maze","version":"1.0.2"}\n',
    });
    server(['merge-base', '--is-ancestor', previous.head, head]);
    expect(events.some((event) => event.endpoint.endsWith('/git/refs'))).toBe(
      false
    );
    expect(
      events.some(
        (event) =>
          event.method === 'PATCH' &&
          event.endpoint.endsWith(`/git/refs/heads/${branch}`)
      )
    ).toBe(mode === 'merge');
    expect(events.filter((event) => event.endpoint === 'graphql')).toHaveLength(
      mode === 'merge' ? 1 : 2
    );
    expect(events.at(-1).method).toBe('POST');
  }
);

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
  const output = execFileSync(process.execPath, [script], {
    cwd: work,
    env: {
      ...process.env,
      GH_REPO: repository,
      GITHUB_REF: 'refs/heads/dev',
      GH_TOKEN: 'test-token',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  expect(output.toString()).toBe('No pending releases.\n');
});

test('stops when GitHub reports a stale expected head', () => {
  const previous = release();
  const originalApi = api;
  api = (method, endpoint, body) => {
    if (endpoint === 'graphql') {
      body.variables.input.expectedHeadOid = '0'.repeat(40);
    }
    return originalApi(method, endpoint, body);
  };
  commitDev({ 'app.txt': 'concurrent dev\n' });
  expect(() => release()).toThrow('Stale head');
  expect(server(['rev-parse', ref]).toString().trim()).toBe(previous.head);
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
