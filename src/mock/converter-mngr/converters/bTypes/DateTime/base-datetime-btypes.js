import {BaseBType} from '~/converter-mngr/converters/bTypes/base-btypes';
import moment from 'moment/moment';

import {NatoFormat} from './nato-format'

export class BaseDateTimeBtypes extends BaseBType {
  constructor() {
    super();

  }

  convert(value, fieldMetadata) {
    let date = value;
    if (typeof value === 'number') {
      const format = this._getFormat(fieldMetadata);
      date = moment(date).format(format);
      date = NatoFormat._convert(value, date);
    }
    return date;
  }

  convertBack(value, fieldMetadata) {
    let converterValue = value;
    if (typeof value !== 'number') {
      const format = this._getFormat(fieldMetadata);
      value = NatoFormat._convertBack(value);
      converterValue = moment(value, format).valueOf();
    }
    return converterValue;
  }

  validate(value, field) {
    let validValue = value;
    const format = this._getFormat(field);
    if (typeof validValue === 'number') {
      validValue = moment(validValue).format(format);
    }
    validValue = NatoFormat._convertBack(validValue);
    const date = moment(validValue, format, true);
    if (date._isValid || !validValue) {
      return true;
    }
    return false;
  }

  regexValidate(value, field) {
    return this.validate(value, field);
  }
}
