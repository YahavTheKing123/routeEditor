import {BaseDateTimeBtypes} from '~/converter-mngr/converters/bTypes/DateTime/base-datetime-btypes';

class DateConverterClass extends BaseDateTimeBtypes {
  constructor() {
    super();
  }

  get schemaName() {
    return 'appX.bType.date';
  }

  get schemaUnitName() {
    return 'appX.valueSet.dateUnits';
  }

  get typeName() {
    return 'date';
  }

  _getCompType() {
    return 'date';
  }
}

export const DateConverter = new DateConverterClass();