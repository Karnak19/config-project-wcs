#! /usr/bin/env node

const fs = require("fs");
const ora = require("ora");
const axios = require("axios");

const downloadGist = require("./downloadGist");
const chalk = require("chalk");

const deps = {
  eslint: { id: "e8cd4adf058f6354a245111a59f346b9" },
  caprover: { id: "d97ddda5c41fffc7fc33751bcaa2531a" },
};

let spinner;

(async () => {
  spinner = ora("Grabbing files... ☕️").start();

  const gists = await downloadGist("https://api.github.com/users/Karnak19/gists", [
    deps.caprover.id,
  ]);

  const files = gists.flatMap((gist) =>
    Object.values(gist).map((val) => ({
      promise: axios.get(val.raw_url),
    }))
  );

  const res = await Promise.all(files.map((f) => f.promise));

  res.forEach((f) => {
    if (typeof f.data === "object") {
      // eslint-disable-next-line no-param-reassign
      f.data = JSON.stringify(f.data);
    }
    const filename = f.request.path.split("/")[5];
    fs.writeFile(`${process.cwd()}/${filename}`, f.data, (err) => {
      if (err) throw err;
    });
  });

  spinner.stop();
  console.log(chalk.green("All done ! 🏆"));
})();
