import { Volume } from '@elbit/btypes';
import {BaseBType} from '~/converter-mngr/converters/bTypes/base-btypes';

class VolumeConverterClass extends BaseBType {
  constructor() {
    super();
  }

  get schemaUnitName() {
    return 'appX.valueSet.volumeUnits';
  }

  get schemaName() {
    return 'appX.bType.volume';
  }

  get typeName() {
    return 'volume';
  }

  convertByType(from, to, value) {
    return Volume.convert(from, to, value);
  }

}

export const VolumeConverter = new VolumeConverterClass();