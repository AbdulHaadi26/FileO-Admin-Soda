import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { SetNav } from '../../redux/actions/navActions';
import Service from '../../assetsFile-O/service.png';
import './style.css';
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from 'react-router-dom';
import Container from '../../components/containers/containerFile-O';
import { getCodes, sendEmail } from '../../redux/actions/file-OActions';
import ReusableChatIcon from '../reusableChatIcon';
const eS = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };

const Contact = ({ SetNav, sendEmail, c, getCodes }) => {

    const recaptchaRef = React.createRef();

    const [form, setForm] = useState({
        name: '', email: '', message: ''
    }), [errCpt, setECPT] = useState(false), [CPT, setCPT] = useState(false);

    const [width, setWidth] = useState(0), [isN, setN] = useState(false);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });

    const updateWindowDimensions = () => setWidth(window.innerWidth);


    const handleInput = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submitForm = async e => {
        e.preventDefault();
        if (form.email && form.name && form.message && CPT) {
            await sendEmail(form);
            setForm({
                ...form, name: '', email: '', message: ''
            })
        } else if (!CPT) {
            setECPT(true);
        }
    };

    useEffect(() => {
        SetNav(3);
        getCodes();
    }, [SetNav, getCodes]);

    const onChange = value => {
        setCPT(value);
        errCpt && setECPT(false);
    };


    return <div className="container-fluid">
        <div className="row p-0">
            {(width >= 992 || !isN) && <Container setN={setN} width={width}>
                <div className="contact">
                    <div className="mid" style={{ alignItems: 'flex-start' }}>
                        <div className="col-lg-6 contact-row">
                            <h3>Get in Touch!</h3>
                            <h5 style={{ fontSize: '20px' }}>Contact our Sales Team NOW.</h5>
                            <h5 style={{ fontSize: '16px' }}>We'd love to Help you!</h5>
                            <img src={Service} alt="Contact Us" />
                            <h5 style={{ fontSize: '16px' }}>
                                View our <Link style={{ textDecoration: 'none' }} to="/pricing/redirect/1">Frequently Asked Questions</Link>
                                <br />
                                if you're looking for support or help.
                            </h5>
                        </div>
                        <div className="col-lg-6 contact-row">
                            <form className="form col-lg-9 col-12" onSubmit={submitForm}>
                                <div className="col-12">
                                    <h6 className="h">Name<span style={{ color: 'red' }}>*</span></h6>
                                    <div className="input-group shadow">
                                        <input type="text" className="form-control" style={{ width: '100%' }} placeholder="" required
                                            value={form.name} name="name" onChange={e => handleInput(e)}
                                        />
                                    </div>
                                </div>

                                <div className="col-12" style={{ marginTop: '4px' }}>
                                    <h6 className="h">Email<span style={{ color: 'red' }}>*</span></h6>
                                    <div className="input-group shadow">
                                        <input type="email" className="form-control" style={{ width: '100%' }} placeholder="" required
                                            value={form.email} name="email" onChange={e => handleInput(e)}
                                        />
                                    </div>
                                </div>


                                <div className="col-12" style={{ marginTop: '4px' }}>
                                    <h6 className="h">Message</h6>
                                    <div className="form-group shadow" style={{ width: '100%', borderRadius: '20px' }}>
                                        <textarea className="form-control" rows="3" style={{ width: '100%', resize: 'none', padding: '12px 12px', borderRadius: '20px' }} required
                                            value={form.message} name="message" onChange={e => handleInput(e)}
                                        ></textarea>
                                    </div>
                                </div>


                                <div className="col-12" style={{ marginTop: '4px' }}>
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey="6LcrDxIaAAAAAA_CfQ8MqMYZFOZn_yCztQ2mbhvk"
                                        onChange={onChange}
                                        onExpired={onChange}
                                    />
                                    {errCpt && <div style={eS}>Please verify you are not a robot by clicking the checkbox.</div>}
                                </div>

                                <div className="col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px' }}>
                                    <button className="btn btn-submit" type="submit">Submit</button>
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

export default connect(mapStateToProps, { SetNav, sendEmail, getCodes })(Contact);