import { discussionConstants } from '../constants';
const { DisErr, DisReq, DisSuc, DisClr, DisPush, DisAdd } = discussionConstants;
const iS = { isSuc: false, isErr: false, isL: false, list: [], count: 0 };

export const DiscussionReducer = (state = iS, action) => {
    switch (action.type) {
        case DisSuc: return { ...state, isSuc: true, isL: false, isErr: false, list: action.payload, count: action.count };
        case DisReq: return { ...state, isL: true, isSuc: false, isErr: false };
        case DisErr: return { ...state, isErr: true, isSuc: false, isL: false };
        case DisClr: return { ...state, list: [], count: 0 };
        case DisPush: return { ...state, list: state.list ? state.list.concat([action.payload]) : [] };
        case DisAdd: return { ...state, list: state.list ? state.list.concat(action.payload) : [], count: action.count };
        default: return state;
    }
}

