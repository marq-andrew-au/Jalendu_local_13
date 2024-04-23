
const fs = require('fs');
const path = require('path');

module.exports.path = './db';

module.exports.db = {};

module.exports.save = false;



module.exports.get = async function(key, options) {
  //return await fs.readFile(this.path + '/' + key + '.json','utf8');
  return await fs.promises.readFile(this.path + '/' + key + '.json','utf8')
    .then((e) => {
      console.log(e);
      })
    .then((strValue) => {
        if (options && options.raw) {
          return strValue;
        }

        if (!strValue) {
          return null;
        }

        let value = strValue;
        try {
          // Try to parse as JSON, if it fails, we throw
          value = JSON.parse(strValue);
        } catch (_err) {
          throw new SyntaxError(
            `Failed to parse value of ${key}, try passing a raw option to get the raw value`
          );
        }

        if (value === null || value === undefined) {
          return null;
        }

        return value;
      });
  }

module.exports.set = async function(key, value) {
  return await fs.promises.writeFile(this.path + '/' + key + '.json', value, 'utf8');
}

module.exports.delete = async function(key) {
  return await fs.promises.unlink(this.path + '/' + key + '.json');
}

module.exports.list = async function() {
  return fs.promises.readdir(this.path);
}

module.exports.savetofile = function(force=false){
  if(this.save || force){
    let date = new Date();
    let bu = date.toISOString().split('T')[0];
  
    if(!fs.existsSync(this.path + '/db_' + bu + '.json')){
  	  fs.copyFileSync(this.path + '/db.json',this.path + '/db_' + bu + '.json');
    }
  
    fs.writeFileSync(this.path + '/db.json', JSON.stringify(this.db, null, 2),{encoding: 'utf8', flag: 'w'});
  }
}

module.exports.import = function(){
  const dir = fs.readdirSync(this.path + ' copy');
  this.db = new Object();
  
  for(i=0;i<dir.length;i++){
    if (dir[i].endsWith('.json')&& dir[i] !== 'db.json'){
      let filename = path.parse(dir[i]).name;
      let text = fs.readFileSync(this.path + ' copy/' + dir[i]);
      this.db[filename] = JSON.parse(text);
     }
  }
  
  this.savetofile(true);
}

