import { userConstants, fileConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { FReq, FErr, FSuc, GFSuc } = fileConstants;
const { GPErr } = userConstants;

export const AddToF = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/favourite/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });

        dispatch(ModalProcess({ title: 'Favorites', text: 'File has been added to favorites.' }));
    } catch { dispatch({ type: GPErr }); }
}

export const DelToF = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/favourite/delete", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Favorites', text: 'File has been removed from favorites.' }));
    } catch { dispatch({ type: GPErr }); }
}

export const fetchCombined = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.get("/favourite/getCombined", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc });
        }
        else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
};
