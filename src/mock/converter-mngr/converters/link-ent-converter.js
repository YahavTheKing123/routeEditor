
class LinkEntConverterClass {

  convert(entity) {
    let displayData = '';
    if (entity) {
      displayData = entity.dispName;
    }

    return displayData;
  }

  convertBack(type, data, format) {
    return data;
  }


}

export const LinkEntConverter = new LinkEntConverterClass();
