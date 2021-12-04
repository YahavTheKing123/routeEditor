
class NatoFormatClasses {
  NATO_FORMAT = {
    '1': 'A',
    '2': 'B',
    '3': 'C',
    '4': 'D',
    '5': 'E',
    '6': 'F',
    '7': 'G',
    '8': 'H',
    '9': 'I',
    '10': 'K',
    '11': 'L',
    '12': 'M',
    '-1': 'N',
    '-2': 'O',
    '-3': 'P',
    '-4': 'Q',
    '-5': 'R',
    '-6': 'S',
    '-7': 'T',
    '-8': 'U',
    '-9': 'V',
    '-10': 'W',
    '-11': 'X',
    '-12': 'Y',
  };

  _convert(dateNumber, dateFormat) {
    const date = new Date(dateNumber);
    const timezone = -date.getTimezoneOffset() / 60;
    const Z = this.NATO_FORMAT[timezone];
    return dateFormat.replace('$', Z);
  }

  _convertBack(date) {
    return (typeof date === 'string') && date.replace(/\([A-Z]\)/g, '($)');
  }
}

export const NatoFormat = new NatoFormatClasses();