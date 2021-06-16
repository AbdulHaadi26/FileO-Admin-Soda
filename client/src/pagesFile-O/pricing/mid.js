import React, { useState } from 'react';
import Link from 'react-router-dom/Link';
import './style.css';


export default () => {

    const [GB, setGB] = useState(5), [i1, setI1] = useState(0), [user, setUser] = useState(1);


    return <div className="mid" style={{ marginTop: '60px' }}>
        <div className="col-lg-11 col-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: '33px', fontWeight: '600', textAlign:'center', width:'90%' }}>Playing Big? Get a custom plan.</h1>
            <p className="col-lg-4 col-11" style={{ fontSize: '14px', textAlign: 'center', marginTop: '16px', width:'90%' }}>Make your own custom Plan according to the number of users that you have and storage that you need.</p>
        </div>
        <div className="col-lg-11 col-12 div-black">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                <div className="col-lg-1 col-2">

                </div>
                <div className="col-lg-11 col-10">
                </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '12px' }}>
                <div className="col-lg-1 col-2" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <h6 style={{ fontSize: '14px' }}>Plan</h6>
                </div>
                <div className="col-lg-11 col-10" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    <div onClick={e => {
                        setGB(5);
                        setUser(1);
                        setI1(0);
                    }} className={`circular ${i1 === 0 ? 'white' : ''}`}>
                        <h6 style={{ fontSize: '14px' }}>Individual</h6>
                    </div>
                    <div onClick={e => {
                        setGB(5);
                        setUser(1);
                        setI1(1);
                    }} className={`circular ${i1 === 1 ? 'white' : ''}`}>
                        <h6 style={{ fontSize: '14px' }}>Freelancer</h6>
                    </div>
                    <div onClick={e => {
                        setGB(50);
                        setUser(3);
                        setI1(2);
                    }} className={`circular ${i1 === 2 ? 'white' : ''}`}>
                        <h6 style={{ fontSize: '14px' }}>Business</h6>
                    </div>
                </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '24px' }}>
                <div className="col-lg-1 col-2" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <h6 style={{ fontSize: '14px' }}>Billed</h6>
                </div>
                <div className="col-lg-11 col-10" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    <div className={`circular white`}>
                        <h6 style={{ fontSize: '14px' }}>Monthly</h6>
                    </div>
                </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '24px' }}>
                <div className="col-lg-1 col-2" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <h6 style={{ fontSize: '14px' }}>Price</h6>
                </div>
                <div className="col-lg-11 col-10" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    <div className={`circularP`}>
                        <h6 style={{ fontSize: '14px' }}>PKR {(GB * (i1 >= 2 ? 5 : 6)) + user * (275)}/month</h6>
                    </div>
                </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '24px' }}>
                <div className="col-lg-1 col-2" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

                </div>
                <div className="col-lg-11 col-10" style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}>
                    <label htmlFor="customRange1" className="form-label">{GB} GB</label>
                    <input type="range" min={i1 >= 2 ? 50 : 5} value={GB} onChange={e => setGB(e.target.value)} step={i1 >= 2 ? 50 : 5} max={i1 >= 2 ? 5000 : 100} id="customRange1"></input>
                </div>
            </div>
            {i1 >= 2 && <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '24px' }}>
                <div className="col-lg-1 col-2" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                </div>
                <div className="col-lg-11 col-10" style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}>
                    <label htmlFor="customRange2" className="form-label">{user} Users</label>
                    <input type="range" min={3} value={user} onChange={e => setUser(e.target.value)} max={500} id="customRange2"></input>
                </div>
            </div>}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '24px' }}>
                <div className="col-lg-1 col-2" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                </div>
                <div className="col-lg-11 col-10" style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignItems:'center' }}>
                    <Link to='/free-trial' className="buttonB">Start 30 days free trail</Link>
                    <h6 style={{ marginTop: '12px', marginLeft: '6px' }}><span style={{ fontSize: '14px', fontWeight: '500' }}>Or</span>
                        <Link to="/register" style={{ fontSize: '14px', marginLeft: '6px', textDecoration: 'underline' }}>Buy Now</Link>
                    </h6>
                </div>
            </div>
        </div>
    </div>
}