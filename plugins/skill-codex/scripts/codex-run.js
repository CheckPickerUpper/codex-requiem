#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

const USAGE = `
Usage: node codex-run.js [options]

Options:
  --model, -m <MODEL>           Codex model to use
  --reasoning <LEVEL>           Reasoning effort (xhigh, high, medium, low)
  --sandbox <MODE>              Sandbox mode (read-only, workspace-write, danger-full-access)
  --dir, -C <DIR>               Working directory
  --full-auto                   Enable full-auto mode
  --show-stderr                 Show thinking tokens (stderr) instead of suppressing
  --resume                      Resume last session
  --prompt <TEXT>               Prompt text (required)
`;

function parseArguments(argv) {
  const arguments = {
    model: null,
    reasoning: null,
    sandbox: "read-only",
    directory: null,
    fullAuto: false,
    showStderr: false,
    resume: false,
    prompt: null,
  };

  let i = 0;
  while (i < argv.length) {
    const argument = argv[i];
    switch (argument) {
      case "--model":
      case "-m":
        arguments.model = argv[++i];
        break;
      case "--reasoning":
        arguments.reasoning = argv[++i];
        break;
      case "--sandbox":
        arguments.sandbox = argv[++i];
        break;
      case "--dir":
      case "-C":
        arguments.directory = argv[++i];
        break;
      case "--full-auto":
        arguments.fullAuto = true;
        break;
      case "--show-stderr":
        arguments.showStderr = true;
        break;
      case "--resume":
        arguments.resume = true;
        break;
      case "--prompt":
        arguments.prompt = argv.slice(i + 1).join(" ");
        i = argv.length;
        break;
      case "--help":
        process.stdout.write(USAGE);
        process.exit(0);
        break;
      default:
        process.stderr.write(`Unknown option: ${argument}\n`);
        process.exit(1);
    }
    i++;
  }

  if (!arguments.prompt) {
    process.stderr.write("Error: --prompt is required\n");
    process.exit(1);
  }

  return arguments;
}

function quoteForShell(text) {
  if (process.platform === "win32") {
    return `"${text.replace(/"/g, '\\"')}"`;
  }
  return `'${text.replace(/'/g, "'\\''")}'`;
}

function buildCommand(arguments) {
  if (arguments.resume) {
    return buildResumeCommand(arguments);
  }
  return buildExecCommand(arguments);
}

function buildExecCommand(arguments) {
  const commandArguments = ["exec"];

  if (arguments.model) {
    commandArguments.push("-m", arguments.model);
  }

  if (arguments.reasoning) {
    commandArguments.push("--config", `model_reasoning_effort="${arguments.reasoning}"`);
  }

  commandArguments.push("--sandbox", arguments.sandbox);

  if (arguments.fullAuto) {
    commandArguments.push("--full-auto");
  }

  commandArguments.push("--skip-git-repo-check");

  if (arguments.directory) {
    commandArguments.push("-C", arguments.directory);
  }

  commandArguments.push(quoteForShell(arguments.prompt));

  return { commandArguments, useStdin: false };
}

function buildResumeCommand(arguments) {
  const commandArguments = ["exec", "--skip-git-repo-check", "resume", "--last"];
  return { commandArguments, useStdin: true };
}

function run(arguments) {
  const { commandArguments, useStdin } = buildCommand(arguments);

  const spawnOptions = {
    stdio: [useStdin ? "pipe" : "inherit", "pipe", arguments.showStderr ? "pipe" : "ignore"],
    shell: true,
  };

  const child = spawn("codex", commandArguments, spawnOptions);

  if (useStdin) {
    child.stdin.write(arguments.prompt);
    child.stdin.end();
  }

  let stdout = "";

  child.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  if (arguments.showStderr && child.stderr) {
    child.stderr.on("data", (data) => {
      process.stderr.write(data);
    });
  }

  child.on("close", (exitCode) => {
    if (stdout.trim()) {
      process.stdout.write(stdout);
    }
    process.exit(exitCode || 0);
  });

  child.on("error", (error) => {
    process.stderr.write(`Failed to start codex: ${error.message}\n`);
    process.exit(1);
  });
}

const parsedArguments = parseArguments(process.argv.slice(2));
run(parsedArguments);
