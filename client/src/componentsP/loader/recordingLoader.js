import React, { useEffect, useState } from 'react';
import './flStyle2.css';
import { connect } from 'react-redux';
import Logo from '../../assets/logo.svg';
import returnType from '../types';

const Modal = ({ percent, fileData, setting, onFinish }) => {
    const [i, setI] = useState(0), [text, setT] = useState('Please wait while we upload your file to File-O'), [fName, setFN] = useState(''), [fType, setFT] = useState('');

    useEffect(() => {
        var IntervalId;
        async function ChangeText(slogans) {
            setT(slogans[i]);
            IntervalId = setInterval(() => { i >= slogans.length - 1 ? setI(0) : setI(i + 1); }, 5 * 1000);
        };

        setting && setting.setting && setting.setting.slogans && setting.setting.slogans.length > 0 && setting.setting.slogans.length > 1 && ChangeText(setting.setting.slogans);

        if (fileData && fileData.name && fileData.size) {
            var size = (fileData.size * 1000);
            setFN(`${fileData.name} (${size.toFixed(2)} MB)`);
            setFT(fileData.type);
        }

        return () => { clearInterval(IntervalId); }
    }, [i, setting, fileData]);

    const handleClick = () => percent === 100 && onFinish();

    return <>
        <img src={Logo} alt="logo" className="img-logo1" />
        <h6 className="fl-ts1">{text}</h6>
        <h6 className="fl-h1">File Progress</h6>
        <div className="fl-sw1">
            <img src={returnType(fType)} className="img1" alt="type" />
            <div className="fl-sb-w1">
                <div className="fl-sw-sub1">
                    <h6 className="mr-auto fl-n1">{fName}</h6>
                    <h6 className="fl-n1 fl-per1">{percent}%</h6>
                </div>
                <div className="progress" style={{ height: '3px', width: '100%' }}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${percent}%` }} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
            </div>
        </div>
        <div className="fl-jfe1">
            <button className={`btn btn1 ${percent === 100 ? 'btn-success' : 'btn-secondary'}`} type='button' onClick={e => handleClick()}>Finished</button>
        </div>
    </>
};

const mapStateToProps = state => {
    return {
        setting: state.setting.data
    }
};

export default connect(mapStateToProps)(Modal);
