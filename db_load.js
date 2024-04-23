const fs = require('fs');

const Database = require("@replit/database");

const db = new Database();

function reviver(key, value) {
  if (typeof value === "string" && key.includes('time')) {
    return new Date(value);
  }
  return value;
}

db.list().then(keys => {

  for (i = 0; i < keys.length; i++) {

      console.log(keys[i]);
dump(keys[i]);
    }
});

function dump(key){

  db.get(key).then(value => {
    value = JSON.parse(value, reviver);

    fs.writeFileSync(`./db/${key}.json`, JSON.stringify(value, null, 2), 'utf-8');

  })
    .catch(err => { console.log(err) });
}