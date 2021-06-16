import { settingsConstants, organizationConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { ModalProcess } from "./profileActions";
import { logOut } from "./userActions";
const { SErr, SReq, SSuc } = settingsConstants;
const { GOIReq, GOISuc, GOIErr } = organizationConstants;

export const getSetting = () => async dispatch => {
    try {
        dispatch({ type: SReq });
        Token();
        let res = await api.get(`/settings/settings`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.setting && !res.data.error) {
            dispatch({ type: SSuc, payload: res.data });
        } else dispatch({ type: SErr });
    } catch {
    }
}

export const registerSetting = () => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        var res = await api.put(`/org_settings/register`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.org && !res.data.error) {
            dispatch({ type: GOISuc, payload: res.data })
            dispatch(ModalProcess({ title: 'Organization Setting', text: 'Organization setting has been created.' }));
        } else dispatch({ type: GOIErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const updateSetting = (data) => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        var res = await api.post(`/org_settings/update`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.org && !res.data.error) {
            dispatch({ type: GOISuc, payload: res.data })
            dispatch(ModalProcess({ title: 'Organization Setting', text: 'Organization setting has updated.' }));
        } else dispatch({ type: GOIErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}


