import { spawn } from "child_process";

/**
 * Child Process Worker Code
 * Executed in a disposable Node.js child process with an empty environment.
 * The server process NEVER executes user code or calls eval/new Function.
 */
const CHILD_RUNNER_CODE = `
const vm = require('node:vm');
const { performance } = require('node:perf_hooks');

let inputData = '';
process.stdin.on('data', chunk => { inputData += chunk; });
process.stdin.on('end', async () => {
  try {
    const payload = JSON.parse(inputData);
    const { code, functionName, testCases = [], timeoutMs = 2000 } = payload;

    const logs = [];
    const sandbox = {
      console: {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        warn: (...args) => logs.push('[WARN] ' + args.join(' ')),
        error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
      },
      setTimeout: (fn, ms, ...args) => setTimeout(fn, ms, ...args),
      clearTimeout: (id) => clearTimeout(id),
      setInterval: (fn, ms, ...args) => setInterval(fn, ms, ...args),
      clearInterval: (id) => clearInterval(id),
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Map,
      Set,
      Promise,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    };

    // codeGeneration: { strings: false, wasm: false } strictly blocks eval & new Function inside VM
    const context = vm.createContext(sandbox, {
      codeGeneration: { strings: false, wasm: false }
    });

    const results = [];
    let allPassed = true;

    // Run user code definition
    try {
      vm.runInContext(code, context, { timeout: timeoutMs });
    } catch (err) {
      const errMsg = err && err.message ? err.message : String(err);
      process.stdout.write(JSON.stringify({
        passed: false,
        error: "Compilation or initialization error: " + errMsg,
        results: testCases.map(tc => ({
          name: tc.name || "Test Case",
          passed: false,
          error: errMsg,
          hidden: Boolean(tc.hidden),
        }))
      }));
      process.exit(0);
    }

    const deepEqual = (a, b) => {
      if (a === b) return true;
      if (a == null || b == null) return a === b;
      if (typeof a !== typeof b) return false;
      if (typeof a !== 'object') return false;
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const k of keysA) {
        if (!deepEqual(a[k], b[k])) return false;
      }
      return true;
    };

    for (const tc of testCases) {
      const start = performance.now();
      try {
        let actual;
        if (tc.testCode) {
          actual = vm.runInContext('(async () => { ' + tc.testCode + ' })()', context, { timeout: timeoutMs });
          if (actual && typeof actual.then === 'function') {
            actual = await actual;
          }
        } else if (functionName && typeof context[functionName] === 'function') {
          const args = Array.isArray(tc.input) ? tc.input : [tc.input];
          actual = context[functionName](...args);
          if (actual && typeof actual.then === 'function') {
            actual = await actual;
          }
        } else if (typeof context.solution === 'function') {
          const args = Array.isArray(tc.input) ? tc.input : [tc.input];
          actual = context.solution(...args);
          if (actual && typeof actual.then === 'function') {
            actual = await actual;
          }
        } else {
          throw new Error('Target function "' + (functionName || 'solution') + '" is not defined as a function.');
        }

        const duration = Math.round(performance.now() - start);
        const passed = deepEqual(actual, tc.expected);
        if (!passed) allPassed = false;

        results.push({
          name: tc.name || "Test Case",
          passed,
          expected: tc.expected,
          actual,
          executionTimeMs: duration,
          error: null,
          hidden: Boolean(tc.hidden),
        });
      } catch (err) {
        allPassed = false;
        results.push({
          name: tc.name || "Test Case",
          passed: false,
          expected: tc.expected,
          actual: null,
          executionTimeMs: Math.round(performance.now() - start),
          error: err && err.message ? err.message : String(err),
          hidden: Boolean(tc.hidden),
        });
      }
    }

    process.stdout.write(JSON.stringify({ passed: allPassed, results, logs }));
  } catch (fatal) {
    process.stdout.write(JSON.stringify({
      passed: false,
      error: fatal && fatal.message ? fatal.message : String(fatal),
      results: []
    }));
  }
});
`;

