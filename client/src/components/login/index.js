import React, { useState, useEffect } from 'react';
import './style.css';
import { connect } from 'react-redux';
import { loginUser } from '../../redux/actions/userActions';
import Logo from '../../assets/logo.svg';
import Link from 'react-router-dom/Link';
import InputP from '../inputs/inputPass';
import InputT from '../inputs/inputText';
import Spinner from '../loader/simpleLoader';

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
    }

    return <form className="col-lg-4 col-md-8 col-sm-9 col-11 l-w" onSubmit={e => handleS(e)}>
        <div className="horz">
            <img src={Logo} alt="File Logo" className="logo" onClick={e => window.open('https://www.file-o.com')} style={{ cursor: 'pointer' }} />
            <h3 className="h font" onClick={e => window.open('https://www.file-o.com')} style={{ cursor: 'pointer' }} >File-O</h3>
        </div>
        <h5 className="sH">Login to your Account</h5>
        <InputT t={'EMAIL'} plh={'Enter email'} tp={'text'} val={eM} n="eM" handleInput={handleInput} err={eE} />
        <InputP t={'PASSWORD'} plh={'Enter password'} val={p} n="p" handleInput={handleInput} err={eP} />
        <div className="l-o">
            <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" defaultChecked={false} id="cR" value={cR} onChange={e => setCB()} />
                <label className="form-check-label" htmlFor="cR">Remember me</label>
            </div>
            <Link to='/reset/password' className="r-l">Forgot Password?</Link>
        </div>
        {isErr && !eE && !eP && <h5 className="eT">Email or password is incorrect</h5>}
        <button className="btn btn-block btn-info" type="submit"> Login  {isL && <Spinner />}</button>
        <h6 className="r-t-l">Don't have an account? <a href='https://demo1reg.file-o.com' target="_blank" rel="noopener noreferrer" className="r-l">Register here</a></h6>
    </form>
}

const mapStateToProps = state => { return { login: state.Login } };
export default connect(mapStateToProps, { loginUser })(Login);