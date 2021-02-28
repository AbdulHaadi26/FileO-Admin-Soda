import { notifConstants, userConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { CNValue, NErr, NReq, NSuc, GNSuc, NLSuc } = notifConstants;
const { GPErr } = userConstants;

const notifList = { data: [], count: 0 };

export const fetchNotification = data => async dispatch => {
    try {
        dispatch({ type: NReq });
        Token();
        const res1 = await api.get("/notifications/list", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res1.data.notifs && res1.data.notifCount !== null && !res1.data.error) {
            notifList.data = res1.data.notifs;
            notifList.count = res1.data.notifCount
            dispatch({ type: CNValue, payload: res1.data.count });
            dispatch({ type: NLSuc, payload: notifList });
            dispatch({ type: NSuc });
        } else dispatch({ type: NErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchRequests = data => async dispatch => {
    try {
        dispatch({ type: NReq });
        Token();
        const res1 = await api.get("/notifications/requests", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res1.data.reqs && res1.data.reqCount !== null && !res1.data.error) {
            notifList.data = res1.data.reqs;
            notifList.count = res1.data.reqCount
            dispatch({ type: NLSuc, payload: notifList });
            dispatch({ type: NSuc });
        } else dispatch({ type: NErr });
    } catch { dispatch({ type: GPErr }); }
};

export const removeRequest = data => async dispatch => {
    try {
        dispatch({ type: NReq });
        Token();
        const res1 = await api.post("/notifications/deleteRequest", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res1.data.reqs && res1.data.reqCount !== null && !res1.data.error) {
            notifList.data = res1.data.reqs;
            notifList.count = res1.data.reqCount
            dispatch({ type: NLSuc, payload: notifList });
            dispatch({ type: NSuc });
        } else dispatch({ type: NErr });
    } catch { dispatch({ type: GPErr }); }
};

export const getNotification = _id => async dispatch => {
    try {
        dispatch({ type: NReq });
        Token();
        var res = await api.get(`/notifications/getNotification/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.notification && !res.data.error) {
            dispatch({ type: GNSuc, payload: res.data.notification });
            dispatch({ type: NSuc });
        } else dispatch({ type: NErr });

        !res.data.error && dispatch({ type: CNValue, payload: res.data.count });
    } catch { dispatch({ type: GPErr }); }
}

export const deleteNotification = (_id, org) => async dispatch => {
    try {
        dispatch({ type: NReq });
        Token();
        var data = { _id: _id };
        await api.post(`/notifications/delete`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Notification', text: 'Notification has been deleted.' }));
        history.push(`/organization/${org}/notification/list`);
    } catch { dispatch({ type: GPErr }); }
}

export const deleteAllNotification = org => async dispatch => {
    try {
        dispatch({ type: NReq });
        Token();
        const res1 = await api.post(`/notifications/deleteAll`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Notification', text: 'All Notification has been deleted.' }));
        if (res1.data.notifs && res1.data.notifCount !== null && !res1.data.error) {
            notifList.data = res1.data.notifs;
            notifList.count = res1.data.notifCount
            dispatch({ type: CNValue, payload: res1.data.count });
            dispatch({ type: NLSuc, payload: notifList });
            dispatch({ type: NSuc });
        } else dispatch({ type: NErr });
    } catch { dispatch({ type: GPErr }); }
}

export const readAllNotification = () => async dispatch => {
    try {
        dispatch({ type: NReq });
        Token();
        const res1 = await api.post(`/notifications/readAll`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Notification', text: 'All Notification has been marked as read.' }));
        if (res1.data.notifs && res1.data.notifCount !== null && !res1.data.error) {
            notifList.data = res1.data.notifs;
            notifList.count = res1.data.notifCount
            dispatch({ type: CNValue, payload: res1.data.count });
            dispatch({ type: NLSuc, payload: notifList });
            dispatch({ type: NSuc });
        } else dispatch({ type: NErr });
    } catch { dispatch({ type: GPErr }); }
}