import { navConstants } from "../constants";
const { NavSuc, ISuc, JSuc } = navConstants;

export const SetNav = nav => async dispatch => {
    dispatch({ type: NavSuc, payload: nav });
    if (nav !== 1) {
        dispatch({ type: ISuc, payload: -1 });
        dispatch({ type: JSuc, payload: -1 });
    }
};

export const SetI = i => async dispatch => dispatch({ type: ISuc, payload: i });

export const SetJ = j => async dispatch => dispatch({ type: JSuc, payload: j });