import { pollConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { ModalProcess } from "./profileActions";
import { logOut } from "./userActions";
const { PLSuc, PLTSuc, PLErr, PLReq, PLClr, PLNSuc, PDelAtt, PAddAtt, PUptAtt } = pollConstants;

export const registerPoll = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        Token();
        let res = await api.put("/poll/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.poll && !res.data.error) {
            dispatch(ModalProcess({ title: 'Poll', text: 'A poll has been added.' }));
            dispatch({ type: PAddAtt, payload: res.data.poll });
        } else dispatch(ModalProcess({ title: 'Poll', text: 'A poll with same name already exists.', isErr: true }));
        dispatch(clearPoll());
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const SubmitPoll = (data) => async dispatch => {
    try {
        dispatch({ type: PLReq });
        let res = await api.post(`/poll/submitPoll`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Poll', text: 'A poll has been submitted successfully.' }));
            dispatch({ type: PDelAtt, payload: { _id: data._id } });
        } else dispatch(ModalProcess({ title: 'Poll', text: 'The poll could not be submitted.', isErr: true }));
        dispatch(clearPoll());
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}


export const getPoll = (_id) => async dispatch => {
    try {
        dispatch({ type: PLReq });
        var res = await api.get(`/poll/getPoll/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.poll && !res.data.error) {
            dispatch({ type: PLNSuc, payload: res.data.poll });
            dispatch({ type: PLSuc });
        } else { dispatch({ type: PLErr }) }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const fetchPolls = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        Token();
        let res = await api.get(`/poll/fetchPolls`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.polls && !res.data.error) {
            dispatch({ type: PLTSuc, payload: res.data.polls });
        } else dispatch({ type: PLErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const clearPoll = () => async dispatch => {
    dispatch({ type: PLClr });
}

export const UpdatePoll = data => async dispatch => {
    try {
        dispatch({ type: PLReq })
        let res = await api.post(`/poll/update`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.poll && !res.data.error) {
            dispatch(ModalProcess({ title: 'Poll', text: 'Poll details have been updated' }));
            dispatch({ type: PUptAtt, payload: res.data.poll });
        } else dispatch(ModalProcess({ title: 'Poll', text: 'Poll details could not be updated.', isErr: true }));
        dispatch(clearPoll())
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}


export const deletePoll = data => async dispatch => {
    try {
        dispatch({ type: PLReq });
        let res = await api.delete(`/poll/delete/${data._id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Poll', text: 'Poll has been deleted.' }));
            dispatch({ type: PDelAtt, payload: { _id: data._id } });
        }
        else dispatch(ModalProcess({ title: 'Poll', text: 'Poll could not be deleted.', isErr: true }));
        dispatch(clearPoll())
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}