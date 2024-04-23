
const db = require('./common/text_database.js');



db.load();

console.log(db.db.camel)


const camel = {};

camel.hello = "hello";
camel.mark = new Date();

db.set('camel',JSON.stringify(camel,null,2))
.then( console.log(db.db.camel));

console.log(db.save);


db.filesave();

db.delete('camel');


console.log(db.save);



db.filesave();

  db.list().then(keys => {

    ct_exam = 0;
    ct_dossier = 0;

    for (i = 0; i < keys.length; i++) {
      if (keys[i].split('_')[0] === 'exam') {
        ct_exam = ct_exam + 1;
      }
      else if (keys[i].split('_')[0] === 'dossier') {
        ct_dossier = ct_dossier + 1;
      }
      else {
        console.log(keys[i]);
      }

      if (i === keys.length - 1) {
        console.log(`exam-* x ${ct_exam}`);
        console.log(`dossier-* x ${ct_dossier}`);
      }
    }
});
