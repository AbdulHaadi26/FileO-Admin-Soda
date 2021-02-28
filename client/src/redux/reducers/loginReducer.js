import { loginConstants } from "../constants";
const { LReq, LErr, LSuc } = loginConstants;
const iS = { isL: false, isErr: false };

export const loginReducer = (state = iS, action) => {
    switch (action.type) {
        case LReq: return { ...state, isL: true, isErr: false }
        case LErr: return { ...state, isL: false, isErr: true }
        case LSuc: return { ...state, isL: false, isErr: false }
        default: return state;
    }
}
