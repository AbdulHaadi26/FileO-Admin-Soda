import { planConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
import { logOut } from "./userActions";
const { PLSuc, PLTSuc, PLErr, PLReq, PLClr, PLNSuc, PDelAtt, PUptAtt } = planConstants;

export const registerPlan = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        Token();
        let res = await api.put("/plan/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.key && !res.data.error) {
            dispatch(ModalProcess({ title: 'Plan', text: 'A plan has been added.' }));
            history.push(`/organization/${data.org}/myspace/user/${data._id}/plan/view/${res.data.key}`);
        } else dispatch(ModalProcess({ title: 'Plan', text: 'A plan with same name already exists.', isErr: true }));
        dispatch(clearPlan());
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const getPlan = (_id) => async dispatch => {
    try {
        dispatch({ type: PLReq });
        var res = await api.get(`/plan/getPlan/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.plan && !res.data.error) {
            dispatch({ type: PLNSuc, payload: res.data.plan });
            dispatch({ type: PLSuc });
        } else { dispatch({ type: PLErr }) }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const fetchPlans = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        Token();
        let res = await api.get(`/plan/fetchPlans`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        
        if (res.data.planList && !res.data.error) {
            dispatch({ type: PLTSuc, payload: res.data });
            dispatch({ type: PLSuc });
        } else dispatch({ type: PLErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const fetchPlansSearch = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        Token();
        var res = await api.get(`/plan/fetchPlansSearch`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.planList && !res.data.error) {
            dispatch({ type: PLTSuc, payload: res.data });
            dispatch({ type: PLSuc });
        } else dispatch({ type: PLErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const clearPlan = () => async dispatch => {
    dispatch({ type: PLClr });
}

export const updatePlan = data => async dispatch => {
    try {
        var res = await api.post(`/plan/update`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.plan && !res.data.error) dispatch({ type: PLNSuc, payload: res.data.plan });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const updatePlanDetails = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        let res = await api.post(`/plan/updateDetails`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error && res.data.plan) {
            dispatch(ModalProcess({ title: 'Plan', text: 'Plan details has been updated.' }));
            dispatch({ type: PUptAtt, payload: res.data.plan });
        } else dispatch(ModalProcess({ title: 'Plan', text: 'Plan details has been updated.', isErr: true }));
        dispatch(clearPlan());
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}


export const updatePlanList = data => async dispatch => {
    try {
        await api.post(`/plan/updateList`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const deletePlan = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        let res = await api.delete(`/plan/delete/${data._id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Plan', text: 'Plan has been deleted.' }));
            dispatch({ type: PDelAtt, payload: { _id: data._id } });
        }
        else dispatch(ModalProcess({ title: 'Plan', text: 'Plan could not be deleted.', isErr: true }));
        !data.skip && history.push(`/organization/${data.org}/myspace/user/${data.uId}/plan/list`)
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}