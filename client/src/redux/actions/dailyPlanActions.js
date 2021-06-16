import { planDConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { ModalProcess } from "./profileActions";
import { logOut } from "./userActions";
const { PLDReq, PLDSuc, PLTDSuc, PLTDLSuc } = planDConstants;

export const registerPlanD = data => async dispatch => {
    try {
        dispatch({ type: PLDReq });
        Token();
        let res = await api.put("/daily/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.plan && !res.data.error) {
            dispatch(ModalProcess({ title: 'Daily Plan', text: 'A plan has been added.' }));
            dispatch({ type: PLTDSuc, payload: res.data.plan });
        } else dispatch(ModalProcess({ title: 'Daily Plan', text: 'A plan with same name already exists.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getPlanD = data => async dispatch => {
    try {
        dispatch({ type: PLDReq });
        Token();
        let res = await api.get("/daily/plan", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.plan && !res.data.error) {
            dispatch({ type: PLTDSuc, payload: res.data.plan });
        }  else dispatch({ type: PLTDSuc, payload: '' });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getPlanAll = data => async dispatch => {
    try {
        dispatch({ type: PLDReq });
        Token();
        let res = await api.get("/daily/Allplan", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.plans && !res.data.error) {
            dispatch({ type: PLTDLSuc, payload: res.data.plans });
        }  else dispatch({ type: PLTDLSuc, payload: [] });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const updatePlanD = data => async dispatch => {
    try {
        var res = await api.post(`/daily/update`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.plan && !res.data.error) dispatch(ModalProcess({ title: 'Daily Plan', text: 'The plan has been updated.' }));
        else dispatch(ModalProcess({ title: 'Daily Plan', text: 'The plan could not be updated.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const deletePlanD = data => async dispatch => {
    try {
        dispatch({ type: PLDReq });
        await api.delete(`/daily/delete/${data._id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch({ type: PLDSuc });

    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};