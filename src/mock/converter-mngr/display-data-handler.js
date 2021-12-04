import {Resources} from '~/resource-mngr-client';
import {Enum} from '~/enums-client';
import {Constant} from '~/consts';
import {DistanceConverter} from '~/converter-mngr/converters/bTypes/distance-converter';
import {LinkEntConverter} from '~/converter-mngr/converters/link-ent-converter';
import {MultiEntConverter} from '~/converter-mngr/converters/multi-ent-converter';
import {BooleanConverter} from '~/converter-mngr/converters/boolean-converter';
import {PositionConverter} from '~/converter-mngr/converters/position-converter';
import {ValueSetConverter} from '~/converter-mngr/converters/value-set-converter';
import {FrequencyConverter} from '~/converter-mngr/converters/bTypes/frequency-converter';
import {TemperatureConverter} from '~/converter-mngr/converters/bTypes/temperature-converter';
import {SpeedConverter} from '~/converter-mngr/converters/bTypes/speed-converter';
import {AngleConverter} from '~/converter-mngr/converters/bTypes/angle-converter';
import {VolumeConverter} from '~/converter-mngr/converters/bTypes/volume-converter';
import {WeightConverter} from '~/converter-mngr/converters/bTypes/weight-converter';
import {RegexBuilder} from '~/converter-mngr/regex-builder';
import {MultiValueSetConverter} from '~/converter-mngr/converters/multi-value-set-converter';
import {AzimuthConverter} from "~/converter-mngr/converters/bTypes/azimuth-converter";
import {ElevationConverter} from "~/converter-mngr/converters/bTypes/elevation-converter";
import {DateTimeConverter} from "~/converter-mngr/converters/bTypes/DateTime/datetime-converter";
import {DateConverter} from "~/converter-mngr/converters/bTypes/DateTime/date-converter";
import {TimeConverter} from "~/converter-mngr/converters/bTypes/DateTime/time-converter";

export class DisplayDataHandlerClass {

  parse({type, data, fieldMetadata}) {
    let displayData = '';

    if (data !== undefined && data !== null && data.toString() !== '') {
      type = type ? type.toLowerCase() : fieldMetadata && fieldMetadata.type ? fieldMetadata.type.toLowerCase() : undefined;
      switch (type) {
        case Enum.fieldType.valueSet:
          displayData = ValueSetConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.multiValueSet: {
          displayData = MultiValueSetConverter.convert(data, fieldMetadata);
          break;
        }
        case Enum.fieldType.linkEntity:
          displayData = LinkEntConverter.convert(data);
          break;
        case Enum.fieldType.multiLinkEntity:
          displayData = MultiEntConverter.convert(data);
          break;
        case Enum.fieldType.boolean:
          displayData = BooleanConverter.convert(data);
          break;
        case Enum.fieldType.string:
          if (fieldMetadata.fieldName === Constant.ServerAPI.SCHEMA.ICON_URI) {
            displayData = Resources.getIconURI(data);
          } else {
            displayData = data;
          }
          break;
        case Enum.fieldType.position:
          displayData = PositionConverter.convert(type, data);
          break;
        case Enum.fieldType.distance:
          displayData = DistanceConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.frequency:
          displayData = FrequencyConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.temperature:
          displayData = TemperatureConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.speed:
          displayData = SpeedConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.angle:
          displayData = AngleConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.azimuth:
          displayData = AzimuthConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.elevation:
          displayData = ElevationConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.volume:
          displayData = VolumeConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.weight:
          displayData = WeightConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.dateTime:
          displayData = DateTimeConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.date:
          displayData = DateConverter.convert(data, fieldMetadata);
          break;
        case Enum.fieldType.timeSpan:
          displayData = TimeConverter.convert(data, fieldMetadata);
          break;
        default:
          displayData = data;
          break;
      }
    }
    return displayData;
  }

  parseBack({type, data, fieldMetadata}) {
    let valueParse = data;

    if (data !== undefined && data !== null && data.toString() !== '' && fieldMetadata) {
      const fieldType = type !== undefined ? type.toLowerCase() : fieldMetadata && fieldMetadata.type ? fieldMetadata.type.toLowerCase() : undefined;
      switch (fieldType) {
        case Enum.fieldType.distance:
          valueParse = DistanceConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.frequency:
          valueParse = FrequencyConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.temperature:
          valueParse = TemperatureConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.speed:
          valueParse = SpeedConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.angle:
          valueParse = AngleConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.azimuth:
          valueParse = AzimuthConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.elevation:
          valueParse = ElevationConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.volume:
          valueParse = VolumeConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.weight:
          valueParse = WeightConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.dateTime:
          valueParse = DateTimeConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.date:
          valueParse = DateConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.timeSpan:
          valueParse = TimeConverter.convertBack(data, fieldMetadata);
          break;
        case Enum.fieldType.position:
          valueParse = PositionConverter.convertBack(type, data, fieldMetadata.format);
          break;
        case Enum.fieldType.number:
          valueParse = Number.parseFloat(data);
          break;
        case Enum.fieldType.tags:
          if (data.length === 0) {
            valueParse = null;
          }
          break;
        default:
          valueParse = data;
          break;

      }
    }
    return valueParse;
  }

