import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import './style.css';
import ReCAPTCHA from "react-google-recaptcha";
import Checked from '../../assetsFile-O/Tick.svg';
import Container from '../../components/containers/containerFile-O';
import { Link } from 'react-router-dom';
import { checkEmail, getCodes } from '../../redux/actions/file-OActions';
import { trailFileO } from '../../redux/actions/personal/file-OActions';
import ReusableChatIcon from '../reusableChatIcon';
import Eye from '../../assets/eye.svg';
import EyeS from '../../assets/hidden.svg';

const eS = {
    marginTop: '16px', marginBottom: '12px', marginLeft: '1%',
    width: '89%', textAlign: 'left', fontWeight: 700,
    color: '#b33939', fontSize: '12px'
};

// eslint-disable-next-line
const reCE = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
const reWS = /\s/g;
const re = /^[0-9\b]+$/;
const rN = /^[a-zA-Z -]*$/;
// eslint-disable-next-line
const rP = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const Contact = ({ c, trailFileO, getCodes }) => {

    const recaptchaRef = React.createRef();

    const [width, setWidth] = useState(0), [isN, setN] = useState(false), [Sp, setShowP] = useState(false);

    useEffect(() => {
        async function fetch() {
            await getCodes();
        }

        fetch();
    }, [getCodes]);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });

    const updateWindowDimensions = () => setWidth(window.innerWidth);

    const [fn, setFN] = useState(''), [ln, setLN] = useState(''), [p, setP] = useState(''), [cp, setCP] = useState(''),
        [eM, setEM] = useState(''), [LO, setLO] = useState('Afghanistan'),
        [cO, setCO] = useState(''), [code, setCode] = useState('+93'),
        [errEME, setErrME] = useState(false),
        [errEM, setErrEM] = useState(false), [errP, setErrP] = useState(false), [errPA, setErrPA] = useState(false),
        [capt, setCPT] = useState(false), [errCpt, setECPT] = useState(false),
        [cBTerm, setCBTerm] = useState(false);

    const handleCBTerm = e => setCBTerm(e.target.checked);

    const submitForm = async e => {
        e.preventDefault();
        if (!reCE.test(eM) || reWS.test(eM)) return setErrEM(true);
        if (p && cp && cp !== p) return setErrP(true);
        if (!rP.test(p) || reWS.test(p) || p === eM) return setErrPA(true);
        //if (!capt) return setECPT(true);
        if ((reCE.test(eM) && !reWS.test(eM)) && (rP.test(p) && !reWS.test(p) && p !== eM) && !capt) {
            let resE = await checkEmail(eM);
            if (resE) return setErrME(true);

            let data = {
                name: `${fn} ${ln}`, email: eM, password: p, contact: cO, code, country: LO
            };

            await trailFileO(data);
        }
    };

    const handleFN = e => {
        if (rN.test(e.target.value) || e.target.value === '')
            setFN(e.target.value);
    };

    const handleLN = e => {
        if (rN.test(e.target.value) || e.target.value === '')
            setLN(e.target.value);
    };

    const handleP = e => {
        setP(e.target.value);
        errP && setErrP(false);
        errPA && setErrPA(false);
    };

    const handleCP = e => {
        setCP(e.target.value);
        errP && setErrP(false);
        errPA && setErrPA(false);
    };

    const handleEM = e => {
        setEM(e.target.value);
        errEM && setErrEM(false);
        errEME && setErrME(false);
    };

    const handleCO = e => {
        if (re.test(e.target.value) || e.target.value === '')
            setCO(e.target.value);
    };

    const handleLO = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) {
            setLO(e.target.options[selectedIndex].getAttribute('data-key'));
            setCode(e.target.options[selectedIndex].getAttribute('data-code'));
        }
    };

    const onChange = value => {
        setCPT(value);
        errCpt && setECPT(false);
    };

    return <div className="container-fluid">
        <div className="row p-0">
            {(width >= 992 || !isN) && <Container setN={setN} width={width}>
                <div className="contact">
                    <div className="mid" style={{ alignItems: 'flex-start' }}>
                        <div className="col-lg-5 contact-row">
                            <div className="col-12">
                                <h3 style={{ width: 'fit-content', fontSize: '30px', borderBottom: 'solid 1px black', paddingBottom: '24px', marginTop: '24px' }}>Start your 30-day free trial</h3>
                            </div>
                            <div className="col-12">
                                <h5 style={{ width: '100%', fontSize: '24px', marginTop: '36px', fontWeight: '600', color: '#173dff' }}>WHAT'S INCLUDED IN FREE TRAIL?</h5>
                            </div>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                {[
                                    "Full access to File-O for 30-days",
                                    "Space for your team to share and collaborate",
                                    "Advance sharing and collaboration tools",
                                    "Admin controls for additional security"
                                ].map((i, k) => <div key={k} className="col-12" style={{ marginTop: '16px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <img src={Checked} alt="Checked" style={{ width: '24px', height: '24px' }} />
                                    <h6 style={{ marginLeft: '8px', fontSize: '16px', fontWeight: '500', marginBottom: '0px' }}>{i}</h6>
                                </div>)}
                            </div>
                        </div>
                        <div className="col-lg-7 contact-row">
                            <form className="form" onSubmit={submitForm}>
                                <div className="col-12">
                                    <h5 style={{ fontSize: '20px', fontWeight: '600' }}>Your Information</h5>
                                    <p style={{ fontSize: '14px', color: 'black' }}>You'll be the File-O account admin since you are creating the account.</p>
                                </div>
                                <div className="col-lg-6 col-12" style={{ marginTop: '12px' }}>
                                    <h6 className="h">First Name<span style={{ color: 'red' }}>*</span></h6>
                                    <div className="input-group shadow">
                                        <input type="text" className="form-control" style={{ width: '100%' }} placeholder="" required
                                            value={fn} name="fname" onChange={e => handleFN(e)}
                                        />
                                    </div>
                                </div>

                                <div className="col-lg-6 col-12" style={{ marginTop: '12px' }}>
                                    <h6 className="h">Last Name<span style={{ color: 'red' }}>*</span></h6>
                                    <div className="input-group shadow">
                                        <input type="text" className="form-control" style={{ width: '100%' }} placeholder="" required
                                            value={ln} name="lname" onChange={e => handleLN(e)}
                                        />
                                    </div>
                                </div>

                                <div className="col-12" style={{ marginTop: '12px' }}>
                                    <h6 className="h">Email<span style={{ color: 'red' }}>*</span></h6>
                                    <div className="input-group shadow">
                                        <input type="email" className="form-control" style={{ width: '100%' }} placeholder="" required
                                            value={eM} name="email" onChange={e => handleEM(e)}
                                        />
                                    </div>
                                    {errEME && <div style={eS}>User with this email already exists.</div>}
                                </div>

                                <div className="col-lg-6 col-12" style={{ marginTop: '12px' }}>
                                    <h6 className="h">Password<span style={{ color: 'red' }}>*</span></h6>
                                    <div className="input-group shadow">
                                        <input type={Sp ? 'text' : 'password'} className="form-control" style={{ width: '100%' }} placeholder="" required
                                            value={p} name="password" onChange={e => handleP(e)}
                                        />
                                        <div className="input-group-append" onClick={e => setShowP(!Sp)}> <span className="input-group-text" style={{ borderRadius: '20px 1000px 1000px 20px' }}>
                                            <div style={{ width: '16px', height: '16px', backgroundImage: `url('${!Sp ? Eye : EyeS}')` }} />
                                        </span>
                                        </div>
                                    </div>
                                    {errPA && <div style={eS}>Passwords should be minimum 8 characters with one numeric, one capital and one special character.</div>}
                                </div>

                                <div className="col-lg-6 col-12" style={{ marginTop: '12px' }}>
                                    <h6 className="h">Confirm Password<span style={{ color: 'red' }}>*</span></h6>
                                    <div className="input-group shadow">
                                        <input type="password" className="form-control" style={{ width: '100%' }} placeholder="" required
                                            value={cp} name="password" onChange={e => handleCP(e)}
                                        />
                                    </div>
                                    {errP && <div style={eS}>Passwords didn't match.</div>}
                                </div>


                                <div className="col-lg-6 col-12" style={{ marginTop: '12px' }}>
                                    <h6 className="h">Country<span style={{ color: 'red' }}>*</span></h6>
                                    <select className="form-control shadow" onChange={e => handleLO(e)}>
                                        {c && c.length > 0 && c.map(i => <option key={i.name} data-key={i.name} data-code={i.code}>{i.name} ({i.code})</option>)}
                                    </select>
                                </div>

                                <div className="col-lg-6 col-12" style={{ marginTop: '12px' }}>
                                    <h6 className="h">Contact</h6>
                                    <div className="input-group shadow">
                                        <div class="input-group-prepend">
                                            <span class="input-group-text" style={{ borderRadius: '1000px 20px 20px 1000px' }}>{code}</span>
                                        </div>
                                        <input type="text" className="form-control" style={{ width: '100%' }} placeholder=""
                                            value={cO} name="orgName" onChange={e => handleCO(e)}
                                        />
                                    </div>
                                </div>

                                <div className="col-12" style={{ marginTop: '24px' }}>
                                    <h5 style={{ fontSize: '20px', fontWeight: '600' }}>Make Your Plan</h5>
                                    <p style={{ fontSize: '14px', color: 'black' }}>You can later change user/storage from your File-O administrator account.</p>
                                </div>

                                <div className="col-lg-6 col-12" style={{ marginTop: '12px' }}>
                                    <h6 className="h">Storage Size<span style={{ color: 'red' }}>*</span></h6>
                                    <div className="input-group shadow">
                                        <input type="number" disabled min={2} max={5000} step={50} className="form-control" style={{ width: '100%' }} placeholder="" required
                                            value={2} name="orgName"
                                        />
                                        <div class="input-group-append">
                                            <span class="input-group-text" style={{ borderRadius: '20px 1000px 1000px 20px' }}>GB</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-6 col-12" style={{ marginTop: '12px' }}>
                                    <h6 className="h">Total Price</h6>
                                    <div className="input-group shadow">
                                        <input type="text" disabled className="form-control" style={{ width: '100%' }} placeholder="" required
                                            value={`${0}`}
                                        />
                                        <div class="input-group-append">
                                            <span class="input-group-text" style={{ borderRadius: '20px 1000px 1000px 20px' }}>PKR</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12" style={{ marginTop: '12px' }}>
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey="6LcrDxIaAAAAAA_CfQ8MqMYZFOZn_yCztQ2mbhvk"
                                        onChange={onChange}
                                        onExpired={onChange}
                                    />
                                    {errCpt && <div style={eS}>Please verify you are not a robot by clicking the checkbox.</div>}
                                </div>

                                <div className="form-check" style={{ marginTop: '24px', marginLeft: '16px' }}>
                                    <input type="checkbox" className="form-check-input" id="eC1" checked={cBTerm} onChange={e => handleCBTerm(e)} required />
                                    <label className="form-check-label" style={{ marginLeft: '12px' }} htmlFor="eC1">I have read File-O <Link to={`/privacy-policy`}>Privacy Policy</Link> and agree to the File-O Terms.</label>
                                </div>

                                <div className="col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px' }}>
                                    <button className="btn btn-submit" type="submit">Start Free Trail</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Container>}
        </div>
        <ReusableChatIcon />
    </div>
};

const mapStateToProps = state => {
    return {
        c: state.Code.codes
    }
};

export default connect(mapStateToProps, { getCodes, trailFileO })(Contact);