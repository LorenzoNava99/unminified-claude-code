/**
 * Custom Zod utility extracted from embedded library
 *
 * This is a custom helper function that was part of the embedded Zod library
 * but is not part of the official Zod npm package. It needs to be preserved
 * when migrating to the official npm version.
 *
 * Original location: deobfuscated.js lines 10,202-10,204
 * Original variable name: f79
 * Export name in embedded lib: quotelessJson
 */

/**
 * Format JSON without quotes around object keys
 *
 * Converts standard JSON with quoted keys to a more readable format
 * with unquoted keys.
 *
 * @param {any} data - Data to stringify
 * @returns {string} JSON string with unquoted keys
 *
 * @example
 * const data = { name: "value", count: 5 };
 *
 * // Standard JSON.stringify:
 * // {"name":"value","count":5}
 *
 * // quotelessJson:
 * // {name:"value",count:5}
 *
 * quotelessJson(data);
 * // Returns: '{name:"value",count:5}'
 */
export const quotelessJson = (data) => {
  return JSON.stringify(data, null, 2).replace(/"([^"]+)":/g, "$1:");
};

export default quotelessJson;