  buildBtypeMembers(field, type) {
    type = ((type && type.toLowerCase()) || (field && field.type && field.type.toLowerCase()));
    switch (type) {
      case Enum.fieldType.distance:
        field = DistanceConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.frequency:
        field = FrequencyConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.temperature:
        field = TemperatureConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.speed:
        field = SpeedConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.angle:
        field = AngleConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.elevation:
        field = ElevationConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.azimuth:
        field = AzimuthConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.volume:
        field = VolumeConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.weight:
        field = WeightConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.dateTime:
        field = DateTimeConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.date:
        field = DateConverter.buildBtypeMembers(field);
        break;
      case Enum.fieldType.timeSpan:
        field = TimeConverter.buildBtypeMembers(field);
        break;
      default:
        field = field;
        break;
    }
    //TODO remove it when rechange position type
    if (type !== Enum.fieldType.position) {
      field.mask = RegexBuilder.buildMask(field);
      field.regex = RegexBuilder.buildRegex(field);
    }

    return field;
  }

  validate(value, field) {
    let isValid = true;
    const type = field && field.type ? field.type.toLowerCase() : undefined;
    switch (type) {
      case Enum.fieldType.distance:
        isValid = DistanceConverter.validate(value, field);
        break;
      case Enum.fieldType.frequency:
        isValid = FrequencyConverter.validate(value, field);
        break;
      case Enum.fieldType.temperature:
        isValid = TemperatureConverter.validate(value, field);
        break;
      case Enum.fieldType.speed:
        isValid = SpeedConverter.validate(value, field);
        break;
      case Enum.fieldType.angle:
        isValid = AngleConverter.validate(value, field);
        break;
      case Enum.fieldType.elevation:
        isValid = ElevationConverter.validate(value, field);
        break;
      case Enum.fieldType.azimuth:
        isValid = AzimuthConverter.validate(value, field);
        break;
      case Enum.fieldType.volume:
        isValid = VolumeConverter.validate(value, field);
        break;
      case Enum.fieldType.weight:
        isValid = WeightConverter.validate(value, field);
        break;
      case Enum.fieldType.dateTime:
        isValid = DateTimeConverter.validate(value, field);
        break;
      case Enum.fieldType.date:
        isValid = DateConverter.validate(value, field);
        break;
      case Enum.fieldType.timeSpan:
        isValid = TimeConverter.validate(value, field);
        break;
      default:
        if (field.mask && value && !value.toString().match(field.mask)) {
          return false;
        }
        return true;
    }

    return isValid;
  }

  regexValidate(value, field){
    let isValid = true;
    const type = field && field.type ? field.type.toLowerCase() : undefined;
    switch (type) {
      case Enum.fieldType.distance:
        isValid = DistanceConverter.regexValidate(value, field);
        break;
      case Enum.fieldType.frequency:
        isValid = FrequencyConverter.regexValidate(value,field);
        break;
      case Enum.fieldType.temperature:
        isValid = TemperatureConverter.regexValidate(value, field);
        break;
      case Enum.fieldType.speed:
        isValid = SpeedConverter.regexValidate(value, field);
        break;
      case Enum.fieldType.angle:
        isValid = AngleConverter.regexValidate(value, field);
        break;
      case Enum.fieldType.elevation:
        isValid = ElevationConverter.regexValidate(value, field);
        break;
      case Enum.fieldType.azimuth:
        isValid = AzimuthConverter.regexValidate(value, field);
        break;
      case Enum.fieldType.volume:
        isValid = VolumeConverter.regexValidate(value,field);
        break;
      case Enum.fieldType.weight:
        isValid = WeightConverter.regexValidate(value, field);
        break;
      case Enum.fieldType.dateTime:
        isValid = DateTimeConverter.regexValidate(value, field);
        break;
      case Enum.fieldType.date:
        isValid = DateConverter.regexValidate(value, field);
        break;
      case Enum.fieldType.timeSpan:
        isValid = TimeConverter.regexValidate(value, field);
        break;
      default:
        if (field.regex && value && !value.toString().match(field.regex)) {
          return false;
        }
        return true;
    }

    return isValid;
  }

  checkIsBTypes(type) {
    return type === Enum.fieldType.distance ||
      type === Enum.fieldType.frequency ||
      type === Enum.fieldType.temperature ||
      type === Enum.fieldType.speed ||
      type === Enum.fieldType.angle ||
      type === Enum.fieldType.azimuth ||
      type === Enum.fieldType.elevation ||
      type === Enum.fieldType.volume ||
      type === Enum.fieldType.weight ||
      type === Enum.fieldType.dateTime ||
      type === Enum.fieldType.date ||
      type === Enum.fieldType.timeSpan;
  }

  buildMetaDataForBtypes(field, fieldSchema) {
    if (field) {
      fieldSchema.min = field.min ? field.min : fieldSchema.min;
      fieldSchema.max = field.max ? field.max : fieldSchema.max;
      fieldSchema.unit = field.unit ? field.unit : fieldSchema.unit;
      fieldSchema.regexFormat = field.regexFormat ? field.regexFormat : fieldSchema.regexFormat;
    }
    return fieldSchema;
  }
}

export const DisplayDataHandler = new DisplayDataHandlerClass();