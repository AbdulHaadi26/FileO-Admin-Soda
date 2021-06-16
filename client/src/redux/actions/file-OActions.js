import api from '../../utils/api';
import Axios from 'axios';
import { ModalProcess } from './profileActions';
import { codeConstants, packageConstants } from '../constants';
import history from '../../utils/history';
import apiP from '../../utils/apiP';
import { logOut } from './userActions';

export const sendEmail = data => async dispatch => {
    try {
        let res = await api.put("/service/email", data);
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Contact Sales', text: 'Your message has been successfully delivered.' }));
        } else dispatch(ModalProcess({ title: 'Contact Sales', text: 'Your message could not be delivered.', isErr: true }));
    } catch { dispatch(ModalProcess({ title: 'Contact Sales', text: 'Your message could not be delivered.', isErr: true })); }
};

export const generateTrialOrder = data => async dispatch => {
    try {
        let res = await api.put("/easy_paisa/order/trialU", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.order && !res.data.error) {
            return res.data.order;
        } else dispatch(ModalProcess({ title: 'Upgrade Storage', text: 'Your storage could not be upgraded.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const registerFileO = data => async dispatch => {
    try {
        let res = await api.put("/registration/register", data);
        if (res.data.order && !res.data.error) {
            return res.data.order;
        } else dispatch(ModalProcess({ title: 'Sign Up', text: 'Your account could not be created.', isErr: true }));
    } catch { dispatch(ModalProcess({ title: 'Sign Up', text: 'Your account could not be created.', isErr: true })); }
};

export const registerFileOP = data => async dispatch => {
    try {
        let res = await apiP.put("/registration/register", data);
        if (res.data.order && !res.data.error) {
            return res.data.order;
        } else dispatch(ModalProcess({ title: 'Sign Up', text: 'Your account could not be created.', isErr: true }));
    } catch { dispatch(ModalProcess({ title: 'Sign Up', text: 'Your account could not be created.', isErr: true })); }
};

export const generateOrderUptU = data => async dispatch => {
    try {
        let res = await api.put("/easy_paisa/order/upgradeU", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.order && !res.data.error) {
            return res.data.order;
        } else dispatch(ModalProcess({ title: 'Upgrade Storage', text: 'Your storage could not be upgraded.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const trailFileO = data => async dispatch => {
    try {
        let res = await api.put("/registration/trail", data);
        if (res.data.org && !res.data.error) {
            dispatch(ModalProcess({ title: 'Free Trail', text: 'Your account has been sucessfully created.' }));
            history.push('/login');
        }
        else dispatch(ModalProcess({ title: 'Free Trail', text: 'Your account could not be created.', isErr: true }));
    } catch { dispatch(ModalProcess({ title: 'Free Trail', text: 'Your account could not be created.', isErr: true })); }
};

export const getCodes = () => async dispatch => {
    let resC = await Axios.get('https://restcountries.eu/rest/v2/all');

    if (resC.data && resC.data.length > 0) {
        let tempList = [];
        resC.data.map(i => {
            let data = {
                name: i.name,
                flag: i.flag,
                code: i.callingCodes && i.callingCodes[0] ? `+${i.callingCodes[0]}` : '+92'
            }
            return tempList.push(data);
        });

        dispatch({ type: codeConstants.CodeSuc, payload: tempList });
    }
};

export const getPackagesP = () => async dispatch => {
    let res = await apiP.get(`/account/packages`);
    if (res.data.packages && res.data.packages.length > 0) {
        dispatch({ type: packageConstants.PkgList, payload: res.data.packages });
    }
};

export const getPackages = () => async dispatch => {
    let res = await api.get(`/registration/packages`);
    if (res.data.pkgs && res.data.pkgs.length > 0) {
        dispatch({ type: packageConstants.PkgList, payload: res.data.pkgs });
    }
};

export const checkEmail = async (eM) => {
    let res = await api.get(`/registration/email`, { params: { email: eM } });
    if (res.data.isExist) return true;
    return false;
};


