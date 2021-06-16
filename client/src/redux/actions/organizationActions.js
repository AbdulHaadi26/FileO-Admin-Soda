import { organizationConstants, userConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import axios from 'axios';
import { ModalProcess } from "./profileActions";
import { logOut, billMessage } from "./userActions";
const { GPSuc } = userConstants;
const { GOIErr, GOIReq, GOISuc, GPISuc, GPBill } = organizationConstants;

export const getOrganization = () => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();

        let billData = await billMessage();

        let res = await api.get(`/organization/getOrganization`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });

        if (res.data.org && !res.data.error && res.data.org.isTrail && res.data.org.trail_end_date) {
            let date1 = new Date(res.data.org.trail_end_date);
            let date2 = new Date(Date.now());

            let Difference_In_Time = date1.getTime() - date2.getTime();
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

            let daysLeft = Math.floor(Difference_In_Days);
            daysLeft = daysLeft < 0 ? 0 : daysLeft;

            if (daysLeft <= 7) {
                if (daysLeft <= 0) res.data.org.isDisabled = true;
                dispatch(billingReminder(1));
            }
        }

        if (res.data.org && !res.data.error) {
            res.data.org.isMessage = billData.isMessage;
            res.data.org.isDisabled = billData.isDisabled;
            dispatch({ type: GOISuc, payload: res.data });
        } else dispatch({ type: GOIErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getOrganizationB = (billData) => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        let res = await api.get(`/organization/getOrganization`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });

        if (res.data.org && !res.data.error && res.data.org.isTrail && res.data.org.trail_end_date) {
            let date1 = new Date(res.data.org.trail_end_date);
            let date2 = new Date(Date.now());

            let Difference_In_Time = date1.getTime() - date2.getTime();
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

            let daysLeft = Math.floor(Difference_In_Days);
            daysLeft = daysLeft < 0 ? 0 : daysLeft;

            if (daysLeft <= 7) {
                if (daysLeft <= 0) res.data.org.isDisabled = true;
                dispatch(billingReminder(1));
            }
        }

        if (res.data.org && !res.data.error) {
            res.data.org.isMessage = billData.isMessage;
            res.data.org.isDisabled = billData.isDisabled;
            dispatch({ type: GOISuc, payload: res.data });
        } else dispatch({ type: GOIErr });

    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const downgradePackage = (data) => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        let billData = await billMessage();
        let res = await api.post(`/organization/downgradePackage`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.org && !res.data.error) {
            res.data.org.isMessage = billData.isMessage;
            res.data.org.isDisabled = billData.isDisabled;
            dispatch({ type: GOISuc, payload: res.data });
            dispatch(ModalProcess({ title: 'Downgrade Storage', text: 'An email has been sent to File-O support about your request. Our representative will get back to you within 24 hours.' }));
        } else {
            dispatch(ModalProcess({ title: 'Downgrade Storage', text: 'Your package could not be downgraded.', isErr: true }));
            dispatch({ type: GOIErr })
        }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getLowerPackageCount = (data) => async dispatch => {
    try {
        Token();
        let res = await api.get(`/organization/packagesCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error && res.data.count) return res.data.count;
        else return 0;
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const generateOrderUpt = data => async dispatch => {
    try {
        let res = await api.put("/easy_paisa/order/upgrade", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.order && !res.data.error) {
            return res.data.order;
        } else dispatch(ModalProcess({ title: 'Upgrade Storage', text: 'Your storage could not be upgraded.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const generateTrialOrder = data => async dispatch => {
    try {
        let res = await api.put("/easy_paisa/order/trial", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.order && !res.data.error) {
            return res.data.order;
        } else dispatch(ModalProcess({ title: 'Upgrade Storage', text: 'Your storage could not be upgraded.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const transactionStatus = data => async dispatch => {
    try {
        let res = await api.put("/easy_paisa/transaction", data);
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Transaction Status', text: 'Your transaction have been completed successfully' }));
        } else dispatch(ModalProcess({ title: 'Transaction Status', text: 'We could not update your order. Please check again in 10 mins.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const getPackages = (data) => async dispatch => {
    try {
        Token();
        var res = await api.get(`/organization/packages`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.packages && !res.data.error ? dispatch({ type: GPISuc, payload: res.data.packages }) : dispatch({ type: GOIErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getPackage = (data) => async dispatch => {
    try {
        Token();
        let res = await api.get(`/organization/getPackage/${data._id}`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        return res.data;
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getOrganizationS = () => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        let billData = await billMessage();
        var res = await api.get(`/organization/getOrganizationS`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.org && !res.data.error) {
            res.data.org.isMessage = billData.isMessage;
            res.data.org.isDisabled = billData.isDisabled;
            dispatch({ type: GOISuc, payload: res.data })
        } else dispatch({ type: GOIErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const updateOrganization = data => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        let billData = await billMessage();
        let res = await api.post("/organization/updateOrganization", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.org && !res.data.error) {
            res.data.org.isMessage = billData.isMessage;
            res.data.org.isDisabled = billData.isDisabled;
            dispatch({ type: GOISuc, payload: res.data });
            dispatch(ModalProcess({ title: 'Organization', text: 'Organization details has been updated.' }));
        } else dispatch({ type: GOIErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};


export const downgradeUser = data => async dispatch => {
    try {
        Token();
        let billData = await billMessage();
        let res = await api.post("/organization/downgrade", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.org && !res.data.error) {
            res.data.org.isMessage = billData.isMessage;
            res.data.org.isDisabled = billData.isDisabled;
            dispatch({ type: GOISuc, payload: res.data });
            dispatch(ModalProcess({ title: 'User Downgrade', text: 'Users count have been downgraded.' }));
        } else dispatch(ModalProcess({ title: 'User Downgrade', text: 'Users count could not be downgraded.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}


export const billingReminder = num => async dispatch => {
    dispatch({ type: GPBill, payload: Number(num) });
};

export const updateOrganizationImage = (data, file, _id) => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        let billData = await billMessage();
        var res1 = await api.post(`/organization/imageUrl/sign`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res1.data.key && res1.data.url && !res1.data.error) {
            await axios.put(res1.data.url, file);
            let orgData = { _id: _id, key: res1.data.key };
            let res = await api.post(`/organization/uploadImage`, orgData, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
            if (res.data.org && !res.data.error) {
                res.data.org.isMessage = billData.isMessage;
                res.data.org.isDisabled = billData.isDisabled;
                dispatch({ type: GOISuc, payload: res.data })
            } else dispatch({ type: GOIErr });

            if (res.data.user) {
                res.data.user.isMessage = billData.isMessage;
                res.data.user.isDisabled = billData.isDisabled;
                if (res.data.user.current_employer) {
                    res.data.user.current_employer.isMessage = billData.isMessage;
                    res.data.user.current_employer.isDisabled = billData.isDisabled;
                }
                dispatch({ type: GPSuc, payload: { user: res.data.user } });
            }
            dispatch(ModalProcess({ title: 'Organization', text: 'Organization details has been updated.' }));
        } else dispatch({ type: GOIErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}
