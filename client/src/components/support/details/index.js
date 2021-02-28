import React, { lazy, Suspense } from 'react';
import { useState } from 'react';
import { connect } from 'react-redux';
import { updateAttachment } from '../../../redux/actions/ticketActions';
import Tabnav from '../../tabnav';
const TicketText = lazy(() => import('../../editFunctionalities/editText'));
const TicketTextA = lazy(() => import('../../editFunctionalities/editTextArea'));
const ModalDelete = lazy(() => import('../modelDel'));
const ModalRem = lazy(() => import('../modelRemove'));
const Image = lazy(() => import('./image'));
const pB = { width: '90%', marginTop: '12px', marginLeft: '12px' };
const dS = { marginTop: '20px', marginLeft: '10px' };
const pS = { marginTop: '20px', marginLeft: '12px', fontSize: '12px' };
const fW = { fontWeight: '700' };

const Details = ({ ticket, updateAttachment, tabNav, setTN }) => {
    const { _id, title, org, description, progress, status, feedback, url } = ticket;
    const [modalDel, setModDel] = useState(false), [num, setNum] = useState(0), [modalRemove, setModelRem] = useState(false), [errB, setEB] = useState(false), [err, setErr] = useState(false),
        [img, setI] = useState(''), [image, setImg] = useState(''), [fN, setFN] = useState(''), [size, setFS] = useState(0), [mime, setMT] = useState('');;

    const handleModalDel = (e, val) => setModDel(val);
    const handleModal = (e, val) => setModelRem(val);
    const onhandleModal = mV => setNum(mV);

    const updateAttach = () => {
        if (image) {
            var data = { _id: _id, fName: fN, size: size, mimeType: mime };
            updateAttachment(data, image);
        }
    }

    const handleImagePreview = e => {
        try {
            if (e.target.files && e.target.files[0]) {
                let file = e.target.files[0];
                setMT(file.type); setFN(file.name); setFS(file.size);
                if (file.type === 'image/x-png' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
                    setI(URL.createObjectURL(file))
                    if (file.size <= (1024 * 1024 * 5)) {
                        setImg(file); setErr(false); setEB(false);
                    }
                    else setErr(true);
                } else setEB(true);
            } else setEB(true);
        } catch { setEB(true); }
    }

    return <div className="col-11 sup-w p-0">
        <h4 className="h">Ticket</h4>
        <Tabnav items={['Details', 'Attachment', 'Permission']} i={tabNav} setI={setTN} />
        {tabNav === 0 && <>
            <Suspense fallback={<></>}>
                <TicketText name={'title'} head={'Title'} val={title} title={'TITLE'} modal={num === 1 ? true : false} num={1} handleModal={onhandleModal} type={'text'} refAct='ticket' id={_id} org={org} />
                <TicketTextA name='description' head={'Description'} val={description} title={'DESCRIPTION'} modal={num === 2 ? true : false} num={2} handleModal={onhandleModal} type={'text'} refAct='ticket' id={_id} org={org} />
            </Suspense>
            <div className="supI2">
                <h6 className="dyna">{status}</h6>
            </div>
            <div className="progress" style={pB}>
                <div className="progress-bar" role="progressbar" style={{ width: `${progress !== 0 ? progress : progress + 1}%` }} aria-valuenow={progress !== 0 ? progress : progress + 1} aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div className="supI2">
                <h6 className="dyna">Progress: {progress}%</h6>
            </div>
            {feedback && <> <h6 className="sH">Feedback</h6>
                <div className="supI2">
                    <h6 className="dyna">{feedback}</h6>
                </div> </>}
        </>}
        {tabNav === 1 && <>
            {url ? <> <div style={{ width: '100%', marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={url} alt="Attachment" className="col-12" />
            </div>
                <div className="col-12" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <button className="btn btn-danger" style={dS} onClick={e => setModelRem(true)}>Remove Attachment</button>
                </div>
            </> : <>
                    <Suspense fallback={<></>}>
                        <Image img={img} err={err} errBroken={errB} onhandleImagePreview={handleImagePreview} />
                        <div className="col-12" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <button className="btn btn-danger" style={dS} onClick={e => updateAttach()}>Add Attachment</button>
                        </div>
                    </Suspense>
                </>}
        </>}
        {tabNav === 2 && <>
            <button className="btn btn-danger" style={dS} onClick={e => setModDel(true)}>Delete Ticket</button>
            <p style={pS}><b style={fW}>Note: </b>This action will delete the ticket.</p>
        </>}
        {modalDel && <Suspense fallback={<></>}> {<ModalDelete org={org} id={_id} onhandleModalDel={handleModalDel} />} </Suspense>}
        {modalRemove && <Suspense fallback={<></>}> {<ModalRem id={_id} onhandleModalDel={handleModal} />} </Suspense>}
    </div>
}

export default connect(null, { updateAttachment })(Details);