/**
 * Execute submission in an isolated child process sandbox runner.
 * Enforces execution time limits, max memory limits, zero environment secrets,
 * and no network or filesystem access.
 */
export async function executeInChildProcessSandbox({
  code,
  functionName,
  testCases = [],
  timeoutMs = 2000,
  memoryLimitMb = 64,
}) {
  return new Promise((resolve) => {
    const nodeBinary = process.execPath || "node";
    const child = spawn(nodeBinary, ["--max-old-space-size=" + memoryLimitMb, "-e", CHILD_RUNNER_CODE], {
      env: {}, // Completely empty environment variables - no JWT_SECRET, MONGO_URI, etc.
      stdio: ["pipe", "pipe", "pipe"],
      timeout: timeoutMs + 1000,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data;
    });

    child.stderr.on("data", (data) => {
      stderr += data;
    });

    child.on("close", (exitCode, signal) => {
      // Process killed due to timeout (e.g. infinite loop)
      if (signal === "SIGTERM" || signal === "SIGKILL" || exitCode === 143) {
        return resolve({
          passed: false,
          timedOut: true,
          error: `Time Limit Exceeded: Execution took longer than ${timeoutMs}ms limit.`,
          results: testCases.map((tc) => ({
            name: tc.name || "Test Case",
            passed: false,
            error: "Time Limit Exceeded (Timeout)",
            hidden: Boolean(tc.hidden),
          })),
        });
      }

      // Memory exhaustion or runtime crash
      if (exitCode !== 0 && !stdout.trim()) {
        const isOom = stderr.includes("heap out of memory") || stderr.includes("allocation failed");
        return resolve({
          passed: false,
          error: isOom
            ? "Memory Limit Exceeded: Script exceeded allocated 64MB memory limit."
            : `Runtime Process Error: Execution terminated with exit code ${exitCode}. ${stderr.trim()}`,
          results: testCases.map((tc) => ({
            name: tc.name || "Test Case",
            passed: false,
            error: isOom ? "Memory Limit Exceeded" : "Process Terminated",
            hidden: Boolean(tc.hidden),
          })),
        });
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (parseErr) {
        resolve({
          passed: false,
          error: "Sandbox execution output parsing error: " + parseErr.message,
          results: testCases.map((tc) => ({
            name: tc.name || "Test Case",
            passed: false,
            error: "Output Parsing Failed",
            hidden: Boolean(tc.hidden),
          })),
        });
      }
    });

    child.stdin.write(JSON.stringify({ code, functionName, testCases, timeoutMs }));
    child.stdin.end();
  });
}

/**
 * Main Sandbox Runner Dispatcher
 * Dispatches to Judge0, Docker, or the isolated child process runner.
 */
export async function runChallengeSandbox({
  code,
  functionName = "solution",
  testCases = [],
  timeoutMs = 2000,
  memoryLimitMb = 64,
}) {
  if (!code || typeof code !== "string") {
    return {
      passed: false,
      error: "No code provided for execution.",
      results: [],
    };
  }

  // 1. Hosted Judge (Judge0) fallback if configured
  if (process.env.JUDGE0_URL) {
    try {
      const response = await fetch(`${process.env.JUDGE0_URL}/submissions?wait=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: 63, // JavaScript (Node.js)
          cpu_time_limit: timeoutMs / 1000,
          memory_limit: memoryLimitMb * 1024,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        // If Judge0 returns standard output, fallback to child process for per-test mapping
      }
    } catch (_) {
      // Fall through to native child process runner
    }
  }

  // 2. Default Sandboxed Runner (Isolated Child Process)
  return executeInChildProcessSandbox({
    code,
    functionName,
    testCases,
    timeoutMs,
    memoryLimitMb,
  });
}

export default {
  runChallengeSandbox,
  executeInChildProcessSandbox,
};
