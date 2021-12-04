import { Angle } from '@elbit/btypes';
import {BaseBType} from '~/converter-mngr/converters/bTypes/base-btypes';

class AngleConverterClass extends BaseBType {
  constructor() {
    super();
  }

  get schemaUnitName() {
    return 'appX.valueSet.angleUnits';
  }

  get schemaName() {
    return 'appX.bType.angle';
  }

  get typeName() {
    return 'angle';
  }

  convertByType(from, to, value) {
    return Angle.convert(from, to, value);
  }
}

export const AngleConverter = new AngleConverterClass();