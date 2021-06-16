import { userConstants, fileConstants, notifConstants } from "../../constants";
import api from '../../../utils/api';
import apiP from '../../../utils/apiP';
import history from '../../../utils/history';
import Token from '../token';
import { ModalProcess, ModalProcessNT } from "../profileActions";
const { CNValue } = notifConstants;
const { GDErr, GDReq, GDSuc, GPReq, GPSuc, CUErr } = userConstants;

export const logOut = () => async dispatch => {
    try {
        dispatch({ type: GPReq });
        if (localStorage.getItem('token') !== null) {
            var res = await api.post("/account/logout", '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
            if (res.data.success && !res.data.error) {
                dispatch({ type: CUErr });
                localStorage.removeItem('token');
                localStorage.removeItem('rem');
                history.push('/login');
                dispatch({ GPSuc });
            }
        }
    } catch {

    }
};

export const getNotifications = () => async dispatch => {
    let resN = await api.get("/notifications/notifCount", { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    !resN.data.error && dispatch({ type: CNValue, payload: resN.data.count });
    if (resN.data.list) dispatch(ModalProcessNT(resN.data.list));
};

export const getAllCounts = () => async dispatch => {
    try {
        let res = await apiP.get(`/notifications/tabNav/count`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: fileConstants.CTCountS, payload: res.data.countCF });
        }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getDashP = data => async dispatch => {
    try {
        dispatch({ type: GDReq });
        Token();
        let res = await apiP.get("/account/dashboard", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.success && !res.data.error ? dispatch({ type: GDSuc, payload: res.data }) : dispatch({ type: GDErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};