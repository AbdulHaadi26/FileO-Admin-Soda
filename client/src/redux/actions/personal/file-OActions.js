import api from '../../../utils/apiP';
import { ModalProcess } from './../profileActions';
import history from '../../../utils/history';
import { logOut } from '../userActions';
import { userConstants } from '../../constants';
import Token from '../token';
const { GPErr, GPReq, GPSuc } = userConstants;

export const trailFileO = data => async dispatch => {
    try {
        let res = await api.put("/registration/trail", data);
        if (res.data.user && !res.data.error) {
            dispatch(ModalProcess({ title: 'Free Trail', text: 'Your account has been sucessfully created.' }));
            history.push('/login');
        }
        else dispatch(ModalProcess({ title: 'Free Trail', text: 'Your account could not be created.', isErr: true }));
    } catch { dispatch(ModalProcess({ title: 'Free Trail', text: 'Your account could not be created.', isErr: true })); }
};

export const getLowerPackageCount = (data) => async dispatch => {
    try {
        Token();
        let res = await api.get(`/account/packagesCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error && res.data.count) return res.data.count;
        else return 0;
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const downgradePackage = (data) => async dispatch => {
    try {
        dispatch({ type: GPReq });
        Token();
        let res = await api.post(`/account/downgradePackage`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            dispatch(ModalProcess({ title: 'Downgrade Storage', text: 'An email has been sent to File-O support about your request. Our representative will get back to you within 24 hours.' }));
            dispatch({ type: GPSuc, payload: res.data })
        } else {
            dispatch(ModalProcess({ title: 'Downgrade Storage', text: 'Your package could not be downgraded.', isErr: true }));
            dispatch({ type: GPErr })
        }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}
