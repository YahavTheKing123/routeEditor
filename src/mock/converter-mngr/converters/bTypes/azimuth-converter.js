import { Angle } from '@elbit/btypes';
import {BaseBType} from '~/converter-mngr/converters/bTypes/base-btypes';

class AzimuthConverterClass extends BaseBType {
  constructor() {
    super();
  }

  get schemaUnitName() {
    return 'appX.valueSet.angleUnits';
  }

  get schemaName() {
    return 'appX.bType.azimuth';
  }

  get typeName() {
    return 'azimuth';
  }

  convertByType(from, to, value) {
    return Angle.convert(from, to, value);
  }
}

export const AzimuthConverter = new AzimuthConverterClass();