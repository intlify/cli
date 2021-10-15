export default {
  "hi": (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["hi there!"])};fn.source="hi there!";return fn;})(),
  "nested": {
    "hello": (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["hello world!"])};fn.source="hello world!";return fn;})(),
    "more": {
      "plural": (()=>{const fn=(ctx) => {const { normalize: _normalize, linked: _linked, interpolate: _interpolate, list: _list, named: _named, plural: _plural } = ctx;return _plural([_normalize([_linked("no apples", "caml")]), _normalize([_interpolate(_list(0)), " apple"]), _normalize([_interpolate(_named("n")), " apples"])])};fn.source="@.caml:{'no apples'} | {0} apple | {n} apples";return fn;})()
    },
    "list": (()=>{const fn=(ctx) => {const { normalize: _normalize, interpolate: _interpolate, list: _list } = ctx;return _normalize(["hi, ", _interpolate(_list(0)), " !"])};fn.source="hi, {0} !";return fn;})()
  },
  "こんにちは": (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["こんにちは！"])};fn.source="こんにちは！";return fn;})(),
  "single-quote": (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["I don't know!"])};fn.source="I don't know!";return fn;})(),
  "emoji": (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["😺"])};fn.source="😺";return fn;})(),
  "unicode": (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["A"])};fn.source="A";return fn;})(),
  "unicode-escape": (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["\\u0041"])};fn.source="\\u0041";return fn;})(),
  "backslash-single-quote": (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["\\'"])};fn.source="\\'";return fn;})(),
  "backslash-backslash": (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["\\\\"])};fn.source="\\\\";return fn;})(),
  "errors": [
    (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["ERROR1001"])};fn.source="ERROR1001";return fn;})(),
    (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["ERROR1002"])};fn.source="ERROR1002";return fn;})()
  ],
  "complex": {
    "warnings": [
      (()=>{const fn=(ctx) => {const { normalize: _normalize } = ctx;return _normalize(["NOTE: This is warning"])};fn.source="NOTE: This is warning";return fn;})(),
      {
        "named-waring": (()=>{const fn=(ctx) => {const { normalize: _normalize, interpolate: _interpolate, named: _named } = ctx;return _normalize(["this is ", _interpolate(_named("type")), " warining"])};fn.source="this is {type} warining";return fn;})()
      }
    ]
  }
}