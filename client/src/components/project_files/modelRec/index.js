import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import './style.css';
import { connect } from 'react-redux';
import SimpleLoader from '../../loader/simpleLoader';
import Attach from '../../../assets/attach.svg';
import MP from '../../../assets/mp1.svg';
import MP2 from '../../../assets/mp2.svg';
import Stop from '../../../assets/stop.svg';
import { registerANCA, clearFile } from '../../../redux/actions/announcementActions';
const Loader = lazy(() => import('../../loader/recordingLoader'));
const fS = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.3', minWidth: '100vw' };
const pS = { position: 'fixed', zIndex: '9999' };
const mS = { width: '100%', textAlign: 'center', marginTop: '12px', fontSize: '18px', fontWeight: '400', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' };
const dF = { display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', width: '100%' };
const btN = { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '12px' };
const iG = { marginTop: '24px', width: '100%' };
const tS = { width: '100%', textAlign: 'left' };
let stream, recorder, chunks = [], id;

const Modal = ({ onhandleModal, onSubmit, per, fData, isL, isUpt, registerANCA, _id, clearFile }) => {
    const [status, setS] = useState(-1), [fileData, setFD] = useState(''), [blob, setBLOB] = useState(''), [count, setCount] = useState(0), videoRef = useRef(null),
        [name, setName] = useState(''), [description, setDescription] = useState('');

    useEffect(() => {
        let mediaStream;
        const recordVideo = async () => {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 48000, echoCancellation: true, noiseSuppression: true }, video: false });
                stream = mediaStream;
            } catch (e) { console.error(e) }
        }
        try {
            navigator.mediaDevices && navigator.mediaDevices.getUserMedia && recordVideo();
        } catch (e) { console.error(e) }
        return () => {
            id && clearInterval(id);
            stopBothVideoAndAudio(mediaStream);
        }
    }, [])

    const startRec = () => {
        try {
            if (stream) {
                recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                recorder.start();
                elapsedTime();
                recorder.ondataavailable = e => chunks.push(e.data);
                recorder.onstop = e => {
                    try {
                        var file = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
                        setBLOB(file);
                        videoRef.current.src = URL.createObjectURL(file);
                        let data = { fName: `${`${name}-Audio`}Rec`, type: 'audio', size: file.size, name, description, pId: _id };
                        setFD(data);
                        chunks = [];
                    } catch (e) {
                        console.log(e.message);
                    }
                }
                setS(1);
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    const elapsedTime = async () => {
        var count = 0;
        id = setInterval(function () {
            count = count + 1;
            if (Math.floor(count / 60) < 30) setCount(count);
            else {
                recorder.stop();
                if (id) {
                    clearInterval(id);
                    id = null;
                } setS(2);
            }
        }, 1000);
    }

    const stopRec = () => {
        recorder.stop();
        if (id) {
            clearInterval(id);
            id = null;
        } setS(2);
    }

    const stopBothVideoAndAudio = stream => stream && stream.getTracks().forEach(track => track.readyState === 'live' && track.stop());

    const submit = () => {
        clearFile();
        onSubmit(fData);
    }

    const attachRec = () => registerANCA(fileData, blob);


    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);

    return <>
        <div style={fS} onClick={e => onhandleModal(e, false)} ></div>
        <div className="col-lg-6 col-11 p-0 modalDiv" style={pS}>
            <div className="modal-content animated fadeInDown faster col-12 p-0">
                <div className="modal-body mdlRec">
                    <div style={dF}> <button type="button" className="close" onClick={e => onhandleModal(e, false)}> <span aria-hidden="true">&times;</span> </button> </div>
                    {!isUpt && <h6 style={mS}>Record Audio <div style={{ backgroundImage: `url('${MP}')`, width: '24px', height: '24px', marginLeft: '12px' }} /></h6>}
                    {status === -1 && <>
                        <div className="input-group" style={iG}>
                            <input type={'text'} className="form-control" placeholder={'Name'} value={name}
                                onChange={e => setName(e.target.value)} required={true} autoFocus={true} />
                        </div>
                        <div className="input-group" style={{ width: '100%', marginTop: '12px' }}>
                            <textarea type='text' className="form-control" placeholder={'Description'} value={description} onChange={e => onhandleInputA(e)} style={tS} />
                        </div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <p className="word-count" style={{ fontSize: '12px' }}>{description.split(" ").length} / 500</p>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                            <button className="btn btn-success" style={btN} type={'button'} onClick={e => name && setS(0)}>Next</button>
                        </div>
                    </>}
                    {status === 0 && <button className="btn btn-primary" type={'button'} onClick={e => startRec()}><div style={{ backgroundImage: `url('${MP2}')`, width: '20px', height: '20px', marginLeft: '2px' }} /></button>}
                    {status === 1 && <>
                        <button className="btn btn-danger" type='button' onClick={e => stopRec()}><div style={{ backgroundImage: `url('${Stop}')`, width: '20px', height: '20px', marginLeft: '2px' }} /> </button>
                        <h6 className="time">Elapsed time: <span style={{ color: 'green' }}>{count < 60 ? `${count}s` : `${Math.floor(count / 60)}m ${count % 60}s`}</span> / <span style={{ color: 'red' }}>30: 00 min</span></h6>
                    </>}
                    {!isUpt && status === 2 && <audio ref={videoRef} autoPlay controls></audio>}
                    {!isUpt && status === 2 && <button className="btn btn-success" style={btN} type={'button'} onClick={e => attachRec()}>Upload Recording<div className="faS" style={{ backgroundImage: `url('${Attach}')` }} /> {isL && <SimpleLoader />} </button>}
                    {isUpt && status === 2 && <Suspense fallback={<></>}>
                        <Loader fileData={fData} percent={per} onFinish={submit} />
                    </Suspense>}
                </div>
            </div>
        </div>
    </>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isUpt: state.File.isUpt,
        per: state.File.per,
        fData: state.File.fileData
    }
}

export default connect(mapStateToProps, { registerANCA, clearFile })(Modal);