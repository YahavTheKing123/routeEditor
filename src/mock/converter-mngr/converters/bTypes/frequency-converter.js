import { Frequency } from '@elbit/btypes';
import {BaseBType} from '~/converter-mngr/converters/bTypes/base-btypes';

class FrequencyConverterClass extends BaseBType {
  constructor() {
    super();
  }

  get schemaUnitName() {
    return 'appX.valueSet.frequencyUnits';
  }

  get schemaName() {
    return 'appX.bType.frequency';
  }

  get typeName() {
    return 'frequency';
  }

  convertByType(from, to, value) {
    return Frequency.convert(from, to, value);
  }

}

export const FrequencyConverter = new FrequencyConverterClass();