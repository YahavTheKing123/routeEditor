import {LinkEntConverter} from '~/converter-mngr/converters/link-ent-converter';

class MultiEntConverterClass {

  convert(entities) {
    let displayData = entities;
    if (Array.isArray(entities)) {
      displayData = entities.map(entity => {
        return LinkEntConverter.convert(entity);
      }).join(', ');
    }
    return displayData;
  }

  convertBack(type, data, format) {
    return data;
  }
}

export const MultiEntConverter = new MultiEntConverterClass();
