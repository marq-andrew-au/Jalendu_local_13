
//const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);

module.exports.trim = function(str, max) {
  return ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
}

module.exports.ts = function() {
  var m = new Date();
  return m.getUTCFullYear() +
    ("0" + (m.getUTCMonth() + 1)).slice(-2) +
    ("0" + m.getUTCDate()).slice(-2) + "-" +
    ("0" + m.getUTCHours()).slice(-2) +
    ("0" + m.getUTCMinutes()).slice(-2) +
    ("0" + m.getUTCSeconds()).slice(-2);
}


module.exports.bu = async function bu(client){
  let keys = await db.list();
  for(i=0;i<keys.length;i++){
    value = await db.get(keys[i]);
    json = JSON.parse(value, reviver);
    fs.writeFileSync(`./bu/${keys[i]}.json`, JSON.stringify(json, null, 2), 'utf-8');
  }
}
