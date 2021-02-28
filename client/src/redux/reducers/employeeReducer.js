import { employeeConstants } from '../constants';
const { GEISuc, EReq, EErr, ESuc, GASuc, EClr, GESuc, ECount } = employeeConstants;
const iS = { isSuc: false, isErr: false, isL: false, count: 0 };

export const EmployeeReducer = (state = iS, action) => {
    switch (action.type) {
        case EReq: return { ...state, isL: true, isErr: false, isSuc: false };
        case ESuc: return { ...state, isL: false, isErr: false, isSuc: true };
        case EErr: return { ...state, isL: false, isErr: true, isSuc: false };
        case GEISuc: return { ...state, data: action.payload };
        case GASuc: return { ...state, list: action.payload };
        case GESuc: return { ...state, list2: action.payload };
        case EClr: return { ...state, isSuc: false, isL: false, isErr: false };
        case ECount: return { ...state, count: action.payload };
        default: return state;
    }
}
