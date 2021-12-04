import {BaseDateTimeBtypes} from '~/converter-mngr/converters/bTypes/DateTime/base-datetime-btypes';

class TimeConverterClass extends BaseDateTimeBtypes {
  constructor() {
    super();
  }

  get schemaName() {
    return 'appX.bType.timeSpan';
  }

  get schemaUnitName() {
    return 'appX.valueSet.timeSpanUnits';
  }

  get typeName() {
    return 'timeSpan';
  }

  _getCompType() {
    return 'time';
  }

}

export const TimeConverter = new TimeConverterClass();