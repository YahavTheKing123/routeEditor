import {SID} from '@elbit/ids-generator';

import {EntitiesMngr} from '~/entities-client';
import {Hooks} from '~/hooks-client';
import {Globals} from "~/globals-client";
import {RESTResultsUtil} from "~/utilities";
import {Constant} from "~/consts";

class UserPreference {

  constructor() {
     this._userPreferenceEntity;
  }


  async init() {
    await this.getEntity();
    await Globals.get().clientFacade.setSettingsContext({id : this._userPreferenceEntity._id}, this._userPreferenceEntity, [this._userPreferenceEntity])
  }

  getEntity() {
    let userSname = 'appX.entity.userPreference'
    const config = RESTResultsUtil.getRESTResults(Constant.ServerAPI.GRAPH_QL.CONFIG);
    if (config &&  config.hasOwnProperty('userPreferenceSname')) {
      userSname = config.userPreferenceSname;
    }
    let stationId = Globals.get().clientFacade.getContextValue('appX', 'userPrefId');

    return new Promise((resolve, reject) => {
      EntitiesMngr.getEntities({'sid': SID.getSID(userSname), 'appX.userPreference.stationId':stationId}).then((entities) => {
        if (!entities || entities.length === 0) {
          Hooks.createWithDefaultValues(SID.getSID(userSname), undefined, undefined, true, {}).then(createdEntity => {
            createdEntity.appX.userPreference.stationId = stationId;
            EntitiesMngr.createEntity(createdEntity);
            this._userPreferenceEntity = createdEntity;
            resolve(this._userPreferenceEntity);
          });
        } else {
          this._userPreferenceEntity = entities[0];
          resolve(this._userPreferenceEntity);
        }

      });
    });


  }



}

export var UserPreferenceMngr = new UserPreference();