
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
 * Checks to see if a value is a function but not an asynchronous function
 * @param {any} value
 * @returns {boolean}
 */
function isSyncFunction(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Function]';
}

/**
 * Checks to see if a value is an asynchronous function
 * @param {any} value
 * @returns {boolean}
 */
function isAsyncFunction(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object AsyncFunction]';
}

/**
 * Checks to see if a value is a function
 * @param {any} value
 * @returns {boolean}
 */
function isFunction(value /* :mixed */) /* :boolean */{
  return isSyncFunction(value) || isAsyncFunction(value);
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
 * AsyncFunction and SyncFunction are missing, as they are more specific types that people can detect afterwards.
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
  isSyncFunction: isSyncFunction,
  isAsyncFunction: isAsyncFunction,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9hdXRvLXVwZGF0ZS1wbHVzL25vZGVfbW9kdWxlcy90eXBlY2hlY2tlci9zb3VyY2UvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxZQUFZLENBQUE7OztBQUdaLElBQU0sc0JBQXNCLEdBQUcsQ0FBQyxDQUFBO0FBQ2hDLElBQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFBO0FBQ3pDLElBQU0sNkJBQTZCLEdBQUcsRUFBRSxDQUFBOzs7Ozs7Ozs7O0FBV3hDLFNBQVMsYUFBYSxDQUFFLEtBQUssNEJBQTZCO0FBQ3pELFNBQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0NBQzVDOzs7Ozs7O0FBT0QsU0FBUyxRQUFRLENBQUUsS0FBSywyQkFBNEI7O0FBRW5ELFNBQU8sS0FBSyxLQUFLLElBQUksSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUE7Q0FDbEQ7Ozs7Ozs7QUFPRCxTQUFTLGFBQWEsQ0FBRSxLQUFLLDJCQUE0Qjs7QUFFeEQsU0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxNQUFNLENBQUMsU0FBUyxDQUFBO0NBQzlEOzs7Ozs7O0FBT0QsU0FBUyxPQUFPLENBQUUsS0FBSyw2QkFBOEI7QUFDcEQsU0FBTyxLQUFLLElBQUksSUFBSSxDQUFBO0NBQ3BCOzs7Ozs7O0FBT0QsU0FBUyxhQUFhLENBQUUsS0FBSyw4QkFBK0I7O0FBRTNELE9BQUssSUFBTSxHQUFHLElBQUksS0FBSyxFQUFFO0FBQ3hCLFFBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM5QixhQUFPLEtBQUssQ0FBQTtLQUNaO0dBQ0Q7QUFDRCxTQUFPLElBQUksQ0FBQTtDQUNYOzs7Ozs7O0FBT0QsU0FBUyxhQUFhLENBQUUsS0FBSyw2QkFBOEI7O0FBRTFELFNBQU8sT0FB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QUFPLEdBQUcsQ0FBQTtPQUNWO0tBQ0Q7R0FDRDs7O0FBR0QsU0FBTyxJQUFJLENBQUE7Q0FDWDs7O0FBR0QsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNoQixlQUFhLEVBQWIsYUFBYTtBQUNiLFVBQVEsRUFBUixRQUFRO0FBQ1IsZUFBYSxFQUFiLGFBQWE7QUFDYixTQUFPLEVBQVAsT0FBTztBQUNQLGVBQWEsRUFBYixhQUFhO0FBQ2IsZUFBYSxFQUFiLGFBQWE7QUFDYixxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLFNBQU8sRUFBUCxPQUFPO0FBQ1AsU0FBTyxFQUFQLE9BQU87QUFDUCxRQUFNLEVBQU4sTUFBTTtBQUNOLGFBQVcsRUFBWCxXQUFXO0FBQ1gsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsaUJBQWUsRUFBZixlQUFlO0FBQ2YsWUFBVSxFQUFWLFVBQVU7QUFDVixVQUFRLEVBQVIsUUFBUTtBQUNSLFNBQU8sRUFBUCxPQUFPO0FBQ1AsVUFBUSxFQUFSLFFBQVE7QUFDUixVQUFRLEVBQVIsUUFBUTtBQUNSLFdBQVMsRUFBVCxTQUFTO0FBQ1QsUUFBTSxFQUFOLE1BQU07QUFDTixhQUFXLEVBQVgsV0FBVztBQUNYLE9BQUssRUFBTCxLQUFLO0FBQ0wsV0FBUyxFQUFULFNBQVM7QUFDVCxTQUFPLEVBQVAsT0FBTztBQUNQLFNBQU8sRUFBUCxPQUFPO0NBQ1AsQ0FBQSIsImZpbGUiOiIvaG9tZS9sdWl6LmNhcnJhcm8vLmF0b20vcGFja2FnZXMvYXV0by11cGRhdGUtcGx1cy9ub2RlX21vZHVsZXMvdHlwZWNoZWNrZXIvc291cmNlL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cbi8qIGVzbGludCBxdW90ZS1wcm9wczowICovXG4ndXNlIHN0cmljdCdcblxuLy8gQ2hhcmFjdGVyIHBvc2l0aW9uc1xuY29uc3QgSU5ERVhfT0ZfRlVOQ1RJT05fTkFNRSA9IDkgIC8vIFwiZnVuY3Rpb24gWFwiLCBYIGlzIGF0IGluZGV4IDlcbmNvbnN0IEZJUlNUX1VQUEVSQ0FTRV9JTkRFWF9JTl9BU0NJSSA9IDY1ICAvLyBBIGlzIGF0IGluZGV4IDY1IGluIEFTQ0lJXG5jb25zdCBMQVNUX1VQUEVSQ0FTRV9JTkRFWF9JTl9BU0NJSSA9IDkwICAgLy8gWiBpcyBhdCBpbmRleCA5MCBpbiBBU0NJSVxuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBWYWx1ZXNcblxuLyoqXG4gKiBHZXQgdGhlIG9iamVjdCB0eXBlIHN0cmluZ1xuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRPYmplY3RUeXBlICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpzdHJpbmcgKi8ge1xuXHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKVxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiBvYmplY3RcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0ICh2YWx1ZSAvKiA6YW55ICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdC8vIG51bGwgaXMgb2JqZWN0LCBoZW5jZSB0aGUgZXh0cmEgY2hlY2tcblx0cmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gb2JqZWN0IGFuZCBvbmx5IGFuIG9iamVjdFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCAodmFsdWUgLyogOmFueSAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHQvKiBlc2xpbnQgbm8tcHJvdG86MCAqL1xuXHRyZXR1cm4gaXNPYmplY3QodmFsdWUpICYmIHZhbHVlLl9fcHJvdG9fXyA9PT0gT2JqZWN0LnByb3RvdHlwZVxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBlbXB0eVxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNFbXB0eSAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB2YWx1ZSA9PSBudWxsXG59XG5cbi8qKlxuICogSXMgZW1wdHkgb2JqZWN0XG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0VtcHR5T2JqZWN0ICh2YWx1ZSAvKiA6T2JqZWN0ICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdC8vIFdlIGNvdWxkIHVzZSBPYmplY3Qua2V5cywgYnV0IHRoaXMgaXMgbW9yZSBlZmZlY2llbnRcblx0Zm9yIChjb25zdCBrZXkgaW4gdmFsdWUpIHtcblx0XHRpZiAodmFsdWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlXG59XG5cbi8qKlxuICogSXMgRVM2KyBjbGFzc1xuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmVDbGFzcyAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdC8vIE5PVEUgVE8gREVWRUxPUEVSOiBJZiBhbnkgb2YgdGhpcyBjaGFuZ2VzLCBpc0NsYXNzIG11c3QgYWxzbyBiZSB1cGRhdGVkXG5cdHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgdmFsdWUudG9TdHJpbmcoKS5pbmRleE9mKCdjbGFzcycpID09PSAwXG59XG5cbi8qKlxuICogSXMgQ29udmVudGlvbmFsIENsYXNzXG4gKiBMb29rcyBmb3IgZnVuY3Rpb24gd2l0aCBjYXBpdGFsIGZpcnN0IGxldHRlciBNeUNsYXNzXG4gKiBGaXJzdCBsZXR0ZXIgaXMgdGhlIDl0aCBjaGFyYWN0ZXJcbiAqIElmIGNoYW5nZWQsIGlzQ2xhc3MgbXVzdCBhbHNvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQ29udmVudGlvbmFsQ2xhc3MgKHZhbHVlIC8qIDphbnkgKi8pIC8qIDpib29sZWFuICovIHtcblx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlXG5cdGNvbnN0IGMgPSB2YWx1ZS50b1N0cmluZygpLmNoYXJDb2RlQXQoSU5ERVhfT0ZfRlVOQ1RJT05fTkFNRSlcblx0cmV0dXJuIGMgPj0gRklSU1RfVVBQRVJDQVNFX0lOREVYX0lOX0FTQ0lJICYmIGMgPD0gTEFTVF9VUFBFUkNBU0VfSU5ERVhfSU5fQVNDSUlcbn1cblxuLy8gVGhlcmUgdXNlIHRvIGJlIGNvZGUgaGVyZSB0aGF0IGNoZWNrZWQgZm9yIENvZmZlZVNjcmlwdCdzIFwiZnVuY3Rpb24gX0NsYXNzXCIgYXQgaW5kZXggMCAod2hpY2ggd2FzIHNvdW5kKVxuLy8gQnV0IGl0IHdvdWxkIGFsc28gY2hlY2sgZm9yIEJhYmVsJ3MgX19jbGFzc0NhbGxDaGVjayBhbnl3aGVyZSBpbiB0aGUgZnVuY3Rpb24sIHdoaWNoIHdhc24ndCBzb3VuZFxuLy8gYXMgc29tZXdoZXJlIGluIHRoZSBmdW5jdGlvbiwgYW5vdGhlciBjbGFzcyBjb3VsZCBiZSBkZWZpbmVkLCB3aGljaCB3b3VsZCBwcm92aWRlIGEgZmFsc2UgcG9zaXRpdmVcbi8vIFNvIGluc3RlYWQsIHByb3hpZWQgY2xhc3NlcyBhcmUgaWdub3JlZCwgYXMgd2UgY2FuJ3QgZ3VhcmFudGVlIHRoZWlyIGFjY3VyYWN5LCB3b3VsZCBhbHNvIGJlIGFuIGV2ZXIgZ3Jvd2luZyBzZXRcblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVHlwZXNcblxuLyoqXG4gKiBJcyBDbGFzc1xuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNDbGFzcyAodmFsdWUgLyogOmFueSAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHQvLyBOT1RFIFRPIERFVkVMT1BFUjogSWYgYW55IG9mIHRoaXMgY2hhbmdlcywgeW91IG1heSBhbHNvIG5lZWQgdG8gdXBkYXRlIGlzTmF0aXZlQ2xhc3Ncblx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlXG5cdGNvbnN0IHMgPSB2YWx1ZS50b1N0cmluZygpXG5cdGlmIChzLmluZGV4T2YoJ2NsYXNzJykgPT09IDApIHJldHVybiB0cnVlXG5cdGNvbnN0IGMgPSBzLmNoYXJDb2RlQXQoSU5ERVhfT0ZfRlVOQ1RJT05fTkFNRSlcblx0cmV0dXJuIGMgPj0gRklSU1RfVVBQRVJDQVNFX0lOREVYX0lOX0FTQ0lJICYmIGMgPD0gTEFTVF9VUFBFUkNBU0VfSU5ERVhfSU5fQVNDSUlcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gZXJyb3JcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IgKHZhbHVlIC8qIDptaXhlZCAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBFcnJvclxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhIGRhdGVcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgRGF0ZV0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGFuIGFyZ3VtZW50cyBvYmplY3RcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQXJndW1lbnRzICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBBcmd1bWVudHNdJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhIGZ1bmN0aW9uIGJ1dCBub3QgYW4gYXN5bmNocm9ub3VzIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1N5bmNGdW5jdGlvbiAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiBhc3luY2hyb25vdXMgZnVuY3Rpb25cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQXN5bmNGdW5jdGlvbiAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGEgZnVuY3Rpb25cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24gKHZhbHVlIC8qIDptaXhlZCAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gaXNTeW5jRnVuY3Rpb24odmFsdWUpIHx8IGlzQXN5bmNGdW5jdGlvbih2YWx1ZSlcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gcmVnZXhcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzUmVnRXhwICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBSZWdFeHBdJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiBhcnJheVxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNBcnJheSAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicgJiYgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHx8IGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVsZSBpcyBhIG51bWJlclxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIgKHZhbHVlIC8qIDptaXhlZCAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fCBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgTnVtYmVyXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYSBzdHJpbmdcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IFN0cmluZ10nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVsZSBpcyBhIGJvb2xlYW5cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQm9vbGVhbiAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2UgfHwgZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IEJvb2xlYW5dJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBudWxsXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc051bGwgKHZhbHVlIC8qIDptaXhlZCAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gdmFsdWUgPT09IG51bGxcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGEgTWFwXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc01hcCAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgTWFwXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYSBXZWFrTWFwXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1dlYWtNYXAgKHZhbHVlIC8qIDptaXhlZCAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IFdlYWtNYXBdJ1xufVxuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBHZW5lcmFsXG5cbi8qKlxuICogVGhlIHR5cGUgbWFwcGluZyAodHlwZSA9PiBtZXRob2QpIHRvIHVzZSBmb3IgZ2V0VHlwZS4gRnJvemVuLlxuICogQXN5bmNGdW5jdGlvbiBhbmQgU3luY0Z1bmN0aW9uIGFyZSBtaXNzaW5nLCBhcyB0aGV5IGFyZSBtb3JlIHNwZWNpZmljIHR5cGVzIHRoYXQgcGVvcGxlIGNhbiBkZXRlY3QgYWZ0ZXJ3YXJkcy5cbiAqL1xuY29uc3QgdHlwZU1hcCA9IE9iamVjdC5mcmVlemUoe1xuXHRhcnJheTogaXNBcnJheSxcblx0Ym9vbGVhbjogaXNCb29sZWFuLFxuXHRkYXRlOiBpc0RhdGUsXG5cdGVycm9yOiBpc0Vycm9yLFxuXHRjbGFzczogaXNDbGFzcyxcblx0ZnVuY3Rpb246IGlzRnVuY3Rpb24sXG5cdG51bGw6IGlzTnVsbCxcblx0bnVtYmVyOiBpc051bWJlcixcblx0cmVnZXhwOiBpc1JlZ0V4cCxcblx0c3RyaW5nOiBpc1N0cmluZyxcblx0J3VuZGVmaW5lZCc6IGlzVW5kZWZpbmVkLFxuXHRtYXA6IGlzTWFwLFxuXHR3ZWFrbWFwOiBpc1dlYWtNYXAsXG5cdG9iamVjdDogaXNPYmplY3Rcbn0pXG5cbi8qKlxuICogR2V0IHRoZSB0eXBlIG9mIHRoZSB2YWx1ZSBpbiBsb3dlcmNhc2VcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHBhcmFtIHtPYmplY3R9IFtjdXN0b21UeXBlTWFwXSBhIGN1c3RvbSB0eXBlIG1hcCAodHlwZSA9PiBtZXRob2QpIGluIGNhc2UgeW91IGhhdmUgbmV3IHR5cGVzIHlvdSB3aXNoIHRvIHVzZVxuICogQHJldHVybnMgez9zdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldFR5cGUgKHZhbHVlIC8qIDptaXhlZCAqLywgY3VzdG9tVHlwZU1hcCAvKiA6T2JqZWN0ICovID0gdHlwZU1hcCkgLyogOj9zdHJpbmcgKi8ge1xuXHQvLyBDeWNsZSB0aHJvdWdoIG91ciB0eXBlIG1hcFxuXHRmb3IgKGNvbnN0IGtleSBpbiBjdXN0b21UeXBlTWFwKSB7XG5cdFx0aWYgKGN1c3RvbVR5cGVNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0aWYgKGN1c3RvbVR5cGVNYXBba2V5XSh2YWx1ZSkpIHtcblx0XHRcdFx0cmV0dXJuIGtleVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIE5vIHR5cGUgd2FzIHN1Y2Nlc3NmdWxcblx0cmV0dXJuIG51bGxcbn1cblxuLy8gRXhwb3J0XG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Z2V0T2JqZWN0VHlwZSxcblx0aXNPYmplY3QsXG5cdGlzUGxhaW5PYmplY3QsXG5cdGlzRW1wdHksXG5cdGlzRW1wdHlPYmplY3QsXG5cdGlzTmF0aXZlQ2xhc3MsXG5cdGlzQ29udmVudGlvbmFsQ2xhc3MsXG5cdGlzQ2xhc3MsXG5cdGlzRXJyb3IsXG5cdGlzRGF0ZSxcblx0aXNBcmd1bWVudHMsXG5cdGlzU3luY0Z1bmN0aW9uLFxuXHRpc0FzeW5jRnVuY3Rpb24sXG5cdGlzRnVuY3Rpb24sXG5cdGlzUmVnRXhwLFxuXHRpc0FycmF5LFxuXHRpc051bWJlcixcblx0aXNTdHJpbmcsXG5cdGlzQm9vbGVhbixcblx0aXNOdWxsLFxuXHRpc1VuZGVmaW5lZCxcblx0aXNNYXAsXG5cdGlzV2Vha01hcCxcblx0dHlwZU1hcCxcblx0Z2V0VHlwZVxufVxuIl19