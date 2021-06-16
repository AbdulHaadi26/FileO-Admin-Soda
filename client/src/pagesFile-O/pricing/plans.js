import React from 'react';
import Link from 'react-router-dom/Link';
import Checked from '../../assetsFile-O/checkB.svg';
import history from '../../utils/history';
import './style.css';

let list = [
    { item: "Granular Sharing", i: 1 }, { item: "Admin Controls", i: 2 }, { item: "Email, Chat & Phone support", i: 0 },
    { item: "Admin Console", i: 2 }, { item: "256-bit AES and SSL/TLS encryption", i: 0 }, { item: "Admin Role delegation", i: 2 },
    { item: "Team Tasks & Notes", i: 1 }, { item: "Audio & Video Recording", i: 1 }, { item: "Project/Private Workspaces", i: 1 },
    { item: "External Uploads", i: 0 }, { item: "Weekly Planner", i: 0 }, { item: "1 GB Single File Upload", i: 0 }
]

export default () => {


    list = list.sort((i, k) => {
        return i.i - k.i;
    })

    const returnCircles = (count) => {
        let arr = [];

        for (let i = 0; i < count; i++) {
            arr.push(i);
        };

        return <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {arr.map((i, k) => {
                return <div key={k} className="circle">

                </div>
            })}
        </div>
    };

    return <div className="mid">
        <div className="mid-p col-lg-11 col-12">
            <div className="col-lg-4 col-3 p-0 d-flex">
                <h1>Plans {'&'} Pricing</h1>
            </div>
            <div className='col-lg-8 col-9 p-0 mid-row' style={{ alignItems: 'flex-start' }}>
                <div className="col-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <h3>For Individuals <span style={{ fontSize: '12px', color: '#3AAED5' }}>(Coming Soon)</span></h3>
                    <p className="desc">Simplify your life with File-O Individual and access your files and photos from anywhere.</p>
                </div>
                <div className="col-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <h3>For Freelancers <span style={{ fontSize: '12px', color: '#3AAED5' }}>(Coming Soon)</span></h3>
                    <p className="desc">Sending and receiving files from client is easy with File-O Freelancer.</p>
                </div>
                <div className="col-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <h3>For Businesses</h3>
                    <p className="desc">For businesses {'&'} teams of all size. Efficient Workspace Collaboration and File Sharing tool suited for your needs.</p>
                </div>
            </div>
        </div>
        <div className="mid-p col-lg-11 col-12">
            <div className="col-lg-4 col-3 p-0 d-flex">

            </div>
            <div className='col-lg-8 col-9 p-0 mid-row'>
                <div className="col-4 d-p" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <button className="buttonB disabled p-ext" disabled={true} onClick={e => history.push(`/free-trial`)}>Try for Free</button>
                    <h6 style={{ marginTop: '12px', marginLeft: '6px', display: 'flex', flexDirection: 'row' }}><span style={{ fontSize: '14px', fontWeight: '500' }}>Or</span>
                        <h6 style={{ fontSize: '14px', marginLeft: '6px', color: 'gray' }}>Buy Now</h6>
                    </h6>
                </div>
                <div className="col-4 d-p" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <button className="buttonB p-ext" onClick={e => history.push(`/personal/free-trial`)}>Try for Free</button>
                    <h6 style={{ marginTop: '12px', marginLeft: '6px', display: 'flex', flexDirection: 'row' }}><span style={{ fontSize: '14px', fontWeight: '500' }}>Or</span>
                        <Link to="/personal/register" style={{ fontSize: '14px', marginLeft: '6px', textDecoration: 'underline' }}>Buy Now</Link>
                    </h6>
                </div>
                <div className="col-4 d-p" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <button className="buttonB p-ext" onClick={e => history.push(`/free-trial`)}>Try for Free</button>
                    <h6 style={{ marginTop: '12px', marginLeft: '6px' }}><span style={{ fontSize: '14px', fontWeight: '500' }}>Or</span>
                        <Link to="/register" style={{ fontSize: '14px', marginLeft: '6px', textDecoration: 'underline' }}>Buy Now</Link>
                    </h6>
                </div>
            </div>
        </div>
        <div className="col-lg-11 col-12">
            <div style={{ width: '100%', height: '1.5px', backgroundColor: '#f5f6fa', marginTop: '24px' }}></div>
        </div>
        <div className="mid-p col-lg-11 col-12" style={{ marginTop: '18px' }}>
            <div className="col-4 p-0 d-flex">
                <h1 style={{ fontSize: '14px', fontWeight: '600' }}>Key Features</h1>
            </div>
            <div className='col-8 p-0 mid-row'>
                <div className="col-4">
                    {returnCircles(2)}
                </div>
                <div className="col-4">
                    {returnCircles(4)}
                </div>
                <div className="col-4">
                    {returnCircles(6)}
                </div>
            </div>
        </div>
        {list && list.length > 0 && list.map((i, k) => {
            return <div className="mid-p col-lg-11 col-12" style={{ marginTop: '18px' }} key={k}>
                <div className="col-4 p-0 d-flex">
                    <h1 style={{ fontSize: '14px', fontWeight: '400' }}>{i.item}</h1>
                </div>
                <div className='col-8 p-0 mid-row'>
                    <div className="col-4">
                        <img src={Checked} alt="Check" className="check" style={{ visibility: i.i <= 0 ? 'visible' : 'hidden' }} />
                    </div>
                    <div className="col-4">
                        <img src={Checked} alt="Check" className="check" style={{ visibility: i.i <= 1 ? 'visible' : 'hidden' }} />
                    </div>
                    <div className="col-4">
                        <img src={Checked} alt="Check" className="check" style={{ visibility: i.i <= 2 ? 'visible' : 'hidden' }} />
                    </div>
                </div>
            </div>
        })}

    </div>
}