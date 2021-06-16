import React, { useState } from 'react';
import Image from '../../assetsFile-O/bg4.svg';
import Logo1 from '../../assetsFile-O/logo1.svg';
import Logo2 from '../../assetsFile-O/logo2.svg';
import Logo3 from '../../assetsFile-O/logo3.svg';
import './style.css';
import { Link } from 'react-router-dom';
import history from '../../utils/history';

export default () => {
    const [email, setE] = useState('');

    return <>
        <div className="header-end" style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="col-lg-5 col-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div className="col-10 p-0">
                    <h1 style={{ fontSize: '33px', fontWeight: '600', color: 'white' }}>Project Sections</h1>
                    <p style={{ fontSize: '14px', color: 'white', marginTop: '18px', marginBottom: '24px' }}>Project collaboration becomes effective and organized with File-O. Sharing a folders, a file or hold a discussion within the project has never been easier before. Now do it all with File-O Projects.</p>
                    <Link className="button" to={'/pricing'}>Get Started</Link>
                </div>
            </div>
            <div className="col-lg-7 col-12">
                <img src={Image} alt="File-O Projects" style={{ width: '100%' }} />
            </div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0px' }}>
            <h1 style={{ fontSize: '33px', fontWeight: '600', width: '90%', textAlign: 'center' }}>Go Further with File-O</h1>
            <p style={{ marginTop: '24px', fontSize: '14px', textAlign: 'center', width: '90%' }} className="col-lg-5 col-12 p-0">
                Have full control over your clients as well as your team through these core features.
            </p>
            <div style={{ width: '80%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                <div className="col-lg-4 col-12 card-out">
                    <div className="col-12 card">
                        <img src={Logo1} alt="File-O Client Request" style={{ width: '50px' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '36px' }}>Client Request</h3>
                        <p style={{ fontSize: '14px', textAlign: 'center', marginTop: '12px' }}>Whether it’s sharing a file or a folder with client or getting them from the client, all can be done with File-O Client Requests. Just share a link of a file or folder with a client and he can download the files.</p>
                    </div>
                </div>
                <div className="col-lg-4 col-12 card-out">
                    <div className="col-12 card">
                        <img src={Logo2} alt="File-O Polling" style={{ width: '40px' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '36px' }}>Pollings</h3>
                        <p style={{ fontSize: '14px', textAlign: 'center', marginTop: '12px' }}>Create your poll in no time and start receiving feedback from the very moment you sent it to your team. Knowing the level of satisfaction of your employees is essential to growing your business and moving in the right direction. Do it all with File-O Polling.</p>
                    </div>
                </div>
                <div className="col-lg-4 col-12 card-out">
                    <div className="col-12 card">
                        <img src={Logo3} alt="File-O My Plans" style={{ width: '40px' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '36px' }}>My Plans</h3>
                        <p style={{ fontSize: '14px', textAlign: 'center', marginTop: '12px' }}>Planning provides a guide for action. Plans can direct everyone’s actions toward desired outcomes. A person only gets motivated when he has some goal in mind, to achieve those goals you need File-O My Plans.</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="header-end" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0px' }}>
            <h1 style={{ fontSize: '28px', color: 'white', fontWeight: '600', width: '90%', textAlign: 'center' }}>Start Your 30-Day Free Trial</h1>
            <form className="input-div" onSubmit={e => {
                e.preventDefault();
                history.push(`/free-trial/${email}`);
            }}>
                <input placeholder="Enter email" type="email" value={email} onChange={e => setE(e.target.value)} />
                <button type="submit" className="btn-free">Try Now</button>
            </form>
        </div>
    </>
};