const fs = require('fs');
const path = require('path');

module.exports = {
  //get the current directory (to get a default repo name)
  getCurrentDirectoryBase : () => {
    // making our console application available globally
    return path.basename(process.cwd());
  },
  //check whether a directory exists (to determine whether the current folder is already a Git repository by looking for a folder named .git).
  directoryExists : (filePath) => {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch (err) {
      return false;
    }
  }
};