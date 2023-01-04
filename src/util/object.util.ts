export class ObjectUtil {
  static isNull(value: any) {
    if (value == null) {
      return true;
    }

    if (value === null) {
      return true;
    }

    if (value === 'undefined') {
      return true;
    }

    return false;
  }
}
