import React, { useState } from 'react';
import Link from 'react-router-dom/Link';
import './style.css';
import Logo from '../../assets/logo.svg';
import { connect } from 'react-redux';
import { ModalProcess } from '../../redux/actions/profileActions';

const Footer = ({ ModalProcess }) => {

    const [email, setEmail] = useState('');

    return <div className="footer-wrapper-re">
        <div className="footer-re">
            <div className="col-lg-4 col-12 footer-col-re">
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <img src={Logo} style={{ width: '37px', height: '50px' }} alt="File-O Logo" />
                    <h3 style={{ fontSize: '20px', color: 'black', marginBottom: '-8px', marginLeft: '12px', fontWeight: '400' }}>File-O</h3>
                </div>
                <p style={{ color: 'black', fontSize: '14px', fontWeight: '400' }}>File-O is a file management, work-space collaboration and storage solution that provides synchronized services across multiple devices to teams and organizations of any size.</p>
                <h6 style={{ color: 'black', marginTop: '12px', fontWeight: '400', fontSize: '12px' }}>Office # 1/E, Sector F, DHA Business Bay, DHA, Islamabad</h6>
            </div>
            <div className="col-lg-4 col-12 footer-col-re">
                <h4>About</h4>
                <Link className={`link`} style={{ marginTop: '24px' }} to='/home'>Home</Link>
                <Link className={`link`} to='/pricing'>Plans {'&'} Pricing</Link>
                <Link className={`link`} to='/contact'>Contact Sales</Link>
            </div>
            <form onSubmit={e => {
                e.preventDefault();
                email && ModalProcess({ title: 'News Letter', text: 'Thank you for registering.' });
            }} className="col-lg-4 col-12 footer-col-re">
                <h4>Newsletter</h4>
                <div className="input-foot" style={{ display: 'flex', flexDirection: 'row', marginTop: '24px', backgroundColor: '#fff', maxWidth: '100%' }}>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ marginLeft: '8px', padding: '4px 12px', backgroundColor: 'white', color: 'black', border: 'none', outline: 'none', width:'70%' }}></input>
                    <button type="submit" style={{
                        padding: '0px 12px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', border: 'none', backgroundColor: '#fff', color: '#3AAED5', fontWeight: '400', fontSize: '16px'
                    }}>Subscribe</button>
                </div>
                <h5 className="subhead" style={{ marginTop: '24px' }}>Register your email for our daily news.</h5>
            </form>
        </div>
        <hr className="col-12 p-0" style={{ backgroundColor: '#9e9e9e' }} />
        <div className="footer-re" style={{ padding: '12px 30px' }}>
            <h5 className="subhead mr-auto">&#169; Copyright <span style={{ color: 'black' }}>Cware Technologies</span>. All Rights Reserved.</h5>
        </div>
    </div>
}

export default connect(null, { ModalProcess })(Footer);