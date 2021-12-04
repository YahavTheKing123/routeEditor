import {ValueSet} from '~/value-sets-client/index';
import {SchemaMngr} from '~/schemas-client/index';
import {Globals} from '~/globals-client';


export class BaseBType {
  constructor() {
    this._schema = undefined;
    this._schemaUnit = undefined;
  }

  get schema() {
    if (!this._schema) {
      this._schema = SchemaMngr.getSchemaByDescriptor({sname: this.schemaName});
      if (this._schema && this._schema.schema) {
        this._schema = this._schema.schema;
      }
    }
    return this._schema;
  }

  get schemaUnit() {
    if (!this._schemaUnit) {
      this._schemaUnit = SchemaMngr.getSchemaByDescriptor({sname: this.schemaUnitName});
      if (this._schemaUnit && this._schemaUnit.schema) {
        this._schemaUnit = this._schemaUnit.schema;
      }
    }
    return this._schemaUnit;
  }

  get userPreference() {
    const userPref = Globals.get().clientFacade.getContextValue('appX', 'userPreference');
    if (userPref && userPref.appX && userPref.appX.userPreference) {
      return userPref.appX.userPreference;
    }
    return undefined;
  }

  convertByType(from, to, value) {
    throw String('You have to implement convertByType');
  }

  get schemaUnitName() {
    throw String('You have to implement schemaUnitName');
  }

  get schemaName() {
    throw String('You have to implement schemaName');
  }

  get typeName() {
    throw String('You have to implement typeName');
  }

  convert(value, fieldMetadata) {
    let valueConvert = value;
    if (value) {
      const unit = this._getUnit(fieldMetadata);
      valueConvert = this.convertByType(this.schema.defaultValue, unit, value);

      //for example 20=>20.00, 5.232=>5.23 return parseFloat(Math.round(valueConvert * 100) / 100).toFixed(precision);
      const precision = this._getPrecision(fieldMetadata);
      valueConvert = parseFloat(Math.round(valueConvert * Math.pow(10, precision)) /Math.pow(10,precision)).toFixed(precision);

      //needed for readonly components such as summary and card
      // in case the label is hidden we must provide the units next to the value
      if (fieldMetadata.hideLabel) {
        valueConvert = `${valueConvert} ${this._getShortName({unit})}`;
      }
    }
    return valueConvert;
  }

  convertBack(data, fieldMetadata) {
    const unit = this._getUnit(fieldMetadata);
    const valueConvert = this.convertByType(unit, this.schema.defaultValue, data);

    const concreteType = this._getConcreteType();
    if(concreteType && concreteType.toLowerCase() !== typeof valueConvert ){
      if(concreteType.toLowerCase() === 'number'){
        return Number(valueConvert);
      }
    }
    return valueConvert;
  }

  buildBtypeMembers(field) {
    if (field !== undefined) {
      //first get unit
      field.unit = this._getUnit(field);
      field.regexFormat = this._getFormat(field);
      if (field.value) {
        field.value = this.convert(field.value, field);
      }
      field.label = this._getLabel(field);
      field.min = this._getMinValue(field);
      field.max = this._getMaxValue(field);
      field.compType = this._getCompType();
    }
    return field;
  }

  validate(value, field) {
    if (field.mask && value && !value.toString().match(field.mask)){
      return false;
    }
    return true;
  }

  regexValidate(value, field) {
    if (field.regex && value && !value.toString().match(field.regex)){
      return false;
    }
    return true;
  }

  _getConcreteType() {
    return this.schema && this.schema.concreteType
  }

  _getCompType() {
    if (this.schema) {
      return this.schema.concreteType;
    }
    return undefined;
  }

  _getUnit(data) {
    let displayUnit = null;
    if (data) {
      displayUnit = data.displayUnit;
    }
    let unit = this.schema.units.defaultValue;
    if (displayUnit) {
      unit = displayUnit;
    } else if (this.userPreference && this.userPreference[this.typeName]) {
      unit = this.userPreference[this.typeName];
    }
    return unit;
  }

  _getLabel({label, unit}) {
    const shortName = this._getShortName({unit});
    if (shortName) {
      return `${label} (${shortName})`;
    }
    return label;
  }

  _getShortName({unit}) {
    if (this.schemaUnitName) {
      const unitLiteral = ValueSet.displayValue({sname: this.schemaUnitName} , unit);
      return unitLiteral && unitLiteral.shortName;
    }
    return undefined;
  }

  _getPrecision({regexFormat}) {
    if (!regexFormat) {
      return 0;
    }
    const res = regexFormat.split('.');
    if (res.length === 2) {
      return res[1].length;
    }
    return 0;
  }

  _getMinValue({min, unit}) {
    if (min) {
      return this.convertByType(0, unit, min);
    }
    if (this.schema && this.schema.constraints && this.schema.constraints.min) {
      return this.convertByType(0, unit, this.schema.constraints.min);
    }
    return undefined;
  }

  _getMaxValue({max, unit}) {
    if (max) {
      return this.convertByType(0, unit, max);
    }
    if (this.schema && this.schema.constraints && this.schema.constraints.max) {
      return this.convertByType(0, unit, this.schema.constraints.max);
    }

    return undefined;
  }

  _getFormat(field) {
    if (field.format) {
      return field.format;
    }
    if (!field.unit) {
      field.unit = this._getUnit(field);
    }
    const unitLiteral = Object.values(ValueSet.getLiterals({sname: this.schemaUnitName})).filter(literal => literal.code === field.unit);
    if (unitLiteral && unitLiteral.length > 0) {
      return unitLiteral[0].format;
    }
    return undefined;
  }
}