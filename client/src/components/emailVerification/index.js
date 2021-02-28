import React, { lazy, Suspense, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import './style.css';
import { logOut } from '../../redux/actions/userActions';
import { sendMail, verifyUser } from '../../redux/actions/verificationAction';
import Email from '../../assets/static/email.svg';
const InputText = lazy(() => import('../inputs/inputText'));
const Loader = lazy(() => import('../loader/simpleLoader'));
const mB = { marginTop: '16px', marginBottom: '30px', width: '90%', fontSize: '14px', textAlign: 'center' };
const tS = { marginTop: '30px', width: '90%', textAlign: 'center', fontWeight: 700, color: '#0a3d62', fontSize: '16px' };
const eS = { marginTop: '16px', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const cMS = { marginTop: '12px', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' };
const cP = { cursor: 'pointer' };
const iT = { width: '100px', marginTop: '30px' };
const iB = { marginTop: '16px', width: '90%' };

const EmailReset = ({ sendMail, profile, logOut, isL, isErr, verifyUser }) => {
    const { _id, email } = profile.user;
    const [form, setForm] = useState({
        code: '', err: false
    });

    const { code, err } = form;

    useEffect(() => {
        var data = { userId: _id, email: email };
        sendMail(data);
    }, [_id, email, sendMail])

    const handleSubmit = e => {
        e.preventDefault();
        var data = { userId: _id, text: code };
        verifyUser(data);
    }

    const handleResend = e => {
        e.preventDefault();
        var data = { userId: _id, email: email };
        sendMail(data);
    }

    return <form className="col-12 p-0 em-h" onSubmit={e => handleSubmit(e)}>
        <div className="col-lg-4 col-10 em-sub">
            <div className="col-12 p-0" style={cMS}> <h6 style={cP} className="em-logout" onClick={e => logOut()}>Logout</h6> </div>
            <img src={Email} style={iT} alt='email' />
            <h6 style={tS}>A verification text has been sent to your email {profile.user.email}</h6>
            <Suspense fallback={<></>}>
                <InputText t={''} plh={`Enter verification text`} tp={'text'} val={code} handleInput={ e => setForm({ ...form, code: e.target.value, err: false })} err={err} />
            </Suspense>
            <button className="btn btn-block em-verify" style={iB} type={'submit'}>Verify {isL && <Suspense fallback={<></>}> <Loader /></Suspense>}</button>
            {isErr && <h6 style={eS}>Verification code is incorrect</h6>}
            <h6 style={mB}>Didn't receive email?<b className="em-resend" onClick={e => handleResend(e)}> Resend</b></h6>
        </div>
    </form>
};

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.verification.isL,
        isErr: state.verification.isErr
    }
};

export default connect(mapStateToProps, { verifyUser, sendMail, logOut })(EmailReset);