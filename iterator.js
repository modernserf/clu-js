module.exports = function (CLU) {
"use strict";

var proc = CLU.Proc;

// TODO: iterator type (yields)

CLU.Iterator = function (sig, fn){
  fn.type = sig.type;
  fn.yields = sig.yields;
  fn.throws = sig.throws;

  return fn;
};

CLU.Iterator.toSequence = function (iter){
  var arr = [];
  CLU.for(iter, function (el){ arr.push(el); });
  return CLU.Sequence.create(1,arr);
};


CLU.Iterator.integers = function (){
  var i = 1;
  return {
    next: function (){
      return {value: i++, done: false };
    }
  };
};

CLU.Iterator._fromJSArray = function (sig, arr){
  var fn = function (){
    var i = 0;

    return {
      next: function (){
        return i < arr.length ?
          { value: arr[i++], done: false } :
          { done: true };
      }
    };
  };

  return CLU.Iterator(sig, fn);
};

CLU.Iterator.take = function(iter, count){
  var newIter = function (){
    var c = count;
    var oldNext = iter().next;

    return {
      next: function (){
        if (c){
          c -= 1;
          return oldNext();
        } else {
          return { done: true };
        }

      }
    };
  };

  // bind old args to new iterator
  return CLU.Iterator(iter,newIter);
};

CLU.Iterator.filter = function(iter,cond){
  var newIter = function (){
    var oldNext = iter().next;

    var newNext = function (){
      var v = oldNext();
      // if done or meets condition return iterator
      if (v.done || cond(v.value)){ return v; }
      // run iterator until next passing condition or done
      return newNext();
    };

    return { next: newNext };
  };

  return CLU.Iterator(iter,newIter);
};

CLU.Iterator.map = function (iter,fn){
  var newIter = function (){
    var oldNext = iter().next;

    var newNext = function (){
      var v = oldNext();
      if (v.done){ return v; }
      return { value: fn(v.value), done: false };
    };

    return { next: newNext };
  };

  return CLU.Iterator(iter,newIter);
};


var odd = function (value){
  return value % 2 === 1;
};

var square = function (value){
  return value * value;
};

CLU.for = function (iterator, fn){
  var it = iterator();
  var done = false;
  while (true){
    var next = it.next();
    if (next.done){ return; }
    fn(next.value);
  }
};

return CLU.Iterator;
};