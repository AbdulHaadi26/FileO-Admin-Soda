import React, { useState } from 'react';
import Topnav from '../nav';
import Image from '../../../assetsFile-O/bg.svg';
import Watch from '../../../assetsFile-O/watch-video.svg';
import './style.css';
import { Link } from 'react-router-dom';
const fS = { position: 'fixed', zIndex: '9999', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.8', minWidth: '100vw' };
const pS = { position: 'fixed', zIndex: '99999' };

export default ({ width }) => {
    const [isModal, setModal] = useState(false);

    return <div className="header">
        <div className="col-lg-11 col-12">
            <Topnav width={width} />
            <div className="header-row">
                <div className="col-lg-4 col-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: '1' }}>
                    <h1>Everything you need <span>for work, all in one place.</span></h1>
                    <p>File-O is an online workspace and file sharing tool designed to collaborate with coworkers and friends. Have secure access to all those files and focus on things that really matter.</p>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link className="button" to='/pricing'>Try for Free</Link>
                        <div onClick={e => setModal(true)} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '12px', marginBottom: '-16px', cursor: 'pointer', padding: '6px 12px' }}>
                            <span style={{ backgroundImage: `url('${Watch}')`, backgroundSize: 'contain', width: '26px', height: '26px' }}></span>
                            <h6 style={{ marginLeft: '6px', marginBottom: '-2px', fontSize: '14px', color: 'white' }}>Watch Video</h6>
                        </div>
                    </div>
                    <div className="marg"></div>
                </div>
                <div className="col-lg-8 col-12 abst-right">
                    <img alt='File-O File Management System' src={Image} className="cover-img" />
                </div>
                {isModal && <>
                    <div style={fS} onClick={e => setModal(false)} />
                    <div className="col-lg-8 col-10 p-0 modalDiv" style={pS}>
                        <div className="modal-content col-12 p-0">
                            <div className="modal-body">
                                <iframe title="File-O Video" style={{ width: '100%', height: '500px', boxShadow: `0 1px 2px 1px rgba(0, 0, 0, 0.14), 0 1px 2px 1px rgba(0, 0, 0, 0.3)` }}
                                    src="https://www.youtube.com/embed/2gl6-DBEgyk" frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
                            gyroscope; picture-in-picture" allowFullScreen={true}></iframe>
                            </div>
                        </div>
                    </div>
                </>}
            </div>
        </div>
    </div>
};