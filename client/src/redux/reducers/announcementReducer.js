import { ancConstants } from '../constants';
const { ANCAddAtt, ANCClr, ANCDelAtt, ANCErr, ANCReq, ANCSuc, ANCUptAtt, ANCLSuc } = ancConstants;
const iS = { isSuc: false, isErr: false, isL: false, isUpt: false };

export const AnncReducer = (state = iS, action) => {
    let listTemp = state.list;

    switch (action.type) {
        case ANCSuc: return { ...state, isErr: false, isSuc: true, isL: false, data: action.payload }
        case ANCReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case ANCErr: return { ...state, isErr: true, isSuc: false, isL: false }
        case ANCClr: return { ...state, isErr: false, isSuc: false, isL: false }
        case ANCLSuc: return { ...state, list: action.payload };
        case ANCDelAtt:

            if (listTemp && listTemp.length > 0) {
                listTemp = listTemp.filter(i => i._id !== action.payload._id);
            }
            return {
                ...state, list: listTemp, isL: false
            };

        case ANCUptAtt:
            if (listTemp && listTemp.length > 0)
                listTemp = listTemp.map(i => {
                    if (i._id === action.payload._id) i = action.payload;
                    return i;
                });

            return {
                ...state, list: listTemp, isL: false
            };

        case ANCAddAtt:

            if (listTemp && listTemp.length > 0) {
                listTemp = listTemp.concat([action.payload]);
            } else if (listTemp) {
                listTemp = [].concat([action.payload]);
            }

            return {
                ...state, list: listTemp, isL: false, isUpt: false
            };
        default: return state;
    }
}