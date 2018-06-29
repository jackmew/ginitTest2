/**
 * inquirer
 * 用來問問題
 */
const inquirer   = require('inquirer');
const files      = require('./files');

module.exports = {
    // 用inquirer去 prompt 問題給使用者輸入
    askGithubCredentials: () => {
      const questions = [
        {
          name: 'username',
          type: 'input',
          message: 'Enter your GitHub username or e-mail address:',
          validate: function( value ) {
            if (value.length) {
              return true;
            } else {
              return 'Please enter your username or e-mail address.';
            }
          }
        },
        {
          name: 'password',
          type: 'password',
          message: 'Enter your password:',
          validate: function(value) {
            if (value.length) {
              return true;
            } else {
              return 'Please enter your password.';
            }
          }
        }
      ];
      // asks the user a series of questions
      return inquirer.prompt(questions);
    },
    /**
     * ginit my-repo "just a test repository"
     * 取得兩個參數
     * 1.default name: my-repo
     * 2.description: just a test repository
     */
    askRepoDetails: () => {
        const argv = require('minimist')(process.argv.slice(2));
    
        const questions = [
          {
            type: 'input',
            name: 'name',
            message: 'Enter a name for the repository:',
            default: argv._[0] || files.getCurrentDirectoryBase(),
            validate: function( value ) {
              if (value.length) {
                return true;
              } else {
                return 'Please enter a name for the repository.';
              }
            }
          },
          {
            type: 'input',
            name: 'description',
            default: argv._[1] || null,
            message: 'Optionally enter a description of the repository:'
          },
          {
            type: 'list',
            name: 'visibility',
            message: 'Public or private:',
            choices: [ 'public', 'private' ],
            default: 'public'
          }
        ];
        return inquirer.prompt(questions);
      },
      /**
       * 產生checkout的question.
       * 選擇要被.gitignore 不管的檔案
       */
      askIgnoreFiles: (filelist) => {
        const questions = [
          {
            type: 'checkbox',
            name: 'ignore',
            message: 'Select the files and/or folders you wish to ignore:',
            choices: filelist,
            default: ['node_modules', 'bower_components']
          }
        ];
        return inquirer.prompt(questions);
      }
  }
  