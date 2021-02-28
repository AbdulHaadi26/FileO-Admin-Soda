import { loginConstants, userConstants, notifConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { getSetting } from './settingActions';
import { ModalProcessNT } from "./profileActions";
const { LErr, LReq, LSuc } = loginConstants;
const { GDErr, GDReq, GDSuc, GPErr, GPReq, GPSuc, CUErr, CUSuc } = userConstants;
const { CNValue } = notifConstants;

export const loginUser = (data) => async dispatch => {
    dispatch({ type: LReq });
    try {
        var res = await api.post('/account/auth', data);
        if (res.data && !res.data.error && res.data.token) {
            dispatch(getSetting())
            dispatch(setCurrentUser(res.data.token));
            dispatch({ type: LSuc });
        } else { dispatch({ type: LErr }); }
    } catch { dispatch({ type: LErr }); }
}

const setCurrentUser = t => dispatch => {
    localStorage.setItem("token", t);
    dispatch(getCurrentUser());
};

export const getCurrentUser = () => dispatch => {
    !localStorage.getItem('token') ? dispatch({ type: CUErr }) : dispatch({ type: CUSuc });
    dispatch(getProfile());
};

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

export const getProfile = () => async dispatch => {
    try {
        dispatch({ type: GPReq });
        Token();
        var res = await api.get("/account/profile", { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.user && !res.data.error ? dispatch({ type: GPSuc, payload: res.data }) : dispatch(logOut());
        res.data.user && !res.data.error && dispatch(getNotifications());
    } catch (e) { dispatch(logOut()); }
}

export const registerReq = (i, data) => async dispatch => {
    try {
        dispatch({ type: GDReq });
        Token();
        await api.post("/account/request", '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        i === 0 ? dispatch(getDashU(data)) : dispatch(getDashU(data));
    } catch { dispatch({ type: GPErr }); }
}

export const getDashA = () => async dispatch => {
    try {
        dispatch({ type: GDReq });
        Token();
        var res = await api.get("/account/dashboard/admin", { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.success && !res.data.error ? dispatch({ type: GDSuc, payload: res.data }) : dispatch({ type: GDErr });
    } catch { dispatch({ type: GDErr }); }
}

export const getDashU = data => async dispatch => {
    try {
        dispatch({ type: GDReq });
        Token();
        var res = await api.get("/account/dashboard/user", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.success && !res.data.error ? dispatch({ type: GDSuc, payload: res.data }) : dispatch({ type: GDErr });
    } catch { dispatch({ type: GDErr }); }
}

export const getDashP = data => async dispatch => {
    try {
        dispatch({ type: GDReq });
        Token();
        var res = await api.get("/account/dashboard/manager", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.success && !res.data.error ? dispatch({ type: GDSuc, payload: res.data }) : dispatch({ type: GDErr });
    } catch { dispatch({ type: GDErr }); }
}

export const getNotifications = () => async dispatch => {
    var resN = await api.get("/notifications/notifCount", { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    !resN.data.error && dispatch({ type: CNValue, payload: resN.data.count });
    if (resN.data.list) dispatch(ModalProcessNT(resN.data.list));
}