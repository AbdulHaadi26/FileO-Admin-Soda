import React, { useState, useEffect } from 'react';
import './style.css';
import { connect } from 'react-redux';
import { loginUser } from '../../redux/actions/userActions';
import LoginImg from '../../assets/login/login-min.png';
import Logo from '../../assets/logo.svg';
import Link from 'react-router-dom/Link';
import InputP from '../inputs/inputPassL';
import InputT from '../inputs/inputTextL';
import Spinner from '../loader/simpleLoader';
import history from '../../utils/history';

const Login = ({ login, loginUser }) => {
    const [form, setForm] = useState({
        eM: '', p: '', cR: false, eE: false, eP: false,
        setCB: () => setForm(prevState => ({ ...prevState, cR: !cR })),
        setErr: (n, v) => setForm(prevState => ({ ...prevState, [n]: v })),
        handleInput: e => {
            let { name, value } = e.target;
            setForm(prevState => ({ ...prevState, [name]: value, [name === 'eM' ? 'eE' : 'eP']: false }));
        }
    }), [w, setW] = useState(0);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });


    const updateWindowDimensions = () => setW(window.innerWidth);

    const { isL, isErr } = login, { eM, p, cR, eE, eP, setCB, setErr, handleInput } = form;

    const handleS = e => {
        e.preventDefault();
        eM && p && loginUser({ email: eM, password: p, screen: w });
        !eM && setErr('eE', true); !p && setErr('eP', true);
    };

    return <div className="login-row">
        <div className="col-lg-6 col-12">
            <div className="col-12 l-w">
                <div className="horz">
                    <img src={Logo} alt="File Logo" className="logo" onClick={e => history.push(`/home`)} style={{ cursor: 'pointer' }} />
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginLeft: '12px', marginBottom: '-16px' }}>
                        <h1 className="h font" onClick={e => history.push(`/home`)} style={{ cursor: 'pointer' }} >File-O</h1>
                        <p>Workspace Collaboration {'&'} File Sharing</p>
                    </div>
                </div>
                <img src={LoginImg} style={{ width: '80%' }} alt="File-O" className="hidden" />
            </div>
        </div>
        <form className="col-lg-6 col-12" onSubmit={e => handleS(e)}>
            <div className="col-12 l-w al-f">
                <h2 style={{ fontWeight: '700', fontSize: '32px' }}>Get Started!</h2>
                <h5 className="sH">Sign in</h5>
                <InputT plh={'Email'} tp={'text'} val={eM} n="eM" handleInput={handleInput} err={eE} />
                <InputP t={'PASSWORD'} plh={'Enter password'} val={p} n="p" handleInput={handleInput} err={eP} />
                <div className="l-o" style={{ marginTop: '18px' }}>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" defaultChecked={false} id="cR" value={cR} onChange={e => setCB()} />
                        <label className="form-check-label" htmlFor="cR">Remember me</label>
                    </div>
                    <Link to='/reset/password' className="r-l">Forgot Password?</Link>
                </div>
                {isErr && !eE && !eP && <h5 className="eT">Email or password is incorrect</h5>}
                <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop:'18px' }}>
                    <button className="btn btn-login" type="submit">Sign In  {isL && <Spinner />}</button>
                    <h6 className="r-t-l">Don't have an account? <Link to={'/register'} className="r-l">Register here</Link></h6>
                </div>

            </div>
        </form>
    </div>

}

const mapStateToProps = state => { return { login: state.Login } };
export default connect(mapStateToProps, { loginUser })(Login);