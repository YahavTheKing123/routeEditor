import i18next from 'i18next';

class BooleanConverterClass {

  convert(value) {
    let displayData = '';
    if (value !== undefined && value.toString() !== '') {
      displayData = i18next.t(value.toString());
    }

    return displayData;
  }

  convertBack(type, data, format) {
    return data;
  }
}

export const BooleanConverter = new BooleanConverterClass();
