import React, { lazy, Suspense, useState } from 'react';
import './style.css';
import Axios from 'axios';
import { baseUrl } from '../../utils/api';
const InputText = lazy(() => import('../inputs/inputText'));
const InputPassword = lazy(() => import('../inputs/inputPass'));
const Loader = lazy(() => import('../loader/simpleLoader'));
const iB = { marginTop: '16px', width: '90%' };
const eS = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const cS = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#0a3d62', fontSize: '12px' };

export default ({ token }) => {
    const [form, setForm] = useState({
        password: '', cp: '', errP: false, errPA: false,
        errCP: false, errCFP: false
    }), [loader, setLoader] = useState({
        isL: false, isSuc: false, isErr: false
    });

    // eslint-disable-next-line
    const rP = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const reWS = /\s/g;


    const handleSubmit = async e => {
        e.preventDefault();
        if (form.password && form.cp && form.cp !== form.password) return setForm({ ...form, errCFP: true });
        if (!rP.test(form.password) || reWS.test(form.password)) return setForm({ ...form, errPA: true });
        let data = { password: form.password };
        setLoader({ isSuc: false, isErr: false, isL: true });
        const res = await Axios.post(`${baseUrl}/api/verification/reset/password/${token}`, data);
        if (res.data.success && !res.data.error) setLoader({ isSuc: true, isL: false, isErr: false });
        else setLoader({ isSuc: false, isL: false, isErr: true });
    }

    return <form className="col-12 p-0 em-h" onSubmit={e => handleSubmit(e)}>
        <div className="col-lg-4 col-10 em-sub">
            <h5 className="sH" style={{ fontSize: '24px', fontWeight: '700', color: 'green' }}>Reset Password</h5>
            {!loader.isL && loader.isSuc && <div style={cS}>Password has been updated sucessfully. <a href={`${baseUrl}`}>Click here to Login.</a></div>}
            {(!loader.isSuc && !loader.isErr) && <>
                <Suspense fallback={<></>}>
                    <InputPassword t={''} plh={`Enter password`} tp={'password'} val={form.password} handleInput={e => setForm({ ...form, password: e.target.value, errP: false, errPA: false, errCFP: false })} err={form.errP} />
                    <InputText t={''} plh={`Confirm Password`} tp={'password'} val={form.cp} handleInput={e => setForm({ ...form, cp: e.target.value, errCP: false, errPA: false, errCFP: false })} err={form.errCP} />
                </Suspense>
                {!loader.isErr && form.errPA && <div style={eS}>Passwords should be minimum 8 characters with one numeric, one capital and one special character.</div>}
                {!loader.isErr && form.errCFP && <div style={eS}>Passwords didn't match.</div>}
                {loader.isErr && <div style={eS}>Passwords could not be updated.</div>}
                <button className="btn btn-block em-verify" style={iB} type={'submit'}>Reset Password {loader.isL && <Suspense fallback={<></>}> <Loader /></Suspense>}</button>
            </>}
        </div>
    </form>
};
