module.exports = function(CLU){
"use strict";

var proc = CLU.Proc;

// TODO: how will this work
// does each type have its own copy of this?
var type = {};

CLU.Sequence = function(type, vals){
	var ConstructorForType = function (type){
		this.type = type;
	};

	ConstructorForType.prototype = CLU.Sequence;

	var ctr = new ConstructorForType(type);

	ctr.create = proc({
		types: [Number, Array],
		returns: [ctr],
		throws: [_err.start_num]
	}, function (start, vals){
		if (typeof start !== "number"){ throw _err.start_num; }

		vals.map(CLU.testType(type));

		return {
			rep: {
				values: vals,
				start_index: start
			},
			constructor: ctr,
			type: type,
			toString: function (){
				var _rep = this.rep;
				var str  = "Sequence " + _rep.start_index + ":[ ";
				for (var i = 0; i < _rep.values.length; i++) {
					str += _rep.values[i].toString() + ' ';
				}
				str += "]";
				return str;
			}
		};
	});

	ctr.new = proc({
		returns: [ctr]
	},function (){
		return ctr.create(1,[]);
	});

	if (vals){
		return ctr.create(1,vals);
	}

	return ctr;
};

CLU.Sequence.error = {
	start_num: new Error('start index must be number'),
	bounds: new Error('index out of bounds')
};

var _cs = CLU.Sequence;
var _err = CLU.Sequence.error;

// predict

CLU.Sequence.low = proc({
	types: [CLU.Sequence(type)],
	returns: [type]
}, function (seq){
	return seq.rep.start_index;
});

CLU.Sequence.high = proc({
	types: [CLU.Sequence(type)],
	returns: [type]
},function (seq){
	return seq.rep.start_index + seq.rep.values.length;
});

CLU.Sequence.size = proc({
	types: [CLU.Sequence(type)],
	returns: [Number]
},function (seq){
	return seq.rep.values.length;
});

CLU.Sequence.empty = proc({
	types: [CLU.Sequence(type)],
	returns: [Boolean]
},function (seq){
	return seq.rep.values.length === 0;
});

CLU.Sequence.set_low = proc({
	types: [Number,CLU.Sequence(type)],
	returns: [CLU.Sequence(type)]
},function (index, seq){
	return seq.constructor.create(index, seq.rep.values);
});

// subseq
// fill
// fill_copy

CLU.Sequence.fetch = proc({
	types: [Number,CLU.Sequence(type)],
	returns: [type],
	throws: [_err.bounds]
}, function (index, seq){
	var low = _cs.low(seq);
	if (index > _cs.high(seq) || index < low){
		throw _err.bounds;
	}
	return seq.rep.values[index - low];
});

// TODO: Iterator type
CLU.Sequence.elements = proc({
	types: [CLU.Sequence(type)],
	returns: [CLU.Iterator]
}, function (seq){
	return CLU.Iterator._fromJSArray({
		type: seq.constructor,
		yields: seq.type
	}, seq.rep.values);
});

CLU.Sequence.bottom = proc({
	types: [CLU.Sequence(type)],
	returns: [type],
	throws: [_err.bounds]
}, function (seq){
	if (_cs.size(seq) === 0){
		throw _err.bounds;
	}
	return seq.rep.values[0];
});

CLU.Sequence.top = proc({
	types: [CLU.Sequence(type)],
	returns: [type],
	throws: [_err.bounds]
}, function (seq){
	if (_cs.size(seq) === 0){
		throw _err.bounds;
	}
	return seq.rep.values[seq.rep.values - 1];
});

CLU.Sequence.replace = proc({
	types: [Number, type, CLU.Sequence(type)],
	returns: [type],
	throws: [_err.bounds]
}, function (index, value, seq){
	CLU.testType(seq.type)(value);
	var low = _cs.low(seq);

	if (index > _cs.high(seq) || index < low){
		throw _err.bounds;
	}

	var copy = _cs.copy(seq);

	copy.rep.values[index - low] = value;

	return copy;
});

// addh
// addl
// remh
// reml

CLU.Sequence.e2s = proc({
	types: [type],
	returns: [CLU.Sequence(type)]
}, function (el){
	return CLU.Sequence(el.constructor).create(1, [el]);
});

CLU.Sequence.concat = proc({
	types: [CLU.Sequence(type),CLU.Sequence(type)],
	returns: [CLU.Sequence(type)]
}, function (seq1,seq2){
	if (seq1.type !== seq2.type){ throw CLU.error.type_match; }

	var new1 = _cs.copy(seq1);
	var new2 = _cs.copy(seq2);
	new1.rep.values = new1.rep.values.concat(new2.rep.values);
	return new1;
});

// a2s
// s2a

// elements
// indexes

CLU.Sequence.comparable = function (seq1,seq2){
	return (seq1.type === seq2.type) &&
		(_cs.size(seq1) === _cs.size(seq2));
};

CLU.Sequence.equal = proc({
	types: [CLU.Sequence(type),CLU.Sequence(type)],
	returns: [Boolean]
}, function (seq1, seq2){
	var size = _cs.size(seq1);
	var low = _cs.low(seq1);
	var e1, e2;

	if (!_cs.comparable(seq1, seq2)){ return false; }

	for (var i = 0; i < size; i++) {
		e1 = _cs.fetch(i + low, seq1);
		e2 = _cs.fetch(i + low, seq2);
		if (!CLU.compare('equal',e1,e2)){ return false; }
	}
	return true;
});

CLU.Sequence.similar = proc({
	types: [CLU.Sequence(type),CLU.Sequence(type)],
	returns: [Boolean]
}, function (seq1, seq2){
	var size = _cs.size(seq1);
	var low = _cs.low(seq1);
	var e1, e2;

	if (!_cs.comparable(seq1, seq2)){ return false; }

	for (var i = 0; i < size; i++) {
		e1 = _cs.fetch(i + low, seq1);
		e2 = _cs.fetch(i + low, seq2);

		if (!CLU.compare('similar',e1,e2)){ return false; }
	}
	return true;
});

CLU.Sequence.copy = proc({
	types: [CLU.Sequence(type)],
	returns: [CLU.Sequence(type)]
}, function (seq){
	var newvals = [];
	var oldvals = seq.rep.values;

	for (var i = 0; i < oldvals.length; i++) {
		newvals[i] = CLU.copy(oldvals[i]);
	}

	return seq.constructor.create(seq.rep.start_index, newvals);
});

return CLU.Sequence;
};

