import { Angle } from '@elbit/btypes';
import {BaseBType} from '~/converter-mngr/converters/bTypes/base-btypes';

class ElevationConverterClass extends BaseBType {
  constructor() {
    super();
  }

  get schemaUnitName() {
    return 'appX.valueSet.angleUnits';
  }

  get schemaName() {
    return 'appX.bType.elevation';
  }

  get typeName() {
    return 'elevation';
  }

  convertByType(from, to, value) {
    return Angle.convert(from, to, value);
  }
}

export const ElevationConverter = new ElevationConverterClass();