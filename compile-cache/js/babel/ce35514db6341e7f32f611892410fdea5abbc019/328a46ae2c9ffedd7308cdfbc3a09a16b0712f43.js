
/* eslint quote-props:0 */
'use strict';

// Character positions
var INDEX_OF_FUNCTION_NAME = 9; // "function X", X is at index 9
var FIRST_UPPERCASE_INDEX_IN_ASCII = 65; // A is at index 65 in ASCII
var LAST_UPPERCASE_INDEX_IN_ASCII = 90; // Z is at index 90 in ASCII

// -----------------------------------
// Values

/**
 * Get the object type string
 * @param {any} value
 * @returns {string}
 */
function getObjectType(value /* :mixed */) /* :string */{
  return Object.prototype.toString.call(value);
}

/**
 * Checks to see if a value is an object
 * @param {any} value
 * @returns {boolean}
 */
function isObject(value /* :any */) /* :boolean */{
  // null is object, hence the extra check
  return value !== null && typeof value === 'object';
}

/**
 * Checks to see if a value is an object and only an object
 * @param {any} value
 * @returns {boolean}
 */
function isPlainObject(value /* :any */) /* :boolean */{
  /* eslint no-proto:0 */
  return isObject(value) && value.__proto__ === Object.prototype;
}

/**
 * Checks to see if a value is empty
 * @param {any} value
 * @returns {boolean}
 */
function isEmpty(value /* :mixed */) /* :boolean */{
  return value == null;
}

/**
 * Is empty object
 * @param {any} value
 * @returns {boolean}
 */
function isEmptyObject(value /* :Object */) /* :boolean */{
  // We could use Object.keys, but this is more effecient
  for (var key in value) {
    if (value.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

/**
 * Is ES6+ class
 * @param {any} value
 * @returns {boolean}
 */
function isNativeClass(value /* :mixed */) /* :boolean */{
  // NOTE TO DEVELOPER: If any of this changes, isClass must also be updated
  return typeof value === 'function' && value.toString().indexOf('class') === 0;
}

/**
 * Is Conventional Class
 * Looks for function with capital first letter MyClass
 * First letter is the 9th character
 * If changed, isClass must also be updated
 * @param {any} value
 * @returns {boolean}
 */
function isConventionalClass(value /* :any */) /* :boolean */{
  if (typeof value !== 'function') return false;
  var c = value.toString().charCodeAt(INDEX_OF_FUNCTION_NAME);
  return c >= FIRST_UPPERCASE_INDEX_IN_ASCII && c <= LAST_UPPERCASE_INDEX_IN_ASCII;
}

// There use to be code here that checked for CoffeeScript's "function _Class" at index 0 (which was sound)
// But it would also check for Babel's __classCallCheck anywhere in the function, which wasn't sound
// as somewhere in the function, another class could be defined, which would provide a false positive
// So instead, proxied classes are ignored, as we can't guarantee their accuracy, would also be an ever growing set

// -----------------------------------
// Types

/**
 * Is Class
 * @param {any} value
 * @returns {boolean}
 */
function isClass(value /* :any */) /* :boolean */{
  // NOTE TO DEVELOPER: If any of this changes, you may also need to update isNativeClass
  if (typeof value !== 'function') return false;
  var s = value.toString();
  if (s.indexOf('class') === 0) return true;
  var c = s.charCodeAt(INDEX_OF_FUNCTION_NAME);
  return c >= FIRST_UPPERCASE_INDEX_IN_ASCII && c <= LAST_UPPERCASE_INDEX_IN_ASCII;
}

/**
 * Checks to see if a value is an error
 * @param {any} value
 * @returns {boolean}
 */
function isError(value /* :mixed */) /* :boolean */{
  return value instanceof Error;
}

/**
 * Checks to see if a value is a date
 * @param {any} value
 * @returns {boolean}
 */
function isDate(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Date]';
}

/**
 * Checks to see if a value is an arguments object
 * @param {any} value
 * @returns {boolean}
 */
function isArguments(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Arguments]';
}

/**
 * Checks to see if a value is a function
 * @param {any} value
 * @returns {boolean}
 */
function isFunction(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Function]';
}

