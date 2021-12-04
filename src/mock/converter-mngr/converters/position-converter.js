import {LightMapMngr} from '~/map';
import i18next from 'i18next';
import {Constant} from "~/consts";
import {RESTResultsUtil} from "~/utilities";
const {geo} = require('@elbit/js-geo');

class PositionConverterClass {
    constructor() {

    }

    convert(type, data, format) {
        let val = "";
        // In case we recieve a string, it represents a hashed object position that should be extracted using getPosition
        if ((typeof data) === "string") {
            if (data && data.indexOf(':') === -1 && data.indexOf('coordinates') === -1) { //if its base64 location string and not already converted value
                data = geo.serializer.getPosition(data, geo.returnTypeEnum.customGeoObject);
                // We receive an object from get position that contains a coordinate and a function name get center
                // we want the function result because only after invoking it we get the point we want
                data = data.getCenter();
            } else {
                return data;
            }
        }
        // Now the point data is in a format {longitude, altitude}
        if (data) {
            data = (data && typeof data.getCenter === 'function') ? data.getCenter() : data;
            const errMsg = this.verifyPoint(data);
            if (!errMsg) {

                if (!this.positionDisplay) {
                    // Temporary code till position display code will be re-written
                    this.positionDisplay = "GEO";
                    this.distanceUnit = 'm';
                    const config = RESTResultsUtil.getRESTResults(Constant.ServerAPI.GRAPH_QL.CONFIG);
                    if (config) {
                        if (config.positionDisplay &&
                            (config.positionDisplay === "UTM" ||
                                config.positionDisplay === "SHORT_UTM" ||
                                config.positionDisplay === "MGRS")) {
                            this.positionDisplay = config.positionDisplay;
                        }
                        if (config.isRightToLeft) {
                            this.distanceUnit = 'מ';
                        }
                    }
                }

                let height = data.altitude;
                if (height === undefined && LightMapMngr && LightMapMngr.instance && LightMapMngr.instance.mapMngr && LightMapMngr.instance.mapMngr.mapContainer) {
                    height = LightMapMngr.instance.mapMngr.mapContainer.getPositionHeight(data.longitude, data.latitude);
                }
                if (height !== undefined) {
                    height = Math.round(height);
                }
                if (this.positionDisplay) {
                    if (this.positionDisplay === "SHORT_UTM") {
                        const res = geo.geographicCalculations.convertGeoToUtm([data.longitude, data.latitude, 0], geo.datums.WGS84, geo.datums.WGS84);
                        const lonWithoutFirstDigit = res[1] ? res[1].toFixed(0).slice(1) : 0;

                        if (height !== undefined && height !== "**") {
                            val = `${lonWithoutFirstDigit} : ${res[0] ? res[0].toFixed(0) : 0} | ${height}` + " " + this.distanceUnit;
                        } else {
                            val = `${lonWithoutFirstDigit} : ${res[0] ? res[0].toFixed(0) : 0} | ** `;
                        }
                    } else if (this.positionDisplay === "MGRS") {
                        const mgrs = geo.coordSysConvertor.convertGeoToMgrs(new geo.coordinate(data.longitude, data.latitude));
                        if (mgrs != null) {
                            val = mgrs.zone + " " + mgrs.band + " " + mgrs.squareFirst + mgrs.squareSecond + " "
                                + (mgrs.longitude ? mgrs.longitude.toFixed(0) : 0) + " : " + (mgrs.latitude ? mgrs.latitude.toFixed(0) : 0) +  ` | ${height} ` + " " + this.distanceUnit;
                        } else {
                            val = " ";
                        }
                    }
                }
            } else {
                console.warn(errMsg);
            }
        }

        return val;
    }

  convertBack(type, data, format) {
    let ret = data;
    if (format === 'UTM' && typeof data === 'string' ) {
      try {
        let lon = parseInt('3' + data.split(':')[0]);
        let lat = parseInt(data.split(':')[1]);
        ret = geo.geographicCalculations.convertUtmToGeo([lat, lon, 0], geo.datums.WGS84, geo.datums.WGS84);
      }
      catch (exp) {
        console.log(exp);
      }
    }
    return ret;
  }

    verifyPoint(data) {
        let errMsg;
        if(!data) {
            errMsg = "The geo point was given is undefined";
            return errMsg;
        }
        if(!data.longitude) {
            errMsg = "The given object of point must contain longitude property";
            return errMsg;
        }
        if(!data.latitude) {
            errMsg = "The given object of point must contain latitude property";
            return errMsg;
        }
        /*if(!data.altitude) {
          errMsg = "The given object of point must contain altitude property";
          return errMsg;
        }*/

        return errMsg;

    }
}


export var PositionConverter = new PositionConverterClass();
