export class StringUtil {
  static trim(value: string): string {
    return value.replace(/\s/g, '');
  }

  static trimAndEqual(source: string, target: string): boolean {
    const wrappedStringSource = String(source);
    const wrappedStringTarget = String(target);

    console.log(
      `check if equal string source: ${wrappedStringSource}, target: ${wrappedStringTarget}`,
    );
    if (this.trim(wrappedStringSource) === this.trim(wrappedStringTarget)) {
      console.log(
        `source and target is equal. source: ${wrappedStringSource}, target: ${wrappedStringTarget}`,
      );
      return true;
    }

    return false;
  }

  static isEqualsIgnoreCase(targetA: string, targetB: string): boolean {
    return this.trimAndEqual(
      String(targetA).toUpperCase(),
      String(targetB).toUpperCase(),
    );
  }
}
