# fastparallel

Zero-overhead parallel function call for node.js.

Benchmark for doing 3 calls `setImmediate` 1 million times:

* `async.parallel`: 5953ms
* `fastparallel`: 2664ms
* non-reusable `setImmediate`: 2221ms

These benchmarks where taken via `bench.js` on iojs 1.5.0, on a MacBook
Pro Retina 2014.

## Example

```js
var parallel = require('fastparallel')({
  // this is a function that will be called
  // when a parallel completes
  released: completed,

  // the maximum number of elements in the cache,
  // tune accordingly
  maxCache: 42
})

parallel(
  {}, // what will be this in the functions
  [something, something, something], // functions to call
  42, // the first argument of the functions
  done // the function to be called when the parallel ends
)

function something(arg, cb) {
  setImmediate(cb, null, 'myresult')
}

function done(err, results) {
  console.log('parallel completed, results:', results)
}

function completed() {
  console.log('parallel completed!')
}
```

## Caveats

The `results` object will be non-ordered, and the `done` function will
be called only once, even if more than one error happen.

This library works by caching functions, so that running a new parallel
does not cause **any memory allocations**.

## License

ISC
