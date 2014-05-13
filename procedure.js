module.exports = function (CLU) {
"use strict";

var sign = function (sig, fn){
	fn.types = sig.types;
	fn.returns = sig.returns;
	fn.throws = sig.throws;
	return fn;
};

CLU.Proc = function (sig, fn){
	var arity = sig.types && sig.types.length || 0;

	switch (arity){
		case 2: return sign(sig, function (x,y){
			if (x === undefined){
				return binary;
			}
			if (y === undefined){
				return sign(function (_y){
					return fn(x, _y);
				});
			}
			return fn(x,y);
		});
		case 3: return sign(sig, function (x,y,z){
			if (x === undefined){
				return ternary;
			}
			if (y === undefined){
				return binary(function (_y, _z){
					return fn(x, _y, _z);
				});
			}
			if (z === undefined){
				return sign(function (_z){
					return fn(x, y, _z);
				});
			}
			return fn(x,y,z);
		});
		default: return sign(sig,fn);
	}
};

CLU.pipe = function (x /*, rest... */){
	if (x === undefined){ return; }
	var ln = arguments.length;
	for (var i = 1; i < ln; i++) {
		x = arguments[i](x);
	}
	return x;
};

return CLU.Proc;
};
