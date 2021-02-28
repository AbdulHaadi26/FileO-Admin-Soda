import { projectConstants } from '../constants';
const { PLSuc, PClr, PErr, PReq, PSuc, POISuc } = projectConstants;
const iS = { isSuc: false, isErr: false, isL: false, isUpt: false };

export const ProjectReducer = (state = iS, action) => {
    switch (action.type) {
        case PSuc: return { ...state, isErr: false, isSuc: true, isL: false }
        case PReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case PErr: return { ...state, isErr: true, isSuc: false, isL: false}
        case PClr: return { ...state, isErr: false, isSuc: false, isL: false }
        case PLSuc: return { ...state, list: action.payload }
        case POISuc: return { ...state, data: action.payload }
        default: return state;
    }
}