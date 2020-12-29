export default {
  "hi": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["hi there!"])},
  "hello": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["hello world!"])},
  "named": (ctx) => {const { normalize: _normalize, interpolate: _interpolate, named: _named } = ctx;return _normalize(["hi, ", _interpolate(_named("name")), " !"])},
  "list": (ctx) => {const { normalize: _normalize, interpolate: _interpolate, list: _list } = ctx;return _normalize(["hi, ", _interpolate(_list(0)), " !"])},
  "literal": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["hi, ", "kazupon", " !"])},
  "linked": (ctx) => {const { normalize: _normalize, linked: _linked } = ctx;return _normalize(["hi, ", _linked("name"), " !"])},
  "plural": (ctx) => {const { normalize: _normalize, linked: _linked, interpolate: _interpolate, list: _list, named: _named, plural: _plural } = ctx;return _plural([_normalize([_linked("no apples", "caml")]), _normalize([_interpolate(_list(0)), " apple"]), _normalize([_interpolate(_named("n")), " apples"])])}
}