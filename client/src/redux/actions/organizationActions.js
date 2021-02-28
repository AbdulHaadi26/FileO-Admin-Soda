import { organizationConstants, userConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import axios from 'axios';
import { ModalProcess } from "./profileActions";
const { GPErr, GPSuc, GDReq } = userConstants;
const { GOIErr, GOIReq, GOISuc, GPISuc } = organizationConstants;

export const getOrganization = () => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        var res = await api.get(`/organization/getOrganization`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.org && !res.data.error ? dispatch({ type: GOISuc, payload: res.data }) : dispatch({ type: GOIErr });
    } catch { dispatch({ type: GOIErr }); }
}

export const updateOrganizationPackage = (data) => async dispatch => {
    try {
        dispatch({ type: GDReq });
        Token();
        await api.post(`/organization/updatePackage`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(getOrganization());
    } catch { dispatch({ type: GPErr }); }
}

export const getPackages = (data) => async dispatch => {
    try {
        Token();
        var res = await api.get(`/organization/packages`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.packages && !res.data.error ? dispatch({ type: GPISuc, payload: res.data.packages }) : dispatch({ type: GOIErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getOrganizationS = () => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        var res = await api.get(`/organization/getOrganizationS`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.org && !res.data.error ? dispatch({ type: GOISuc, payload: res.data }) : dispatch({ type: GOIErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateOrganization = data => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        var res = await api.post("/organization/updateOrganization", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.org && !res.data.error) {
            dispatch({ type: GOISuc, payload: res.data });
            dispatch(ModalProcess({ title: 'Organization', text: 'Organization details has been updated.' }));
        } else dispatch({ type: GOIErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateOrganizationImage = (data, file, _id) => async dispatch => {
    try {
        dispatch({ type: GOIReq });
        Token();
        var res1 = await api.post(`/organization/imageUrl/sign`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res1.data.key && res1.data.url && !res1.data.error) {
            await axios.put(res1.data.url, file);
            var orgData = { _id: _id, key: res1.data.key };
            var res = await api.post(`/organization/uploadImage`, orgData, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
            res.data.org && !res.data.error ? dispatch({ type: GOISuc, payload: res.data }) : dispatch({ type: GOIErr });
            res.data.user && dispatch({ type: GPSuc, payload: { user: res.data.user } });
            dispatch(ModalProcess({ title: 'Organization', text: 'Organization details has been updated.' }));
        } else dispatch({ type: GOIErr });
    } catch { dispatch({ type: GPErr }); }
}
