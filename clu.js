(function () {
"use strict";

var CLU = {};
var assert = require('assert');

require('./procedure.js')(CLU);
require('./sequence.js')(CLU);
require('./iterator.js')(CLU);

CLU.error = {
	type_match: new Error("Types do not match"),
	no_type: new Error("Must provide type")
};

CLU.testType = function (type){
	return function (value){
		if ((type.name === "String"	&& typeof value === "string") ||
				(type.name === "Number"	&& typeof value === "number") ||
				(type.name === "Boolean" && typeof value === "boolean")||
				(value instanceof type)){
			return true;
		}
		throw CLU.error.type_match;
	};
};

CLU.copy = function (val) {
	var t = typeof val;
	var primitive = (t === "string" || t === "number" || t === "boolean");

	if (primitive){
		return val;
	} else {
		return val.constructor.copy(val);
	}
};

CLU.compare = function (fn, v1, v2){
	if (v1 === v2){ return true; }
	if (v1.constructor[fn] &&
		v1.constructor[fn](v1, v2)){ return true; }
	return false;
};


// tests
CLU.Sequence(Number, [1,2,3]);


var seq1 = CLU.Sequence(Number, [1,2,3]);
var seq2 = CLU.Sequence(Number, [1,2,3]);

assert(CLU.Sequence.equal(seq1,seq2));

module.exports = CLU;

})();
