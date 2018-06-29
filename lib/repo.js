/**
 * repo
 * 登入到github後，可以使用github instance，來下一些github功能
 * ex: createRemoteReop
 */
const _           = require('lodash');
const fs          = require('fs');
const git         = require('simple-git')();
const CLI         = require('clui')
const Spinner     = CLI.Spinner;

const inquirer    = require('./inquirer');
const gh          = require('./github');

module.exports = {
  createRemoteRepo: async () => {
    const github = gh.getInstance();
    const answers = await inquirer.askRepoDetails();

    const data = {
      name : answers.name,
      description : answers.description,
      private : (answers.visibility === 'private')
    };

    const status = new Spinner('Creating remote repository...');
    status.start();

    try {
      const response = await github.repos.create(data);
      return response.data.ssh_url;
    } catch(err) {
      throw err;
    } finally {
      status.stop();
    }
  },
  createGitignore: async () => {
    /**
     * fs.readdirSync('.'): scan當前current的file/directory
     * without就是排除了某些不需要找的檔案
     */
    const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');
    // 當有file時才要繼續做
    if (filelist.length) {
      const answers = await inquirer.askIgnoreFiles(filelist);
      if (answers.ignore.length) {
        // 寫入文字到gitignore
        fs.writeFileSync( '.gitignore', answers.ignore.join( '\n' ) );
      } else {
        touch( '.gitignore' );
      }
    } else {
        touch('.gitignore');
    }
  },
  setupRepo: async (url) => {
    const status = new Spinner('Initializing local repository and pushing to remote...');
    status.start();

    try {
      await git
        .init()
        .add('.gitignore')
        .add('./*')
        .commit('Initial commit')
        .addRemote('origin', url)
        .push('origin', 'master');
      return true;
    } catch(err) {
      throw err;
    } finally {
      status.stop();
    }
  }
}