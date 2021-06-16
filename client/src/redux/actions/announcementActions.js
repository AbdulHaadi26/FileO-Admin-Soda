import { ancConstants, fileConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { ModalProcess } from "./profileActions";
import { logOut } from "./userActions";
import axios from "axios";
const { ANCAddAtt, ANCLSuc, ANCUptAtt, ANCSuc, ANCReq, ANCErr, ANCDelAtt, ANCClr } = ancConstants;
const { FUpt, FClr } = fileConstants;

export const clearANC = () => async dispatch => dispatch({ type: ANCClr });

export const registerANC = data => async dispatch => {
    try {
        dispatch({ type: ANCReq });
        Token();
        let res = await api.put("/announcements/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.annc && !res.data.error) {
            dispatch(ModalProcess({ title: 'Project Annoucement', text: 'Annoucement has been added.' }));
            dispatch({ type: ANCAddAtt, payload: res.data.annc });
        } else dispatch(ModalProcess({ title: 'Project Annoucement', text: 'Announcement could not be added.', isErr: true }));
        dispatch(clearANC())
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const clearFile = () => async dispatch => { dispatch({ type: FClr }); }

export const registerANCA = (data, file) => async dispatch => {
    try {
        dispatch({ type: ANCReq });
        Token();
        let res = await api.put("/announcements/registerRec", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        console.log(res.data)
        if (res.data.annc && res.data.url && !res.data.error) {
            dispatch(ModalProcess({ title: 'Project Annoucement', text: 'Annoucement has been added.' }));
            dispatch(uploadFile(file, res.data.url, res.data.annc));
            dispatch({ type: ANCAddAtt, payload: res.data.annc });
        } else dispatch(ModalProcess({ title: 'Project Annoucement', text: 'Announcement could not be added.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const uploadFile = (file, url, fileData) => async dispatch => {
    try {
        Token();
        var percentCheck = 1;
        await axios.put(url, file, {
            onUploadProgress: function (progressEvent) {
                percentCheck = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                dispatch({ type: FUpt, payload: percentCheck, payloadExtra: fileData });
            }
        });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const fetchANC = data => async dispatch => {
    try {
        dispatch({ type: ANCReq });
        Token();
        let res = await api.get("/announcements/list", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.annc && !res.data.error) {
            dispatch({ type: ANCLSuc, payload: res.data.annc });
            dispatch({ type: ANCSuc });
        }
        else dispatch({ type: ANCErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const getANC = _id => async dispatch => {
    try {
        dispatch({ type: ANCReq });
        Token();
        var res = await api.get(`/announcements/details/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.annc && !res.data.error) {
            dispatch({ type: ANCSuc, payload: res.data.annc });
        } else dispatch({ type: ANCErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const updateANC = data => async dispatch => {
    try {
        dispatch({ type: ANCReq });
        Token();
        let res = await api.post(`/announcements/update`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.annc && !res.data.error) {
            dispatch(ModalProcess({ title: 'Project Annoucement', text: 'Project annoucement has been updated.' }));
            dispatch({ type: ANCUptAtt, payload: res.data.annc });
        } else dispatch(ModalProcess({ title: 'Project Annoucement', text: 'Project annoucement could not be updated.', isErr: true }));
        dispatch(clearANC());
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const delANC = (_id) => async dispatch => {
    try {
        dispatch({ type: ANCReq });
        Token();
        let res = await api.delete(`/announcements/delete/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Project Annoucement', text: 'Project annoucement has been deleted.' }));
            dispatch({ type: ANCDelAtt, payload: { _id } });
        }
        else dispatch(ModalProcess({ title: 'Project Annoucement', text: 'Project annoucement could not bes deleted.', isErr: true }));
        dispatch(clearANC());
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}
