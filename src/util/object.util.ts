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

  static isAnyNull(...args: any[]) {
    for (const value of args) {
      if (this.isNull(value)) {
        return true;
      }
    }
  }
}
