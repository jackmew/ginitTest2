/**
 * github
 * 處理github登入帳號密碼，並且取得token
 */
const octokit     = require('@octokit/rest')();
const Configstore = require('configstore');
const pkg         = require('../package.json');
const _           = require('lodash');
const CLI         = require('clui');
const Spinner     = CLI.Spinner;
const chalk       = require('chalk');

const inquirer    = require('./inquirer');

const conf = new Configstore(pkg.name);
console.log(pkg.name);

module.exports = {

    getInstance: () => {
      return octokit;
    },
    // authenticate with GitHub
    setGithubCredentials : async () => {
      const credentials = await inquirer.askGithubCredentials();
      console.log('credentials');
      console.log(credentials);
      // 用你給的帳號密碼去做authenticate
      octokit.authenticate(
        _.extend(
          {
            type: 'basic',
          },
          credentials
        )
      );
    },
    // getting an OAuth token involves a network request - 因此就給個Spinner 給使用者看 - 還有update function
    // octokit.authorization 成功後，回傳token給你
    registerNewToken : async () => {
      const status = new Spinner('Authenticating you, please wait...');
      status.start();
  
      try {
        const response = await octokit.authorization.create({
          scopes: ['user', 'public_repo', 'repo', 'repo:status'],
          note: 'ginits, the command-line tool for initalizing Git repos'
        });
        const token = response.data.token;
        if(token) {
          // 將你得到的token放入Configstore，下次就不需要再次authenticate
          conf.set('github.token', token);
          return token;
        } else {
          throw new Error("Missing Token","Github token was not found in the response");
        }
      } catch (err) {
        throw err;
      } finally {
        status.stop();
      }
    },
    // setting up an oauth authentication
    githubAuth : (token) => {
      octokit.authenticate({
        type : 'oauth',
        token : token
      });
    },
  
    getStoredGithubToken : () => {
      return conf.get('github.token');
    },
    // getting an OAuth token involves a network request - 因此就給個Spinner 給使用者看 - 還有update function
    hasAccessToken : async () => {
      const status = new Spinner('Authenticating you, please wait...');
      status.start();
  
      try {
        const response = await octokit.authorization.getAll();
        const accessToken = _.find(response.data, (row) => {
          if(row.note) {
            return row.note.indexOf('ginit') !== -1;
          }
        });
        return accessToken;
      } catch (err) {
        throw err;
      } finally {
        status.stop();
      }
    },
  
    regenerateNewToken : async (id) => {
      const tokenUrl = 'https://github.com/settings/tokens/' + id;
      console.log('Please visit ' + chalk.underline.blue.bold(tokenUrl) + ' and click the ' + chalk.red.bold('Regenerate Token Button.\n'));
      const input = await inquirer.askRegeneratedToken();
      if(input) {
        conf.set('github.token', input.token);
        return input.token;
      }
    }
  
  };