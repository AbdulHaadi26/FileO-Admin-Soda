import { rolesConstants } from '../constants';
const { RClr, RErr, RReq, RSuc, GRSuc, GRISuc } = rolesConstants;
const iS = { isSuc: false, isErr: false, isL: false };

export const RoleReducer = (state = iS, action) => {
    switch (action.type) {
        case RSuc: return { ...state, isErr: false, isSuc: true, isL: false }
        case RReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case RErr: return { ...state, isErr: true, isSuc: false, isL: false }
        case RClr: return { ...state, isErr: false, isSuc: false, isL: false }
        case GRSuc: return { ...state, isL: false, isErr: false, isSuc: true, list: action.payload }
        case GRISuc: return { ...state, isL: false, isErr: false, isSuc: true, data: action.payload }
        default: return state;
    }
}
