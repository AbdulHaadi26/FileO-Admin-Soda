import { planConstants } from '../constants';
const { PLClr, PLErr, PLReq, PLSuc, PLTSuc, PLNSuc } = planConstants;
const iS = { isSuc: false, isErr: false, isL: false, list: [] };

export const PlanReducer = (state = iS, action) => {
    switch (action.type) {
        case PLSuc: return { ...state, isErr: false, isSuc: true, isL: false }
        case PLReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case PLErr: return { ...state, isErr: true, isSuc: false, isL: false }
        case PLClr: return { ...state, isErr: false, isSuc: false, isL: false }
        case PLTSuc: return { ...state, isL: false, isErr: false, isSuc: true, list: action.payload };
        case PLNSuc: return { ...state, isL: false, isErr: false, isSuc: true, data: action.payload };
        default: return state;
    }
};
