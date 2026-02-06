const { execSync } = require('child_process');
const fs = require('fs');

// Lightweight on-demand helper: return the earliest git commit date for a single file, else fall back to FS birthtime
module.exports = {
  get(filePath) {
    if (!filePath) return null;
    try {
      const out = execSync(`git log --follow --format=%aI -- "${filePath}"`, { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
      if (out.length) return out[out.length - 1]; // oldest commit date
    } catch (e) {
      // git not available or file not in git history
    }

    try {
      const stat = fs.statSync(filePath);
      return (stat.birthtime && stat.birthtimeMs) ? stat.birthtime.toISOString() : stat.ctime.toISOString();
    } catch (e) {
      return null;
    }
  }
};

