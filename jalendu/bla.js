module.exports = {};

var foo = function(req, res, next) {
  return ('foo');
},

var bar = function(req, res, next) {
  return (foo());
}

module.exports.foo = foo;
module.exports.bar = bar;

// or

// module.exports = {
//   foo: foo,
//   bar: bar
// }

