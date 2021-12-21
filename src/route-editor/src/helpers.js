import {XHRUtil} from '~/utilities/xhr-util';

export function executeRestCall(path, body) {
    return new Promise((resolve,reject) => {
        XHRUtil.sendJsonPostRequest({
            route: path,
            body: body,
            callback: (error, results) => {
                if (error == null && results.body) {
                    resolve(results.body);
                } else {
                    reject(`error from executeRestQuery ${error}`);
                }
            }
        });
    });
}