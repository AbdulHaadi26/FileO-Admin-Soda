import { organizationConstants } from '../constants';
const { GOIErr, GOIReq, GOISuc, GPISuc } = organizationConstants;
const iS = { isSuc: false, isErr: false, isL: false };

export const OrganizationReducer = (state = iS, action) => {
    switch (action.type) {
        case GOIReq: return { ...state, isL: true, isErr: false, isSuc: false }
        case GOISuc: return { ...state, isL: false, isErr: false, isSuc: true, data: action.payload }
        case GOIErr: return { ...state, isL: false, isErr: true, isSuc: false }
        case GPISuc: return { ...state, packages: action.payload }
        default: return state;
    }
}