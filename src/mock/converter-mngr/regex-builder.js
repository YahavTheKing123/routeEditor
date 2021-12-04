class RegexBuilderClass {

  DEFAULT_REGEX = {
    number: '^([-]?[0-9]*)?$',
    UTM: '^[0-9]{6} : [0-9]{6}',
  };

  buildMask(field) {
    const regexType = field.compType ? field.compType.toLowerCase() : field.type;
    if(field.regexFormat){
      return this._buildMask(field);
    }
    return this.DEFAULT_REGEX[regexType];
  }

  buildRegex(field) {
    const regexType = field.compType ? field.compType.toLowerCase() : field.type;
    if(field.regexFormat){
      return this._buildRegex(field);
    }
    return this.DEFAULT_REGEX[regexType];
  }

  /**
   * Number & string validation for the whole value
   * @param regexFormat - format as given from schema
   * @param min - minValue
   * @returns {*}
   * @private
   */
  _buildRegex({regexFormat, min}) {
    return regexFormat.replace(/\./g, '\\.')
      .replace(/\,/g, '\\,')
      .replace(/\:/g, '\\:')
      .replace(/\-/g, '\\-')
      .replace(/0/g, `${min < 0 ? '[-]?' : ''}[0-9]`)
      .replace(/X/g, `${min < 0 ? '[-]?' : ''}[0-9]*`);
  }

  /**
   * Number & string validation on key change
   * @param regexFormat - format as given from schema
   * @param min - minValue
   * @returns {string}
   * @private
   */
  _buildMask({regexFormat, min}) {
    return '^('
      + regexFormat.replace(/\./g, '(\\.)?')
        .replace(/\,/g, '(\\,)?')
        .replace(/\:/g, '(\\:)?')
        .replace(/\-/g, '(\\-)?')
        .replace(/0/g, `(${min < 0 ? '[-]?' : ''}[0-9])?`)
        .replace(/X/g, `(${min < 0 ? '[-]?' : ''}[0-9]*)?`)
    + ')?$';
  }

}

export const RegexBuilder = new RegexBuilderClass();