import { projectConstants } from '../constants';
const { PLSuc, PClr, PErr, PReq, PSuc, POISuc, PAddAtt, PDelAtt, PUptAtt } = projectConstants;
const iS = { isSuc: false, isErr: false, isL: false, isUpt: false };

export const ProjectReducer = (state = iS, action) => {
    let listTemp = state.list;

    switch (action.type) {
        case PSuc: return { ...state, isErr: false, isSuc: true, isL: false }
        case PReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case PErr: return { ...state, isErr: true, isSuc: false, isL: false}
        case PClr: return { ...state, isErr: false, isSuc: false, isL: false }
        case PLSuc: return { ...state, list: action.payload };
        case POISuc: return { ...state, data: action.payload };
        case PDelAtt:

            if (listTemp && listTemp.data && listTemp.data.length > 0) {
                listTemp.data = listTemp.data.filter(i => i._id !== action.payload._id);
                listTemp.count = listTemp.data.length;
            }   
            return {
                ...state, list: listTemp, isL: false
            };

        case PUptAtt:
            if (listTemp && listTemp.data && listTemp.data.length > 0)
                listTemp.data = listTemp.data.map(i => {
                    if (i._id === action.payload._id) i = action.payload;
                    return i;
                });

            return {
                ...state, list: listTemp, isL: false
            };

        case PAddAtt:

            if (listTemp && listTemp.data && listTemp.data.length > 0) {
                listTemp.data = listTemp.data.concat([action.payload]);
                listTemp.count = listTemp.data.length;
            } else if (listTemp) {
                listTemp.data = [].concat([action.payload]);
                listTemp.count = 1;
            }

            return {
                ...state, list: listTemp, isL: false, isUpt: false
            };
        default: return state;
    }
}