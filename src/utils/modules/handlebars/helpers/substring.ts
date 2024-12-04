export function substringFn(
    this: any,
    str: any,
    start: number,
    end: number
  ) {
    if(start > end){
      return "";
    }
    if (str.length > end) {
        return str.substring(start, end);
      } else {
        return str;
      }
  }
  