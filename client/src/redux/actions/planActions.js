import { planConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { PLSuc, PLTSuc, PLErr, PLReq, PLClr, PLNSuc } = planConstants;

export const registerPlan = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        Token();
        var res = await api.put("/plan/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.key && !res.data.error) {
            dispatch(ModalProcess({ title: 'Plan', text: 'A plan has been added.' }));
            history.push(`/organization/${data.org}/myspace/user/${data._id}/plan/view/${res.data.key}`);
        } else dispatch(ModalProcess({ title: 'Plan', text: 'A plan with same name already exists.', isErr: true }));
        dispatch(clearPlan());
    } catch { dispatch({ type: PLErr }); }
}

export const getPlan = (_id) => async dispatch => {
    try {
        dispatch({ type: PLReq });
        var res = await api.get(`/plan/getPlan/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.plan && !res.data.error) {
            dispatch({ type: PLNSuc, payload: res.data.plan });
            dispatch({ type: PLSuc });
        } else { dispatch({ type: PLErr }) }
    } catch { dispatch({ type: PLErr }); }
}

export const fetchPlans = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        Token();
        var res = await api.get(`/plan/fetchPlans`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.planList && !res.data.error) {
            dispatch({ type: PLTSuc, payload: res.data });
            dispatch({ type: PLSuc });
        } else dispatch({ type: PLErr });
    } catch { dispatch({ type: PLErr }); }
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
    } catch { dispatch({ type: PLErr }); }
}

export const clearPlan = () => async dispatch => {
    dispatch({ type: PLClr });
}

export const updatePlan = data => async dispatch => {
    try {
        var res = await api.post(`/plan/update`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.plan && !res.data.error) dispatch({ type: PLNSuc, payload: res.data.plan });
    } catch { dispatch({ type: PLErr }); }
}

export const updatePlanDetails = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        let res = await api.post(`/plan/updateDetails`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) dispatch(ModalProcess({ title: 'Plan', text: 'Plan details has been updated.' }));
        else dispatch(ModalProcess({ title: 'Plan', text: 'Plan details has been updated.', isErr: true }));
        dispatch(clearPlan());
    } catch { dispatch({ type: PLErr }); }
}


export const updatePlanList = data => async dispatch => {
    try {
        await api.post(`/plan/updateList`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    } catch { dispatch({ type: PLErr }); }
}

export const deletePlan = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        let res = await api.delete(`/plan/delete/${data._id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) dispatch(ModalProcess({ title: 'Plan', text: 'Plan has been deleted.' }));
        else dispatch(ModalProcess({ title: 'Plan', text: 'Plan could not be deleted.', isErr: true }));
        !data.skip && history.push(`/organization/${data.org}/myspace/user/${data.uId}/plan/list`)
    } catch { dispatch({ type: PLErr }); }
}