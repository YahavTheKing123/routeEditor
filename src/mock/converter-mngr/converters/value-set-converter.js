import {Logger} from '~/logger-client/index';
import {ValueSet} from '~/value-sets-client/index';
import ldsh from 'lodash';

class ValueSetConverterClass {
  convert(data, fieldMetadata) {
    let valueObj = data;
    if (!ldsh.isObject(data)) {
      valueObj = ValueSet.displayValue(fieldMetadata.concreteType, parseInt(data, 10));
      if (!valueObj && !ldsh.isObject(valueObj)) {
        Logger.warning(`No value ${data} for value set ${fieldMetadata.concreteType}`);
      }
    }
    if (valueObj && valueObj.dispName) {
      return valueObj.dispName;
    }
    return valueObj;
  }

  convertBack(type, data, format) {
    return data;
  }

}

export const ValueSetConverter = new ValueSetConverterClass();
