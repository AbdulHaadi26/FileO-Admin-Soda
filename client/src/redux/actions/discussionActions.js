import { discussionConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
const { DisErr, DisReq, DisSuc, DisClr, DisPush, DisAdd } = discussionConstants;

export const getDiscussion = (data, i) => async dispatch => {
    try {
        dispatch({ type: DisReq });
        i === 0 && dispatch({ type: DisClr });
        Token();
        var res = await api.get(`/discussion/getDiscussion/${data._id}`, { params: { offset: data.offset }, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.messages && !res.data.error) {
            i === 0 && dispatch({ type: DisSuc, payload: res.data.messages, count: res.data.count });
            i === 1 && dispatch({ type: DisAdd, payload: res.data.messages, count: res.data.count });
            i === 2 && dispatch({ type: DisSuc, payload: res.data.messages, count: res.data.count });
        } else dispatch({ type: DisErr });
    } catch { dispatch({ type: DisErr }); }
}

export const addComment = (data) => async dispatch => {
    try {
        var res = await api.put(`/discussion/register`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.message && !res.data.error) dispatch({ type: DisPush, payload: res.data.message });
    } catch { dispatch({ type: DisErr }); }
}