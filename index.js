#!/usr/bin/env node

// https://en.wikipedia.org/wiki/Shebang_%28Unix%29

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const files = require('./lib/files');
const inquirer  = require('./lib/inquirer');
const github = require('./lib/github');
const repo = require('./lib/repo');

// clear terminal
clear();
// show your name of cli
console.log(
  chalk.yellow(
    figlet.textSync('Ginit', { horizontalLayout: 'full' })
  )
);
// 確定是否已經是git repository
if (files.directoryExists('.git')) {
    // 用chalk顯示紅色字樣
    console.log(chalk.red('Already a git repository!'));
    // 離開terminal
    process.exit();
}

const getGithubToken = async () => {
  // Fetch token from config store
  let token = github.getStoredGithubToken();
  if(token) {
    return token;
  }

  // No token found, use credentials to access github account
  await github.setGithubCredentials();

  // Check if access token for ginit was registered
  const accessToken = await github.hasAccessToken();
  if(accessToken) {
    console.log(chalk.yellow('An existing access token has been found!'));
    // ask user to regenerate a new token
    token = await github.regenerateNewToken(accessToken.id);
    return token;
  }

  // No access token found, register one now
  token = await github.registerNewToken();
  return token;
}
// prompt問題 - git account / passport
// const run = async () => {
//     const credentials = await inquirer.askGithubCredentials();
//     console.log(credentials);
// }
// 登入 git account / passport 並且register token
// const run = async () => {
//     let token = github.getStoredGithubToken();
//     if(!token) {
//       await github.setGithubCredentials();
//       token = await github.registerNewToken();    
//     }
//     console.log(token);
// }
const run = async () => {
  try {
    // Retrieve & Set Authentication Token
    const token = await getGithubToken();
    github.githubAuth(token);

    // Create remote repository
    const url = await repo.createRemoteRepo();

    // Create .gitignore file
    await repo.createGitignore();

    // Setup local repository and push to remote
    const done = await repo.setupRepo(url);
    if(done) {
      console.log(chalk.green('All done!'));
    }
  } catch(err) {
      if (err) {
        switch (err.code) {
          case 401:
            console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
            break;
          case 422:
            console.log(chalk.red('There already exists a remote repository with the same name'));
            break;
          default:
            console.log(err);
        }
      }
  }
}
run();