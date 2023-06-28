export class StringUtil {
  static trim(value: string): string {
    return value.replace(/\s/g, '');
  }

  static trimAndEqual(source: string, target: string): boolean {
    const wrappedStringSource = String(source);
    const wrappedStringTarget = String(target);

    if (this.trim(wrappedStringSource) === this.trim(wrappedStringTarget)) {
      // console.log(
      //   `source and target is equal. source: ${wrappedStringSource}, target: ${wrappedStringTarget}`,
      // );
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

  static isEqualsIgnoreCaseAny(
    targetA: string,
    ...comparedList: string[]
  ): boolean {
    for (const target of comparedList) {
      if (
        this.trimAndEqual(
          String(targetA).toUpperCase(),
          String(target).toUpperCase(),
        )
      ) {
        return true;
      }
    }
    return false;
  }
}
