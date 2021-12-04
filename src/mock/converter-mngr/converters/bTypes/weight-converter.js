import { Weight } from '@elbit/btypes';
import {BaseBType} from '~/converter-mngr/converters/bTypes/base-btypes';

class WeightConverterClass extends BaseBType {
  constructor() {
    super();
  }

  get schemaUnitName() {
    return 'appX.valueSet.weightUnits';
  }

  get schemaName() {
    return 'appX.bType.weight';
  }

  get typeName() {
    return 'weight';
  }

  convertByType(from, to, value) {
    return Weight.convert(from, to, value);
  }

}

export const WeightConverter = new WeightConverterClass();