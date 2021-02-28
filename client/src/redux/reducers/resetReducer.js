import { resetConstants } from '../constants';
const { ResErr, ResReq, ResSuc } = resetConstants;
const iS = { isL: false, isErr: false, isSuc: false };

export const resetReducer = (state = iS, action) => {
    switch (action.type) {
        case ResReq: return { ...state, isL: true, isErr: false, isSuc: false };
        case ResSuc: return { ...state, isL: false, isErr: false, isSuc: true };
        case ResErr: return { ...state, isL: false, isErr: true, isSuc: false };
        default: return state;
    }
}