/**
 * Checks to see if a value is an regex
 * @param {any} value
 * @returns {boolean}
 */
function isRegExp(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object RegExp]';
}

/**
 * Checks to see if a value is an array
 * @param {any} value
 * @returns {boolean}
 */
function isArray(value /* :mixed */) /* :boolean */{
  return typeof Array.isArray === 'function' && Array.isArray(value) || getObjectType(value) === '[object Array]';
}

/**
 * Checks to see if a valule is a number
 * @param {any} value
 * @returns {boolean}
 */
function isNumber(value /* :mixed */) /* :boolean */{
  return typeof value === 'number' || getObjectType(value) === '[object Number]';
}

/**
 * Checks to see if a value is a string
 * @param {any} value
 * @returns {boolean}
 */
function isString(value /* :mixed */) /* :boolean */{
  return typeof value === 'string' || getObjectType(value) === '[object String]';
}

/**
 * Checks to see if a valule is a boolean
 * @param {any} value
 * @returns {boolean}
 */
function isBoolean(value /* :mixed */) /* :boolean */{
  return value === true || value === false || getObjectType(value) === '[object Boolean]';
}

/**
 * Checks to see if a value is null
 * @param {any} value
 * @returns {boolean}
 */
function isNull(value /* :mixed */) /* :boolean */{
  return value === null;
}

/**
 * Checks to see if a value is undefined
 * @param {any} value
 * @returns {boolean}
 */
function isUndefined(value /* :mixed */) /* :boolean */{
  return typeof value === 'undefined';
}

/**
 * Checks to see if a value is a Map
 * @param {any} value
 * @returns {boolean}
 */
function isMap(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Map]';
}

/**
 * Checks to see if a value is a WeakMap
 * @param {any} value
 * @returns {boolean}
 */
function isWeakMap(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object WeakMap]';
}

// -----------------------------------
// General

/**
 * The type mapping (type => method) to use for getType. Frozen.
 */
var typeMap = Object.freeze({
  array: isArray,
  boolean: isBoolean,
  date: isDate,
  error: isError,
  'class': isClass,
  'function': isFunction,
  'null': isNull,
  number: isNumber,
  regexp: isRegExp,
  string: isString,
  'undefined': isUndefined,
  map: isMap,
  weakmap: isWeakMap,
  object: isObject
});

/**
 * Get the type of the value in lowercase
 * @param {any} value
 * @param {Object} [customTypeMap] a custom type map (type => method) in case you have new types you wish to use
 * @returns {?string}
 */
function getType(value /* :mixed */) /* :?string */{
  var customTypeMap /* :Object */ = arguments.length <= 1 || arguments[1] === undefined ? typeMap : arguments[1];

  // Cycle through our type map
  for (var key in customTypeMap) {
    if (customTypeMap.hasOwnProperty(key)) {
      if (customTypeMap[key](value)) {
        return key;
      }
    }
  }

  // No type was successful
  return null;
}

