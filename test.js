require('dotenv').config();

const db = require('./common/text_database.js');

console.log('hello mark');

console.log(process.env.JALENDU_TOKEN);

db.get('bumpbots')
.then(value => {
//console.log(value);
})
.catch(error => {
console.log(error);
});


//let x = 'hello';


//db.set('hello',x);

//db.delete('hello');

//db.list()
//.then (filenames => console.log(filenames))
//.catch (err => console.log(err));