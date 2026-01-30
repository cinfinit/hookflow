// src/executor/run.js

const { exec } = require('child_process');

function runCommand({ cmd, cwd }) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject({ code: error.code ?? 1, stdout, stderr });
      } else {
        resolve({ code: 0, stdout, stderr });
      }
    });
  });
}

module.exports = { runCommand };
