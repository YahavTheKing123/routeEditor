import {BaseDateTimeBtypes} from '~/converter-mngr/converters/bTypes/DateTime/base-datetime-btypes';

class DateTimeConverterClass extends BaseDateTimeBtypes {
  constructor() {
    super();
  }

  get schemaName() {
    return 'appX.bType.dateTime';
  }

  get schemaUnitName() {
    return 'appX.valueSet.dateTimeUnits';
  }

  get typeName() {
    return 'dateTime';
  }

  _getCompType() {
    return 'datetime';
  }
}

export const DateTimeConverter = new DateTimeConverterClass();