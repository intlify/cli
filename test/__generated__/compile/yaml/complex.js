const resource = {
  "hi": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["hi there!"])},
  "nested": {
    "hello": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["hello world!"])},
    "more": {
      "plural": (ctx) => {const { normalize: _normalize, linked: _linked, type: _type, interpolate: _interpolate, list: _list, named: _named, plural: _plural } = ctx;return _plural([_normalize([_linked("no apples", "caml", _type)]), _normalize([_interpolate(_list(0)), " apple"]), _normalize([_interpolate(_named("n")), " apples"])])}
    },
    "list": (ctx) => {const { normalize: _normalize, interpolate: _interpolate, list: _list } = ctx;return _normalize(["hi, ", _interpolate(_list(0)), " !"])}
  },
  "こんにちは": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["こんにちは！"])},
  "single-quote": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["I don't know!"])},
  "emoji": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["😺"])},
  "unicode": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["A"])},
  "unicode-escape": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["\\u0041"])},
  "backslash-single-quote": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["\\'"])},
  "backslash-backslash": (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["\\\\"])},
  "errors": [
    (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["ERROR1001"])},
    (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["ERROR1002"])},
    
  ],
  "complex": {
    "warnings": [
      (ctx) => {const { normalize: _normalize } = ctx;return _normalize(["NOTE: This is warning"])},
      {
        "named-waring": (ctx) => {const { normalize: _normalize, interpolate: _interpolate, named: _named } = ctx;return _normalize(["this is ", _interpolate(_named("type")), " warining"])}
      }
    ]
  }
}
export default resource