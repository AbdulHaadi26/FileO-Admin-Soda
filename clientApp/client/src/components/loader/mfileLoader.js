import React, { useEffect, useState } from 'react';
import './flStyle.css';
import returnType from '../types';
import Cross from '../../assets/cross.svg';
import Logo from '../../assets/logo.svg';
const fS = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.3', minWidth: '100vw' };
const pS = { position: 'fixed', zIndex: '9999', padding: '12px 0px 12px 0px' };
const tM = { width: '12px', marginLeft: '12px', cursor: 'pointer', backgroundImage: `url('${Cross}')` };

export default ({ onFinish, setting, fileList, per }) => {
    const [i, setI] = useState(0), [text, setT] = useState('Please wait while we upload your file to File-O');

    useEffect(() => {
        var IntervalId;
        async function ChangeText(slogans) {
            setT(slogans[i]);
            IntervalId = setInterval(() => { i >= slogans.length - 1 ? setI(0) : setI(i + 1); }, 5 * 1000);
        }
        setting && setting.slogans && setting.slogans.length > 0 && setting.slogans.length > 1 && ChangeText(setting.slogans);
        return () => { clearInterval(IntervalId); }
    }, [i, setting]);

    const handleClick = () => {
        if (returnVal) onFinish(4, '');
    }

    const returnVal = () => {
        var L = 0;
        for (let j = 0; j < fileList.length; j = j + 1) {
            if (fileList[j].percentCheck >= 100 || fileList[j].err) L = L + 1;
        }
        return L === fileList.length ? true : false;
    }

    const renderLoaders = () => fileList.map(f => <div key={f.name} className="fl-sw">
        <img src={returnType(f.type)} alt="type" />
        <div className="fl-sb-w">
            <div className="fl-sw-sub">
                <h6 className="mr-auto fl-n">{f.name}</h6>
                {!f.err ? <h6 className="fl-per">{`${f && f.percentCheck ? f.percentCheck : 0}%`}</h6> : <div style={tM} />}
            </div>
            {!f.err && <div className="progress" style={{ height: '3px', width: '100%' }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${f.percentCheck}%` }} aria-valuenow={f.percentCheck} aria-valuemin={0} aria-valuemax={100} />
            </div>}
        </div>
    </div>)

    return <>
        <div style={fS} />
        <div className="col-lg-5 col-10 p-0 modalDiv f-l" style={pS}>
            <div className="modal-content animated fadeInDown faster col-12 p-0">
                <div className="modal-body fl-w">
                    <img src={Logo} alt="logo" className="img-logo" />
                    <h6 className="fl-ts">{text}</h6>
                    <h6 className="fl-h">File Progress</h6>
                    <div className="col-12 p-0" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: '50vh', overflowY: 'auto' }}>
                        {renderLoaders()}
                    </div>
                    <div className="fl-jfe">
                        <button className={`btn ${returnVal() ? 'btn-success' : 'btn-secondary'}`} type='button' onClick={e => handleClick()}>Finished</button>
                    </div>
                </div>
            </div>
        </div>
    </>
}
