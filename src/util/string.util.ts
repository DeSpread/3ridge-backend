export class StringUtil {
  static trim(value: string): string {
    return value.replace(/\s/g, '');
  }

  static trimAndEqual(targetA: string, targetB: string): boolean {
    const wrappedStringSource = String(targetA);
    const wrappedStringTarget = String(targetA);

    console.log(
      `trimAndEqual source: ${wrappedStringSource}, target: ${wrappedStringTarget}`,
    );
    if (wrappedStringSource === wrappedStringTarget) {
      console.log(
        `source: ${wrappedStringSource}, target: ${wrappedStringTarget}`,
      );
      return true;
    }

    return this.trim(targetA) === this.trim(targetB);
  }

  static isEqualsIgnoreCase(targetA: string, targetB: string): boolean {
    return this.trimAndEqual(
      String(targetA).toUpperCase(),
      String(targetB).toUpperCase(),
    );
  }
}
