import { Temperature } from '@elbit/btypes';
import {BaseBType} from '~/converter-mngr/converters/bTypes/base-btypes';

class TemperatureConverterClass extends BaseBType {
  constructor() {
    super();
  }

  get schemaUnitName() {
    return 'appX.valueSet.temperatureUnits';
  }

  get schemaName() {
    return 'appX.bType.temperature';
  }

  get typeName() {
    return 'temperature';
  }

  convertByType(from, to, value) {
    return Temperature.convert(from, to, value);
  }

}

export const TemperatureConverter = new TemperatureConverterClass();