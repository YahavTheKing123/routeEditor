// import { UserPreferenceMngr } from './user-preference';
// import { DisplayDataHandler } from './display-data-handler';


const UserPreferenceMngr = {};

const DisplayDataHandler = {
    buildBtypeMembers: (obj) => {
        return {shortName: 'm'}
    }, 
    parse: (obj) => {
        return obj.data;
    }
}

export { UserPreferenceMngr,  DisplayDataHandler };
