import { billConstants } from "../../constants";
import api from '../../../utils/apiP';
import Token from '../token';
import { ModalProcess } from '../profileActions';
import { logOut } from "../userActions";

const {
    BErr,
    BReq,
    BSuc
} = billConstants;

export const fetchBills = (data) => async dispatch => {
    try {
        dispatch({ type: BReq });
        Token();
        let res = await api.get(`/billing/bills`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error && res.data.list) {
            dispatch({ type: BSuc, payload: res.data.list });
        } else dispatch({ type: BErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};