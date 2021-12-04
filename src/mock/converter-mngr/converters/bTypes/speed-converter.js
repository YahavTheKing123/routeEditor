import { Speed } from '@elbit/btypes';
import {BaseBType} from '~/converter-mngr/converters/bTypes/base-btypes';

class SpeedConverterClass extends BaseBType {
  constructor() {
    super();
  }

  get schemaUnitName() {
    return 'appX.valueSet.speedUnits';
  }

  get schemaName() {
    return 'appX.bType.speed';
  }

  get typeName() {
    return 'speed';
  }

  convertByType(from, to, value) {
    return Speed.convert(from, to, value);
  }

}

export const SpeedConverter = new SpeedConverterClass();