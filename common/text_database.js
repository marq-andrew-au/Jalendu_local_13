
const fs = require('fs');
const path = require('path');

var filename = path.basename(__filename) + ': ';
var filenamn = filename + '/n';

module.exports.path = './db';

module.exports.db = {};

module.exports.save = false;


function reviver(key, value) {
  if (typeof value === "string" && key.includes('time')) {
    return new Date(value);
  }
  return value;
}


module.exports.load = function(){
  let start = new Date();
  let text = fs.readFileSync(this.path + '/db.json');
  this.db = JSON.parse(text, reviver);
  let end = new Date();

  console.log(filename + 'db database loaded in ' + (end - start)/1000 + ' s');
}


module.exports.get = async function(key) {
  const promise = new Promise((resolve, reject) => {
    if (key in this.db){
      resolve(JSON.stringify(this.db[key]));
    }
    else {
      resolve(null);
    }
  });

  return promise;
}


module.exports.set = async function(key, value) {
  console.log('db.set ' + key);
  this.save = true;
  this.db[key] = JSON.parse(value);
  const promise = new Promise((resolve, reject) => {
    resolve(key);
  });

  return promise;
}


module.exports.delete = async function(key) {
  this.save = true;
  const promise = new Promise((resolve, reject) => {
    delete this.db[key];
    resolve(key);
  });

  return promise;
}


module.exports.list = async function() {
  const list = new Array();

  for(key in this.db){
    list.push(key);
  }

  const promise = new Promise((resolve, reject) => {
    resolve(list);
  });

  return promise;
}


module.exports.filesave = function(force=false){
  if(this.save || force){
    let date = new Date();
    let bu = date.toISOString().split('T')[0];

    if(!fs.existsSync(this.path + '/db_' + bu + '.json')){
      fs.copyFileSync(this.path + '/db.json',this.path + '/db_' + bu + '.json');
    }

    fs.writeFileSync(this.path + '/db.json', JSON.stringify(this.db, null, 2),{encoding: 'utf8', flag: 'w'});
    this.save = false;
    let end = new Date();

    console.log(filename + 'db database saved in ' + (end - date)/1000 + ' s');
  }
  else {
    //console.log(filename + 'db database not saved');
  }
}


module.exports.import = function(){
  const dir = fs.readdirSync(this.path + ' copy');
  this.db = new Object();

  for(i=0;i<dir.length;i++){
    if (dir[i].endsWith('.json') && dir[i] !== 'db.json'){
      let fname = path.parse(dir[i]).name;
      let text = fs.readFileSync(this.path + ' copy/' + dir[i]);
      this.db[fname] = JSON.parse(text);
    }
  }

  this.filesave(true);
}
