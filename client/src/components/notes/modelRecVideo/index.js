import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import './style.css';
import { connect } from 'react-redux';
import SimpleLoader from '../../loader/simpleLoader';
import { registerRec, clearFile } from '../../../redux/actions/noteActions';
import Attach from '../../../assets/attach.svg';
import VC from '../../../assets/vc1.svg';
import VC2 from '../../../assets/vc.svg';
import Stop from '../../../assets/stop.svg';
const Loader = lazy(() => import('../../loader/recordingLoader'));
const fS = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.3', minWidth: '100vw' };
const pS = { position: 'fixed', zIndex: '9999' };
const mS = { width: '100%', textAlign: 'center', marginTop: '12px', fontSize: '18px', fontWeight: '400', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' };
const dF = { display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', width: '100%' };
const btN = { display: 'flex', flexDirection: 'row', alignItems: 'center' };
let stream, recorder, chunks = [], id;

const Modal = ({ per, fData, isL, isUpt, registerRec, clearFile, onhandleModal, onSubmit, noteName }) => {
    const [status, setS] = useState(0), [fileData, setFD] = useState(''), [blob, setBLOB] = useState(''), [count, setCount] = useState(0), vidRef = useRef(null), vidLive = useRef(null);

    useEffect(() => {
        let mediaStream, showStream;
        const recordVideo = async () => {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 48000, echoCancellation: true, noiseSuppression: true }, video: { width: 1280, height: 720 } });
                stream = mediaStream;
                showStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                vidLive.current.srcObject = showStream;
            } catch (e) { console.error(e) }
            vidLive.current.onloadedmetadata = async function (e) {
                try { await vidLive.current.play(); } catch (e) { console.error(e); }
            }
        }
        try {
            navigator.mediaDevices && navigator.mediaDevices.getUserMedia && recordVideo();
        } catch (e) { console.error(e) }
        return () => {
            id && clearInterval(id)
            stopBothVideoAndAudio(mediaStream);
            stopBothVideoAndAudio(showStream);
        }
    }, [])

    const startRec = () => {
        try {
            if (stream) {
                recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs="vp9"' });
                recorder.start();
                elapsedTime();
                recorder.ondataavailable = e => chunks.push(e.data);
                recorder.onstop = e => {
                    try {
                        var file = new Blob(chunks, { type: 'video/mp4' });
                        vidRef.current.src = URL.createObjectURL(file);
                        setBLOB(file);
                        var data = { fName: `${noteName ? `${noteName}-` : ''}Video`, type: 'video', size: file.size, mime: 'video/mp4"' };
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
        setS(2);
        if (id) {
            clearInterval(id);
            id = null;
        }
        recorder.stop();
    }

    const stopBothVideoAndAudio = stream => stream && stream.getTracks().forEach(track => track.readyState === 'live' && track.stop());

    const submit = () => {
        clearFile();
        onSubmit(fData);
    }

    const attachRec = () => registerRec(fileData, blob);

    return <>
        <div style={fS} onClick={e => onhandleModal(e, false)} ></div>
        <div className="col-lg-6 col-11 p-0 modalDiv" style={pS}>
            <div className="modal-content animated fadeInDown faster col-12 p-0">
                <div className="modal-body mdlRec">
                    <div style={dF}> <button type="button" className="close" onClick={e => onhandleModal(e, false)}> <span aria-hidden="true">&times;</span> </button> </div>
                    {!isUpt && <h6 style={mS}>Record Video <div style={{ backgroundImage: `url('${VC2}')`, width: '24px', height: '24px', marginLeft: '12px' }} /></h6>}
                    {status <= 1 && <video ref={vidLive}></video>}
                    {status === 0 && <button className="btn btn-primary" type={'button'} onClick={e => startRec()}><div style={{ backgroundImage: `url('${VC}')`, width: '20px', height: '20px', marginLeft: '2px' }} /></button>}
                    {status === 1 && <>
                        <button className="btn btn-danger" type='button' onClick={e => stopRec()}><div style={{ backgroundImage: `url('${Stop}')`, width: '20px', height: '20px', marginLeft: '2px' }} /></button>
                        <h6 className="time">Elapsed time: <span style={{ color: 'green' }}>{count < 60 ? `${count}s` : `${Math.floor(count / 60)}m ${count % 60}s`}</span> / <span style={{ color: 'red' }}>30: 00 min</span></h6>
                    </>}
                    {!isUpt && status === 2 && <video ref={vidRef} autoPlay controls></video>}
                    {!isUpt && status === 2 && <button className="btn btn-success" type={'button'} style={btN} onClick={e => attachRec()}>Attach Recording<div className="faS" style={{ backgroundImage: `url('${Attach}')` }} />{isL && <SimpleLoader />} </button>}
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

export default connect(mapStateToProps, { registerRec, clearFile })(Modal);