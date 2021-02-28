import { rolesConstants, userConstants, catConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { RClr, RErr, RReq, RSuc, GRISuc, GRSuc } = rolesConstants;
const { CReq, CErr, CSuc, GCSuc } = catConstants;
const { GPErr } = userConstants;

export const registerRole = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.put("/roles/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.role && !res.data.error) {
            history.push(`/organization/${data._id}/role/list`);
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const clearRole = () => async dispatch => dispatch({ type: RClr });

export const fetchRoles = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.get(`/roles/fetchRoles`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.roleList && !res.data.error) {
            dispatch({ type: GRSuc, payload: res.data });
            dispatch({ type: RSuc });
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const fetchRolesSearch = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.get(`/roles/fetchRolesSearch`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.roleList && !res.data.error) {
            dispatch({ type: GRSuc, payload: res.data });
            dispatch({ type: RSuc });
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getRole = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        var res = await api.get(`/roles/getRole`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        if (res.data.role && !res.data.error) {
            dispatch({ type: GRISuc, payload: res.data });
            dispatch({ type: RSuc });
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateRole = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        var res = await api.post(`/roles/updateRole`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.role && !res.data.error) {
            dispatch({ type: GRISuc, payload: res.data });
            dispatch({ type: RSuc });
            dispatch(ModalProcess({ title: 'Role', text: !res.data.err ? 'Role details has been updated.' : 'Role details could not be updated.' }));
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateRoleCat = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.post(`/roles/updateRolesCat`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.role && !res.data.error) {
            dispatch({ type: GRISuc, payload: res.data });
            dispatch({ type: RSuc });
            dispatch(ModalProcess({ title: 'Role', text: 'Role details has been updated.' }));
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateRoleTag = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.post(`/roles/attachRoleAll`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.role && !res.data.error) {
            dispatch({ type: GRISuc, payload: res.data });
            dispatch({ type: RSuc });
            dispatch(ModalProcess({ title: 'Role', text: 'Role has been tagged to all the employees.' }));
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}


export const getCatSelect = (_id, catId) => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/category/getCats/${_id}`, { params: { catId }, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data.catList });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: GPErr }); }
}

export const deleteRole = (_id, id) => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        await api.delete(`/roles/deleteRole/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Role', text: 'Role has been deleted.' }));
        history.push(`/organization/${id}/role/list`);
    } catch { dispatch({ type: GPErr }); }
}