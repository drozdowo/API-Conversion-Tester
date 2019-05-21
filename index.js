import asciify from "asciify-image";
import axios from "axios";
import fs from "fs";
import _ from "lodash";
import chalk from "chalk";

ready();

const ready = async () => {
  console.log(chalk.blue.bold("\tAPI Conversion Tester\n"));
  if (fs.existsSync("./test.json")) {
    let fileData = await new Promise((resolve, reject) => {
      fs.readFile("./test.json", (err, data) => {
        if (err != null) reject(err);
        resolve(data);
      });
    }).catch(reason => {
      console.log(
        chalk.red(
          "Please ensure that 'test.json' exists at the root level of this directory."
        )
      );
      return;
    });
    const results = await setUpTests(JSON.parse(fileData));
  } else {
    console.log(
      chalk.red(
        `File does not exist. Please ensure that 'test.json' exists and try again.`
      )
    );
  }
};

//Set up some globals here
let original = null;
let converted = null;

const setUpTests = async tests => {
  original = tests.original;
  converted = tests.converted;
  if (original.auth != null) {
    // gotta do auth:
    const res = await axios
      .request({
        method: "post",
        url: original.baseUrl + original.auth.endpoint,
        data: original.auth.payload
      })
      .catch(reason => {
        console.log(`Error getting auth for ORIGINAL. reason: `, reason);
        process.exit(1);
      });
    if (res.status === 200) {
      original.auth.token = `Bearer ${res.data.access_token}`;
    }
  }

  console.log(chalk.blueBright("TEST NAME\t\t RESULT\t\t DIFF"));
  console.log(
    chalk.blueBright("*====================================================*")
  );
  const results = tests.tests.map(async test => {
    return performTest(test);
  });
  Promise.all(results).then(fulfilled => {
    printResults(fulfilled);
  });
};

const performTest = async test => {
  const origRes = await axios.request({
    method: test.method,
    url: original.baseUrl + test.endpoint,
    data: test.payload,
    headers: { Authorization: original.auth.token }
  });

  const convRes = await axios
    .request({
      method: test.method,
      url: converted.baseUrl + test.endpoint,
      data: test.payload
      //headers: { Authorization: original.auth.token }
    })
    .catch(reason => {
      console.log(
        "Error performing test: ",
        test.testName,
        " reason: ",
        reason
      );
    });

  if (_.isEqual(origRes.data, convRes.data)) {
    // console.log(test.testName, "\t\t", chalk.green.bold("PASSED"));
    return { testName: test.testName, result: 1 };
  } else {
    // console.log(test.testName, "\t\t", chalk.red.bold("FAILED"));
    return { testName: test.testName, result: 0, jsonDiff: {} };
    //todo add jsondiff for the original and converted
  }
};

const printResults = results => {
  results.map(a => {
    if (a.result) {
      console.log(
        a.testName,
        "\t\t",
        chalk.greenBright.bold("PASSED"),
        "\t\t",
        chalk.greenBright.bold(" -")
      );
    } else {
      console.log(
        a.testName,
        "\t\t",
        chalk.redBright.bold.underline("FAILED"),
        "\t\t",
        a.jsonDiff
      );
    }
  });
};
