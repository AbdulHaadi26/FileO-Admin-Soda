import { loginConstants, userConstants, notifConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { getSetting } from './settingActions';
import { ModalProcess, ModalProcessNT } from "./profileActions";
import { billingReminder, getOrganization } from "./organizationActions";
const { LErr, LReq, LSuc } = loginConstants;
const { GDErr, GDReq, GDSuc, GPReq, GPSuc, CUErr, CUSuc } = userConstants;
const { CNValue } = notifConstants;

export const loginUser = (data) => async dispatch => {
    dispatch({ type: LReq });
    try {
        let res = await api.post('/account/auth', data);
        if (res.data && !res.data.error && res.data.token) {
            dispatch(getSetting())
            dispatch(setCurrentUser(res.data.token));
            dispatch({ type: LSuc });
        } else if (res.data.error === "Session is already active") {
            dispatch(ModalProcess({ title: 'Session', text: 'Your session is already active. Please reset your password to logout of all active sessions.', isErr: true }));
            dispatch({ type: LErr });
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

export const billMessage = async () => {
    try {
        let data = {
            isMessage: false,
            isDisabled: false
        };

        let res = await api.get("/account/bill", { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.count > 0 && res.data.date && !res.data.error) {
            let date = new Date(res.data.date);
            data.isMessage = true;
            if (date.getDate() >= 11) data.isDisabled = true;
        }
        return data;
    } catch (e) {
    }
}


export const getProfile = () => async dispatch => {
    try {
        dispatch({ type: GPReq });
        Token();

        let billData = await billMessage();

        let res = await api.get("/account/profile", { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.error === 'Idle for more than 15 mins') {
            dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
        }
        if (res.data.user && !res.data.error) {
            dispatch(getNotifications());
            if (res.data.user.flag === 'B') dispatch(getOrganization());

            if (res.data.user.isTrail && res.data.user.trail_end_date) {
                let date1 = new Date(res.data.user.trail_end_date);
                let date2 = new Date(Date.now());

                let Difference_In_Time = date1.getTime() - date2.getTime();
                let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                let daysLeft = Math.floor(Difference_In_Days);
                daysLeft = daysLeft < 0 ? 0 : daysLeft;

                if (daysLeft <= 7) {
                    if (daysLeft <= 0) res.data.user.isDisabled = true;
                    dispatch(billingReminder(1));
                }
            }

            res.data.user.isMessage = billData.isMessage;
            res.data.user.isDisabled = billData.isDisabled;
            if (res.data.user.current_employer) {
                res.data.user.current_employer.isMessage = billData.isMessage;
                res.data.user.current_employer.isDisabled = billData.isDisabled;
            }
            dispatch({ type: GPSuc, payload: res.data })
        } else {
            dispatch(logOut());
        }
    } catch (e) {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const registerReq = (i, data) => async dispatch => {
    try {
        dispatch({ type: GDReq });
        Token();
        await api.post("/account/request", '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        i === 0 ? dispatch(getDashP(data)) : dispatch(getDashU(data));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getDashA = () => async dispatch => {
    try {
        dispatch({ type: GDReq });
        Token();
        let billData = await billMessage();
        let res = await api.get("/account/dashboard/admin", { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            if (res.data.org) {
                res.data.org.isMessage = billData.isMessage;
                res.data.org.isDisabled = billData.isDisabled;
            }
            dispatch({ type: GDSuc, payload: res.data })
        } else dispatch({ type: GDErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getDashU = data => async dispatch => {
    try {
        dispatch({ type: GDReq });
        Token();
        let res = await api.get("/account/dashboard/user", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.success && !res.data.error ? dispatch({ type: GDSuc, payload: res.data }) : dispatch({ type: GDErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getDashP = data => async dispatch => {
    try {
        dispatch({ type: GDReq });
        Token();
        let res = await api.get("/account/dashboard/manager", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.success && !res.data.error ? dispatch({ type: GDSuc, payload: res.data }) : dispatch({ type: GDErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getNotifications = () => async dispatch => {
    let resN = await api.get("/notifications/notifCount", { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    !resN.data.error && dispatch({ type: CNValue, payload: resN.data.count });
    if (resN.data.list) dispatch(ModalProcessNT(resN.data.list));
};