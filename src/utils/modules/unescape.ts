export function unescape(str: string): string {
    const map: { [key: string]: string } = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
    };
  
    const entityRegex = /&amp;|&lt;|&gt;|&quot;|&#39;/g;
  
    return str.replace(entityRegex, (m) => map[m]);
  }