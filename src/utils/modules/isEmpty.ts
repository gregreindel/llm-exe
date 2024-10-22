export function isEmpty(
    value: any
  ): value is null | undefined | string | number | boolean | object | any[] {
    if (!value && value !== 0) {
      return true;
    }
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    return false;
  }
  