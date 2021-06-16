import React, { lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import './style.css';
import { sendPassMail } from '../../redux/actions/verificationAction';
import Email from '../../assets/static/email.svg';
const InputText = lazy(() => import('../inputs/inputText'));
const Loader = lazy(() => import('../loader/simpleLoader'));
const iT = { width: '100px', marginTop: '30px' };
const iB = { marginTop: '16px', width: '90%' };

const EmailVerify = ({ isL, sendPassMail, isSuc, isErr }) => {
    const [form, setForm] = useState({
        email: ''
    });

    const handleSubmit = e => {
        e.preventDefault();
        if (!form.email) return setForm({ ...form, err: true });
        let data = { email: form.email };
        sendPassMail(data);
    };

    return <form className="col-12 p-0 em-h" onSubmit={e => handleSubmit(e)}>
        <div className="col-lg-4 col-10 em-sub">
            <img src={Email} style={iT} alt='email' />
            {(!isSuc && !isErr) && <>
                <Suspense fallback={<></>}>
                    <InputText t={''} plh={`Enter email`} tp={'text'} val={form.email} handleInput={e => setForm({ ...form, email: e.target.value, err: false })} err={form.err} />
                </Suspense>
                <button className="btn btn-block em-verify" style={iB} type={'submit'}>Send Link {isL && <Suspense fallback={<></>}> <Loader /></Suspense>}</button>
            </>}
            {!isL && isSuc && <h6 style={{ fontWeight: '600', fontSize: '14px', color: 'green', marginTop: '12px', textAlign:'center' }}>A password reset link has been sent to your account {form.email}.</h6>}
            {!isL && !isSuc && isErr && <h6 style={{ fontWeight: '600', fontSize: '14px', color: 'red', marginTop: '12px', textAlign:'center' }}>User with this email does not exist.</h6>}
        </div>
    </form>
};

const mapStateToProps = state => {
    return {
        isL: state.Reset.isL,
        isErr: state.Reset.isErr,
        isSuc: state.Reset.isSuc
    }
};

export default connect(mapStateToProps, { sendPassMail })(EmailVerify);