import { pollConstants } from '../constants';
const { PLClr, PLErr, PLReq, PLSuc, PLTSuc, PLNSuc, PDelAtt, PUptAtt, PAddAtt, PCount } = pollConstants;
const iS = { isSuc: false, isErr: false, isL: false, list: [] };

export const PollReducer = (state = iS, action) => {
    let listTemp = state.list;

    switch (action.type) {
        case PLSuc: return { ...state, isErr: false, isSuc: true, isL: false }
        case PLReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case PLErr: return { ...state, isErr: true, isSuc: false, isL: false }
        case PLClr: return { ...state, isErr: false, isSuc: false, isL: false }
        case PLTSuc: return { ...state, isL: false, isErr: false, isSuc: true, list: action.payload };
        case PLNSuc: return { ...state, isL: false, isErr: false, isSuc: true, data: action.payload };
        case PAddAtt:

            if (listTemp && listTemp.length > 0) {
                listTemp = listTemp.concat([action.payload]);
            } else if (listTemp) {
                listTemp = [].concat([action.payload]);
            }

            return {
                ...state, list: listTemp, isL: false, isUpt: false
            };
        case PDelAtt:
            if (listTemp && listTemp.length > 0) {
                listTemp = listTemp.filter(i => i._id !== action.payload._id);
            }

            return {
                ...state, list: listTemp, isL: false
            };
        case PUptAtt:
            if (listTemp && listTemp.length > 0)
                listTemp = listTemp.map(i => {
                    if (i._id === action.payload._id) i = action.payload;
                    return i;
                });

            return {
                ...state, list: listTemp, isL: false
            };
        case PCount: return {
            ...state, count: action.payload
        } 
        default: return state;
    }
};
