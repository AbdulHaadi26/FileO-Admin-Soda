import { verificationConstants } from '../constants';
const { VErr, VReq, VSuc } = verificationConstants;
const iS = { isL: false, isErr: false };

export const verReducer = (state = iS, action) => {
    switch (action.type) {
        case VReq: return { ...state, isL: true, isErr: false };
        case VSuc: return { ...state, isL: false, isErr: false, isSuc: true };
        case VErr: return { ...state, isL: false, isErr: true };
        default: return state;
    }
}