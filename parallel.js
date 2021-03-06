var xtend = require('xtend')
var defaults = {
  released: nop,
  results: true
}

function fastparallel (options) {
  options = xtend(defaults, options)

  var released = options.released
  var Holder = options.results ? ResultsHolder : NoResultsHolder
  var head = new Holder(release)
  var tail = head

  return parallel

  function next () {
    var holder = head

    if (holder.next) {
      head = holder.next
    } else {
      head = new Holder(release)
      tail = head
    }

    holder.next = null

    return holder
  }

  function parallel (that, toCall, arg, done) {
    var i
    var holder = next()
    if (toCall.length === 0) {
      done.call(that)
      released(head)
    } else {
      holder._callback = done
      holder._callThat = that
      if (typeof toCall === 'function') {
        holder._count = arg.length
        for (i = 0; i < arg.length; i++) {
          toCall.call(that, arg[i], holder.release)
        }
      } else {
        holder._count = toCall.length
        for (i = 0; i < toCall.length; i++) {
          toCall[i].call(that, arg, holder.release)
        }
      }

      if (holder._count === 0) {
        holder.release()
      }
    }
  }

  function release (holder) {
    tail.next = holder
    tail = holder
    released()
  }
}

function NoResultsHolder (_release) {
  this._count = -1
  this._callback = nop
  this._callThat = null
  this.next = null

  var that = this
  this.release = function () {
    that._count--

    if (that._count <= 0) { // handles an empty list
      that._callback.call(that._callThat)
      that._callback = nop
      that._callThat = null
      _release(that)
    }
  }
}

function ResultsHolder (_release) {
  this._count = -1
  this._callback = nop
  this._results = []
  this._err = null
  this._callThat = null
  this.next = null

  var that = this
  var i = 0
  this.release = function (err, result) {
    that._err = err
    that._results[i] = result
    if (++i >= that._count) { // handles an empty list
      that._callback.call(that._callThat, that._err, that._results)
      that._callback = nop
      that._results = []
      that._err = null
      that._callThat = null
      i = 0
      _release(that)
    }
  }
}

function nop () { }

module.exports = fastparallel
