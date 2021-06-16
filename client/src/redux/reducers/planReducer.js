import { planConstants } from '../constants';
const { PLClr, PLErr, PLReq, PLSuc, PLTSuc, PLNSuc, PDelAtt, PUptAtt } = planConstants;
const iS = { isSuc: false, isErr: false, isL: false, list: [] };

export const PlanReducer = (state = iS, action) => {
    let listTemp = state.list;

    switch (action.type) {
        case PLSuc: return { ...state, isErr: false, isSuc: true, isL: false }
        case PLReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case PLErr: return { ...state, isErr: true, isSuc: false, isL: false }
        case PLClr: return { ...state, isErr: false, isSuc: false, isL: false }
        case PLTSuc: return { ...state, isL: false, isErr: false, isSuc: true, list: action.payload };
        case PLNSuc: return { ...state, isL: false, isErr: false, isSuc: true, data: action.payload };
        case PDelAtt:
            if (listTemp && listTemp.planList && listTemp.planList.length > 0) {
                listTemp.planList = listTemp.planList.filter(i => i._id !== action.payload._id);
                listTemp.count = listTemp.planList.length;
            }

            return {
                ...state, list: listTemp, isL: false
            };
        case PUptAtt:

            if (listTemp && listTemp.planList && listTemp.planList.length > 0)
                listTemp.planList = listTemp.planList.map(i => {
                    if (i._id === action.payload._id) i = action.payload;
                    return i;
                });

            return {
                ...state, list: listTemp, isL: false
            };
        default: return state;
    }
};
