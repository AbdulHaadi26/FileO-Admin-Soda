import { modalConstants, userConstants, fileConstants, noteConstants, catConstants, taskConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import axios from 'axios';
const { GPErr, GPSuc, SideNav, GPReqS } = userConstants;
const { MHide, MShow, NTMHide, NTMShow } = modalConstants;

export const ModalHide = () => async dispatch => dispatch({ type: MHide });

export const ModalNTHide = () => async dispatch => dispatch({ type: NTMHide });

export const ModalProcess = data => dispatch => {
    dispatch({ type: MShow, payload: data });
    setTimeout(function () {
        dispatch({ type: MHide });
    }, 5000);
}

export const ModalProcessNT = data => dispatch => {
    dispatch({ type: NTMShow, payload: data });
    setTimeout(function () {
        dispatch({ type: NTMHide });
    }, 3000);
}

export const getAllCounts = () => async dispatch => {
    try {
        let res = await api.get(`/notifications/tabNav/count`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: fileConstants.CTCountS, payload: res.data.countCF });
            dispatch({ type: fileConstants.FCountS, payload: res.data.countF });
            dispatch({ type: catConstants.CCountS, payload: res.data.countC });
            dispatch({ type: noteConstants.NTCountS, payload: res.data.countSN });
            dispatch({ type: noteConstants.NTCount, payload: res.data.countN });
            dispatch({ type: taskConstants.NTCountS, payload: res.data.countST });
            dispatch({ type: taskConstants.NTCount, payload: res.data.countT });
            dispatch({ type: catConstants.CCountM, payload: res.data.countM });
        }
    } catch { dispatch({ type: GPErr }); }
}

export const updateProfile = data => async dispatch => {
    try {
        dispatch({ type: GPReqS });
        Token();
        var res = await api.post("/account/updateProfile", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            dispatch({ type: GPSuc, payload: res.data });
            dispatch(ModalProcess({ title: 'User', text: 'Profile details has been updated.' }));
            history.push('/user/profile');
        } else dispatch({ type: GPErr });
    } catch { dispatch({ type: GPErr }); }
};

export const uploadImage = (data, file, _id) => async dispatch => {
    try {
        dispatch({ type: GPReqS });
        Token();
        var res1 = await api.post(`/account/imageUrl/sign`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res1.data.key && res1.data.url && !res1.data.error) {
            await axios.put(res1.data.url, file);
            var userData = { _id: _id, key: res1.data.key };
            var res = await api.post(`/account/uploadImage`, userData, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
            if (res.data.user && !res.data.error) {
                dispatch({ type: GPSuc, payload: res.data });
                dispatch(ModalProcess({ title: 'User', text: 'Profile details has been updated.' }));
                history.push('/user/profile');
            } else dispatch({ type: GPErr });
        } else dispatch({ type: GPErr });
    } catch { dispatch({ type: GPErr }); }
};

export const setSN = num => async dispatch => {
    dispatch({ type: SideNav, payload: num });
};

