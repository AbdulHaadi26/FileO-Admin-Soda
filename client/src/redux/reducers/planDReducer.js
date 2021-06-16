import { planDConstants } from '../constants';
const { PLDClr, PLDErr, PLDReq, PLDSuc, PLTDSuc, PLTDLSuc } = planDConstants;
const iS = { isSuc: false, isErr: false, isL: false, list: '', listP: [] };

export const PlanDReducer = (state = iS, action) => {
    switch (action.type) {
        case PLDSuc: return { ...state, isErr: false, isSuc: true, isL: false }
        case PLDReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case PLDErr: return { ...state, isErr: true, isSuc: false, isL: false }
        case PLDClr: return { ...state, isErr: false, isSuc: false, isL: false, list: '', listP: [] }
        case PLTDSuc: return { ...state, isL: false, isErr: false, isSuc: true, list: action.payload };
        case PLTDLSuc: return { ...state, listP: action.payload, isL: false };
        default: return state;
    }
};
