export function generateUniqueNameId(prefix = "", suffix = "") {
    //https://stackoverflow.com/questions/6248666/how-to-generate-short-uid-like-ax4j9z-in-js
    const _firstPart = (Math.random() * 46656) | 0;
    const _secondPart = (Math.random() * 46656) | 0;
    const firstPart = ("000" + _firstPart.toString(36)).slice(-3);
    const secondPart = ("000" + _secondPart.toString(36)).slice(-3);
    return `${prefix}${firstPart}${secondPart}${suffix}`;
  }