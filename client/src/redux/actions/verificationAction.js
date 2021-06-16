import { verificationConstants, userConstants, resetConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { VReq, VErr, VSuc } = verificationConstants;
const { ResErr, ResReq, ResSuc } = resetConstants;
const { GPSuc } = userConstants;

export const verifyUser = data => async dispatch => {
    try {
        dispatch({ type: VReq });
        Token();
        var res = await api.post("/verification/verifyUser", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            dispatch({ type: VSuc });
            dispatch({ type: GPSuc, payload: res.data });
            dispatch(ModalProcess({ title: 'Email verification', text: 'User account has been verified.' }));
            history.push('/user/dashboard');
        } else dispatch({ type: VErr });
    } catch { dispatch({ type: VErr }); }
}

export const sendPassMail = data => async dispatch => {
    try {
        dispatch({ type: ResReq });
        Token();
        let res = await api.post("/verification/sendPassMail", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch({ type: ResSuc });
            dispatch(ModalProcess({ title: 'Password Reset', text: 'A link has been sent to your email.' }));
        } else dispatch({ type: ResErr });
    } catch { dispatch({ type: ResErr }); }
}

export const sendMail = data => async dispatch => {
    try {
        Token();
        await api.post("/verification/sendMail", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Email Verification', text: 'A verification text has been sent.' }));
    } catch { 
        dispatch(ModalProcess({ title: 'Email Verification', text: 'A verification text could not be sent.', isErr: true }));
     }
}