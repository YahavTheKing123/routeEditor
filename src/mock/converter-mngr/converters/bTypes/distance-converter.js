import { Distance } from '@elbit/btypes';
import {BaseBType} from '~/converter-mngr/converters/bTypes/base-btypes';

class DistanceConverterClass extends BaseBType {
  constructor() {
    super();
  }

  get schemaUnitName() {
    return 'appX.valueSet.distanceUnits';
  }

  get schemaName() {
    return 'appX.bType.distance';
  }

  get typeName() {
    return 'distance';
  }

  convertByType(from, to, value) {
    return Distance.convert(from, to, value);
  }
}

export const DistanceConverter = new DistanceConverterClass();