export class StringUtil {
  static trim(value: string): string {
    return value.replace(/\s/g, '');
  }

  static trimAndEqual(targetA: string, targetB: string): boolean {
    return this.trim(targetA) === this.trim(targetB);
  }
}
