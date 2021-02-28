import { ticketConstants, userConstants, fileConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import axios from 'axios';
import { ModalProcess } from "./profileActions";
const { TClr, TErr, TReq, TSuc, TLSuc, TGSuc } = ticketConstants;
const { FUpt, FClr, FSuc } = fileConstants;
const { GPErr } = userConstants;

export const registerTicketImage = (data, file) => async dispatch => {
    try {
        dispatch({ type: TReq });
        Token();
        var res = await api.put("/ticket/registerWithAttachment", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.ticket && res.data.url && !res.data.error) {
            dispatch(uploadFile(file, res.data.url, res.data.ticket));
        }
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch({ type: TSuc });
            history.push(`/organization/${data.org}/upload/limit`);
        }
        else dispatch({ type: TErr });
    } catch { dispatch({ type: GPErr }); }
}

export const uploadFile = (file, url, ticket) => async dispatch => {
    try {
        Token();
        var percentCheck = 1;
        var type = ticket.url.split('.').slice(-1);
        var fData = { name: `TC-${ticket._id}`, size: ticket.size, type: type };
        await axios.put(url, file, {
            onUploadProgress: function (progressEvent) {
                percentCheck = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                dispatch({ type: FUpt, payload: percentCheck, payloadExtra: fData });
            }
        });
    } catch { dispatch({ type: GPErr }); }
}

export const clearFile = org => dispatch => {
    dispatch({ type: FClr });
    dispatch({ type: FSuc });
    history.push(`/organization/${org}/support`);
}

export const clear = () => dispatch => {
    dispatch({ type: FClr });
    dispatch({ type: FSuc });
}

export const registerTicket = (data, org) => async dispatch => {
    try {
        dispatch({ type: TReq });
        Token();
        var res = await api.put("/ticket/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.ticket && !res.data.error) history.push(`/organization/${org}/support`);
        else dispatch({ type: TErr });
    } catch { dispatch({ type: GPErr }); }
}

export const clearTicket = () => async dispatch => dispatch({ type: TClr });

const tickList = { data: [], count: 0 };

export const fetchTicket = data => async dispatch => {
    try {
        dispatch({ type: TReq });
        Token();
        const p1 = api.get("/ticket/getTickets", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/ticket/getTicketCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res1.data.tickets && res2.data.ticketCount !== null && !res1.data.error && !res2.data.error) {
            tickList.data = res1.data.tickets;
            tickList.count = res2.data.ticketCount
            dispatch({ type: TLSuc, payload: tickList });
            dispatch({ type: TSuc });
        }
        else dispatch({ type: TErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchTicketSearch = data => async dispatch => {
    try {
        dispatch({ type: TReq });
        Token();
        const p1 = api.get("/ticket/searchTickets", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/ticket/searchTicketCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res1.data.tickets && res2.data.ticketCount !== null && !res1.data.error && !res2.data.error) {
            tickList.data = res1.data.tickets;
            tickList.count = res2.data.ticketCount
            dispatch({ type: TLSuc, payload: tickList });
            dispatch({ type: TSuc });
        }
        else dispatch({ type: TErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getTicket = _id => async dispatch => {
    try {
        dispatch({ type: TReq });
        Token();
        var res = await api.get(`/ticket/getTicket/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.ticket && !res.data.error) {
            dispatch({ type: TGSuc, payload: res.data.ticket });
            dispatch({ type: TSuc });
        } else dispatch({ type: TErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateTicket = data => async dispatch => {
    try {
        dispatch({ type: TReq });
        Token();
        var res = await api.post("/ticket/updateTicket", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.ticket && !res.data.error) {
            dispatch({ type: TGSuc, payload: res.data.ticket });
            dispatch({ type: TSuc });
            dispatch(ModalProcess({ title: 'Ticket', text: 'Ticket details has been updated.' }));
        } else dispatch({ type: TErr });
    } catch { dispatch({ type: GPErr }); }
}

export const deleteTicket = (_id, org) => async dispatch => {
    try {
        dispatch({ type: TReq });
        Token();
        await api.post(`/ticket/deleteTicket/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Ticket', text: 'Ticket details has been deleted.' }));
        history.push(`/organization/${org}/support`);
    } catch { dispatch({ type: GPErr }); }
}

export const removeAttachment = data => async dispatch => {
    try {
        dispatch({ type: TReq });
        Token();
        var res = await api.post(`/ticket/removeAttachment`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.ticket && !res.data.error) {
            dispatch({ type: TGSuc, payload: res.data.ticket });
            dispatch({ type: TSuc });
        } else dispatch({ type: TErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateAttachment = (data, file) => async dispatch => {
    try {
        dispatch({ type: TReq });
        Token();
        var res = await api.post("/ticket/updateAttachment", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.ticket && res.data.url && !res.data.error) {
            dispatch(uploadFile(file, res.data.url, res.data.ticket));
        }
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch({ type: TSuc });
            history.push(`/organization/${data.org}/upload/limit`);
        }
        else dispatch({ type: TErr });
    } catch { dispatch({ type: GPErr }); }
}
