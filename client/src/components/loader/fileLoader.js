import React, { useEffect, useState } from 'react';
import './flStyle.css';
import { connect } from 'react-redux';
import returnType, { finalizeType } from '../types';
import Logo from '../../assets/logo.svg';
const fS = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.3', minWidth: '100vw' };
const pS = { position: 'fixed', zIndex: '9999', padding: '12px 0px 12px 0px' };

const Modal = ({ percent, fileData, setting, onFinish }) => {
    const [i, setI] = useState(0), [text, setT] = useState('Please wait while we upload your file to File-O'), [fName, setFN] = useState(''), [fType, setFT] = useState('');

    useEffect(() => {
        var IntervalId;
        async function ChangeText(slogans) {
            setT(slogans[i]);
            IntervalId = setInterval(() => {
                i >= slogans.length - 1 ? setI(0) : setI(i + 1);
            }, 5 * 1000);
        }
        setting && setting.setting && setting.setting.slogans && setting.setting.slogans.length > 0 && setting.setting.slogans.length > 1 && ChangeText(setting.setting.slogans);

        if (fileData && fileData.name && fileData.type && fileData.size) {
            var size = (fileData.size * 1000);
            setFN(`${fileData.name}.${fileData.type[0]} (${size.toFixed(2)} MB)`);
            setFT(fileData.type[0]);
        }

        return () => { clearInterval(IntervalId); }
    }, [i, setting, fileData]);

    const handleClick = () => {
        if (percent === 100) onFinish();
    }

    return <>
        <div style={fS} />
        <div className="col-lg-5 col-10 p-0 modalDiv f-l" style={pS}>
            <div className="modal-content animated fadeInDown faster col-12 p-0">
                <div className="modal-body fl-w">
                    <img src={Logo} alt="logo" className="img-logo" />
                    <h6 className="fl-ts">{text}</h6>
                    <h6 className="fl-h">File Progress</h6>
                    <div className="fl-sw">
                        <img src={returnType(finalizeType(fType))} alt="type" />
                        <div className="fl-sb-w">
                            <div className="fl-sw-sub">
                                <h6 className="mr-auto fl-n">{fName}</h6>
                                <h6 className="fl-n fl-per">{percent}%</h6>
                            </div>
                            <div className="progress" style={{ height: '3px', width: '100%' }}>
                                <div className="progress-bar" role="progressbar" style={{ width: `${percent}%` }} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}></div>
                            </div>
                        </div>
                    </div>
                    <div className="fl-jfe">
                        <button className={`btn ${percent === 100 ? 'btn-success' : 'btn-secondary'}`} type='button' onClick={e => handleClick()}>Finished</button>
                    </div>
                </div>
            </div>
        </div>
    </>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.fileData,
        setting: state.setting.data
    }
}

export default connect(mapStateToProps)(Modal);