// Export
module.exports = {
  getObjectType: getObjectType,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isEmpty: isEmpty,
  isEmptyObject: isEmptyObject,
  isNativeClass: isNativeClass,
  isConventionalClass: isConventionalClass,
  isClass: isClass,
  isError: isError,
  isDate: isDate,
  isArguments: isArguments,
  isFunction: isFunction,
  isRegExp: isRegExp,
  isArray: isArray,
  isNumber: isNumber,
  isString: isString,
  isBoolean: isBoolean,
  isNull: isNull,
  isUndefined: isUndefined,
  isMap: isMap,
  isWeakMap: isWeakMap,
  typeMap: typeMap,
  getType: getType
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9icm93c2Uvbm9kZV9tb2R1bGVzL3R5cGVjaGVja2VyL3NvdXJjZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLFlBQVksQ0FBQTs7O0FBR1osSUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQUE7QUFDaEMsSUFBTSw4QkFBOEIsR0FBRyxFQUFFLENBQUE7QUFDekMsSUFBTSw2QkFBNkIsR0FBRyxFQUFFLENBQUE7Ozs7Ozs7Ozs7QUFXeEMsU0FBUyxhQUFhLENBQUUsS0FBSyw0QkFBNkI7QUFDekQsU0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7Q0FDNUM7Ozs7Ozs7QUFPRCxTQUFTLFFBQVEsQ0FBRSxLQUFLLDJCQUE2Qjs7QUFFcEQsU0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQTtDQUNsRDs7Ozs7OztBQU9ELFNBQVMsYUFBYSxDQUFFLEtBQUssMkJBQTZCOztBQUV6RCxTQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUE7Q0FDOUQ7Ozs7Ozs7QUFPRCxTQUFTLE9BQU8sQ0FBRSxLQUFLLDZCQUErQjtBQUNyRCxTQUFPLEtBQUssSUFBSSxJQUFJLENBQUE7Q0FDcEI7Ozs7Ozs7QUFPRCxTQUFTLGFBQWEsQ0FBRSxLQUFLLDhCQUFnQzs7QUFFNUQsT0FBTSxJQUFNLEdBQUcsSUFBSSxLQUFLLEVBQUc7QUFDMUIsUUFBSyxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFHO0FBQ2hDLGFBQU8sS0FBSyxDQUFBO0tBQ1o7R0FDRDtBQUNELFNBQU8sSUFBSSxDQUFBO0NBQ1g7Ozs7Ozs7QUFPRCxTQUFTLGFBQWEsQ0FBRSxLQUFLLDZCQUErQjs7QUFFM0QsU0FBTyxPQUFPLEtBQUssS0FB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LHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsU0FBTyxFQUFQLE9BQU87QUFDUCxTQUFPLEVBQVAsT0FBTztBQUNQLFFBQU0sRUFBTixNQUFNO0FBQ04sYUFBVyxFQUFYLFdBQVc7QUFDWCxZQUFVLEVBQVYsVUFBVTtBQUNWLFVBQVEsRUFBUixRQUFRO0FBQ1IsU0FBTyxFQUFQLE9BQU87QUFDUCxVQUFRLEVBQVIsUUFBUTtBQUNSLFVBQVEsRUFBUixRQUFRO0FBQ1IsV0FBUyxFQUFULFNBQVM7QUFDVCxRQUFNLEVBQU4sTUFBTTtBQUNOLGFBQVcsRUFBWCxXQUFXO0FBQ1gsT0FBSyxFQUFMLEtBQUs7QUFDTCxXQUFTLEVBQVQsU0FBUztBQUNULFNBQU8sRUFBUCxPQUFPO0FBQ1AsU0FBTyxFQUFQLE9BQU87Q0FDUCxDQUFBIiwiZmlsZSI6Ii9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9icm93c2Uvbm9kZV9tb2R1bGVzL3R5cGVjaGVja2VyL3NvdXJjZS9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG4vKiBlc2xpbnQgcXVvdGUtcHJvcHM6MCAqL1xuJ3VzZSBzdHJpY3QnXG5cbi8vIENoYXJhY3RlciBwb3NpdGlvbnNcbmNvbnN0IElOREVYX09GX0ZVTkNUSU9OX05BTUUgPSA5ICAvLyBcImZ1bmN0aW9uIFhcIiwgWCBpcyBhdCBpbmRleCA5XG5jb25zdCBGSVJTVF9VUFBFUkNBU0VfSU5ERVhfSU5fQVNDSUkgPSA2NSAgLy8gQSBpcyBhdCBpbmRleCA2NSBpbiBBU0NJSVxuY29uc3QgTEFTVF9VUFBFUkNBU0VfSU5ERVhfSU5fQVNDSUkgPSA5MCAgIC8vIFogaXMgYXQgaW5kZXggOTAgaW4gQVNDSUlcblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVmFsdWVzXG5cbi8qKlxuICogR2V0IHRoZSBvYmplY3QgdHlwZSBzdHJpbmdcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0T2JqZWN0VHlwZSAodmFsdWUgLyogOm1peGVkICovKSAvKiA6c3RyaW5nICovIHtcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSlcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gb2JqZWN0XG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc09iamVjdCAodmFsdWUgLyogOmFueSAqLyApIC8qIDpib29sZWFuICovIHtcblx0Ly8gbnVsbCBpcyBvYmplY3QsIGhlbmNlIHRoZSBleHRyYSBjaGVja1xuXHRyZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0J1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiBvYmplY3QgYW5kIG9ubHkgYW4gb2JqZWN0XG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0ICh2YWx1ZSAvKiA6YW55ICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHQvKiBlc2xpbnQgbm8tcHJvdG86MCAqL1xuXHRyZXR1cm4gaXNPYmplY3QodmFsdWUpICYmIHZhbHVlLl9fcHJvdG9fXyA9PT0gT2JqZWN0LnByb3RvdHlwZVxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBlbXB0eVxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNFbXB0eSAodmFsdWUgLyogOm1peGVkICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gdmFsdWUgPT0gbnVsbFxufVxuXG4vKipcbiAqIElzIGVtcHR5IG9iamVjdFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNFbXB0eU9iamVjdCAodmFsdWUgLyogOk9iamVjdCAqLyApIC8qIDpib29sZWFuICovIHtcblx0Ly8gV2UgY291bGQgdXNlIE9iamVjdC5rZXlzLCBidXQgdGhpcyBpcyBtb3JlIGVmZmVjaWVudFxuXHRmb3IgKCBjb25zdCBrZXkgaW4gdmFsdWUgKSB7XG5cdFx0aWYgKCB2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpICkge1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlXG59XG5cbi8qKlxuICogSXMgRVM2KyBjbGFzc1xuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmVDbGFzcyAodmFsdWUgLyogOm1peGVkICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHQvLyBOT1RFIFRPIERFVkVMT1BFUjogSWYgYW55IG9mIHRoaXMgY2hhbmdlcywgaXNDbGFzcyBtdXN0IGFsc28gYmUgdXBkYXRlZFxuXHRyZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIHZhbHVlLnRvU3RyaW5nKCkuaW5kZXhPZignY2xhc3MnKSA9PT0gMFxufVxuXG4vKipcbiAqIElzIENvbnZlbnRpb25hbCBDbGFzc1xuICogTG9va3MgZm9yIGZ1bmN0aW9uIHdpdGggY2FwaXRhbCBmaXJzdCBsZXR0ZXIgTXlDbGFzc1xuICogRmlyc3QgbGV0dGVyIGlzIHRoZSA5dGggY2hhcmFjdGVyXG4gKiBJZiBjaGFuZ2VkLCBpc0NsYXNzIG11c3QgYWxzbyBiZSB1cGRhdGVkXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0NvbnZlbnRpb25hbENsYXNzICh2YWx1ZSAvKiA6YW55ICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHRpZiAoIHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyApICByZXR1cm4gZmFsc2Vcblx0Y29uc3QgYyA9IHZhbHVlLnRvU3RyaW5nKCkuY2hhckNvZGVBdChJTkRFWF9PRl9GVU5DVElPTl9OQU1FKVxuXHRyZXR1cm4gYyA+PSBGSVJTVF9VUFBFUkNBU0VfSU5ERVhfSU5fQVNDSUkgJiYgYyA8PSBMQVNUX1VQUEVSQ0FTRV9JTkRFWF9JTl9BU0NJSVxufVxuXG4vLyBUaGVyZSB1c2UgdG8gYmUgY29kZSBoZXJlIHRoYXQgY2hlY2tlZCBmb3IgQ29mZmVlU2NyaXB0J3MgXCJmdW5jdGlvbiBfQ2xhc3NcIiBhdCBpbmRleCAwICh3aGljaCB3YXMgc291bmQpXG4vLyBCdXQgaXQgd291bGQgYWxzbyBjaGVjayBmb3IgQmFiZWwncyBfX2NsYXNzQ2FsbENoZWNrIGFueXdoZXJlIGluIHRoZSBmdW5jdGlvbiwgd2hpY2ggd2Fzbid0IHNvdW5kXG4vLyBhcyBzb21ld2hlcmUgaW4gdGhlIGZ1bmN0aW9uLCBhbm90aGVyIGNsYXNzIGNvdWxkIGJlIGRlZmluZWQsIHdoaWNoIHdvdWxkIHByb3ZpZGUgYSBmYWxzZSBwb3NpdGl2ZVxuLy8gU28gaW5zdGVhZCwgcHJveGllZCBjbGFzc2VzIGFyZSBpZ25vcmVkLCBhcyB3ZSBjYW4ndCBndWFyYW50ZWUgdGhlaXIgYWNjdXJhY3ksIHdvdWxkIGFsc28gYmUgYW4gZXZlciBncm93aW5nIHNldFxuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUeXBlc1xuXG4vKipcbiAqIElzIENsYXNzXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0NsYXNzICh2YWx1ZSAvKiA6YW55ICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHQvLyBOT1RFIFRPIERFVkVMT1BFUjogSWYgYW55IG9mIHRoaXMgY2hhbmdlcywgeW91IG1heSBhbHNvIG5lZWQgdG8gdXBkYXRlIGlzTmF0aXZlQ2xhc3Ncblx0aWYgKCB0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgKSAgcmV0dXJuIGZhbHNlXG5cdGNvbnN0IHMgPSB2YWx1ZS50b1N0cmluZygpXG5cdGlmICggcy5pbmRleE9mKCdjbGFzcycpID09PSAwICkgIHJldHVybiB0cnVlXG5cdGNvbnN0IGMgPSBzLmNoYXJDb2RlQXQoSU5ERVhfT0ZfRlVOQ1RJT05fTkFNRSlcblx0cmV0dXJuIGMgPj0gRklSU1RfVVBQRVJDQVNFX0lOREVYX0lOX0FTQ0lJICYmIGMgPD0gTEFTVF9VUFBFUkNBU0VfSU5ERVhfSU5fQVNDSUlcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gZXJyb3JcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IgKHZhbHVlIC8qIDptaXhlZCAqLyApIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRXJyb3Jcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYSBkYXRlXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0RhdGUgKHZhbHVlIC8qIDptaXhlZCAqLyApIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBEYXRlXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gYXJndW1lbnRzIG9iamVjdFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNBcmd1bWVudHMgKHZhbHVlIC8qIDptaXhlZCAqLyApIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBBcmd1bWVudHNdJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uICh2YWx1ZSAvKiA6bWl4ZWQgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiByZWdleFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNSZWdFeHAgKHZhbHVlIC8qIDptaXhlZCAqLyApIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBSZWdFeHBdJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiBhcnJheVxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNBcnJheSAodmFsdWUgLyogOm1peGVkICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nICYmIEFycmF5LmlzQXJyYXkodmFsdWUpKSB8fCBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1bGUgaXMgYSBudW1iZXJcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyICh2YWx1ZSAvKiA6bWl4ZWQgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8IGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBOdW1iZXJdJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhIHN0cmluZ1xuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcgKHZhbHVlIC8qIDptaXhlZCAqLyApIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IFN0cmluZ10nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVsZSBpcyBhIGJvb2xlYW5cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQm9vbGVhbiAodmFsdWUgLyogOm1peGVkICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlIHx8IGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBCb29sZWFuXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgbnVsbFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNOdWxsICh2YWx1ZSAvKiA6bWl4ZWQgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB2YWx1ZSA9PT0gbnVsbFxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkICh2YWx1ZSAvKiA6bWl4ZWQgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGEgTWFwXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc01hcCAodmFsdWUgLyogOm1peGVkICovICkgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IE1hcF0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGEgV2Vha01hcFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNXZWFrTWFwICh2YWx1ZSAvKiA6bWl4ZWQgKi8gKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgV2Vha01hcF0nXG59XG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEdlbmVyYWxcblxuLyoqXG4gKiBUaGUgdHlwZSBtYXBwaW5nICh0eXBlID0+IG1ldGhvZCkgdG8gdXNlIGZvciBnZXRUeXBlLiBGcm96ZW4uXG4gKi9cbmNvbnN0IHR5cGVNYXAgPSBPYmplY3QuZnJlZXplKHtcblx0YXJyYXk6IGlzQXJyYXksXG5cdGJvb2xlYW46IGlzQm9vbGVhbixcblx0ZGF0ZTogaXNEYXRlLFxuXHRlcnJvcjogaXNFcnJvcixcblx0Y2xhc3M6IGlzQ2xhc3MsXG5cdGZ1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuXHRudWxsOiBpc051bGwsXG5cdG51bWJlcjogaXNOdW1iZXIsXG5cdHJlZ2V4cDogaXNSZWdFeHAsXG5cdHN0cmluZzogaXNTdHJpbmcsXG5cdCd1bmRlZmluZWQnOiBpc1VuZGVmaW5lZCxcblx0bWFwOiBpc01hcCxcblx0d2Vha21hcDogaXNXZWFrTWFwLFxuXHRvYmplY3Q6IGlzT2JqZWN0XG59KVxuXG4vKipcbiAqIEdldCB0aGUgdHlwZSBvZiB0aGUgdmFsdWUgaW4gbG93ZXJjYXNlXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbY3VzdG9tVHlwZU1hcF0gYSBjdXN0b20gdHlwZSBtYXAgKHR5cGUgPT4gbWV0aG9kKSBpbiBjYXNlIHlvdSBoYXZlIG5ldyB0eXBlcyB5b3Ugd2lzaCB0byB1c2VcbiAqIEByZXR1cm5zIHs/c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRUeXBlICh2YWx1ZSAvKiA6bWl4ZWQgKi8sIGN1c3RvbVR5cGVNYXAgLyogOk9iamVjdCAqLyA9IHR5cGVNYXApIC8qIDo/c3RyaW5nICovIHtcblx0Ly8gQ3ljbGUgdGhyb3VnaCBvdXIgdHlwZSBtYXBcblx0Zm9yICggY29uc3Qga2V5IGluIGN1c3RvbVR5cGVNYXAgKSB7XG5cdFx0aWYgKCBjdXN0b21UeXBlTWFwLmhhc093blByb3BlcnR5KGtleSkgKSB7XG5cdFx0XHRpZiAoIGN1c3RvbVR5cGVNYXBba2V5XSh2YWx1ZSkgKSB7XG5cdFx0XHRcdHJldHVybiBrZXlcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBObyB0eXBlIHdhcyBzdWNjZXNzZnVsXG5cdHJldHVybiBudWxsXG59XG5cbi8vIEV4cG9ydFxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGdldE9iamVjdFR5cGUsXG5cdGlzT2JqZWN0LFxuXHRpc1BsYWluT2JqZWN0LFxuXHRpc0VtcHR5LFxuXHRpc0VtcHR5T2JqZWN0LFxuXHRpc05hdGl2ZUNsYXNzLFxuXHRpc0NvbnZlbnRpb25hbENsYXNzLFxuXHRpc0NsYXNzLFxuXHRpc0Vycm9yLFxuXHRpc0RhdGUsXG5cdGlzQXJndW1lbnRzLFxuXHRpc0Z1bmN0aW9uLFxuXHRpc1JlZ0V4cCxcblx0aXNBcnJheSxcblx0aXNOdW1iZXIsXG5cdGlzU3RyaW5nLFxuXHRpc0Jvb2xlYW4sXG5cdGlzTnVsbCxcblx0aXNVbmRlZmluZWQsXG5cdGlzTWFwLFxuXHRpc1dlYWtNYXAsXG5cdHR5cGVNYXAsXG5cdGdldFR5cGVcbn1cbiJdfQ==