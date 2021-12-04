import ldsh from 'lodash';
import {Logger} from '~/logger-client';
import {ValueSet} from '~/value-sets-client';

class MultiValueSetConverterClass {

  convert(valueSet, fieldMetadata) {

    let displayData = valueSet;
    if (Array.isArray(valueSet)) {
      displayData = valueSet.map(value => {
        return this._getValueSetDisplay(value, fieldMetadata);
      }).join(', ');
    } else if (Number.isInteger(valueSet)) {
      // When we get default value which is untouched, the valueset values will be a single number and not an array
      displayData = this._getValueSetDisplay(valueSet, fieldMetadata);
    }
    return displayData;

  }

  convertBack(type, data, format) {
    return data;
  }

  _getValueSetDisplay(value, fieldMetadata) {
    let displayData = '';
    let valueObj;
    if (!ldsh.isObject(value)) {
      valueObj = ValueSet.displayValue(fieldMetadata.concreteType, parseInt(value, 10));
      if (!valueObj && !ldsh.isObject(valueObj)) {
        Logger.warning(`No value ${valueObj} for value set ${fieldMetadata.concreteType}`);
      }
    }
    if (valueObj && valueObj.dispName) {
      displayData = valueObj.dispName;
    }

    return displayData;
  }
}

export const MultiValueSetConverter = new MultiValueSetConverterClass();
