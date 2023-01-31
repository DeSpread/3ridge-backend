export class StringUtil {
  static trim(value: string): string {
    return value.replace(/\s/g, '');
  }

  static trimAndEqual(targetA: string, targetB: string): boolean {
    console.log(`trimAndEqual: ${targetA} / ${targetB}`);
    if (targetA === targetB) {
      return true;
    }

    return this.trim(targetA) === this.trim(targetB);
  }
}
