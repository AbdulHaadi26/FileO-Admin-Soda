import React, { useEffect, useState, Suspense, lazy } from 'react';
import './style.css';
import ButtonDown from './buttonDown';
import ConvertDate from '../../containers/dateConvert';
import Tabnav from '../../tabnav';
const FileType = lazy(() => import('../../containers/fileType'));
const ModalDelete = lazy(() => import('../modelDelAttachment'));
const dF = { display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' };
const dS = { marginTop: '20px', marginLeft: '10px', width: 'fit-content' };
const pS = { marginTop: '20px', marginLeft: '12px', fontSize: '12px' };
const fW = { fontWeight: '700' };

export default ({ id, uId, fId, File, tabNav, setTN }) => {
    if (File && File.file) var { name, url, _id, type, postedBy, date, description, email, contact } = File.file;

    const [width, setWidth] = useState(0), [modalDel, setMD] = useState(false);
    useEffect(() => {
        uWD();
        window.addEventListener('resize', uWD);
        return () => window.removeEventListener('resize', uWD);
    }, [File])

    const uWD = () => setWidth(window.innerWidth);

    const handleModalDel = (e, val) => setMD(val);

    const renderAccordingToFileTypesDyn = (type, url, name, p, d, desc, email, contact) => <Suspense fallback={<></>}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px' }}>
            <h6 className="name mr-auto">{p}</h6>
            <h6 className="date">Uploaded on {ConvertDate(d)}</h6>
        </div>
        <h6 className="date">{email}</h6>
        <h6 className="date">{contact}</h6>
        <h6 className="desc">{desc}</h6>
        <FileType width={width} type={type} url={url} name={name} />
    </Suspense>

    return <div className="col-11 p-0 f-w">
        <h4 className="h">Attachment</h4>
        <Tabnav items={[name ? name : '', 'Permission']} i={tabNav} setI={setTN} />
        {tabNav === 0 && <>
            <div style={dF}>
                <ButtonDown id={_id} url={url} />
            </div>
            {url !== '' && _id !== '' && renderAccordingToFileTypesDyn(type, url, name, postedBy, date, description, email, contact)}
        </>}
        {tabNav === 1 && <>
            <button className="btn btn-danger" style={dS} onClick={e => setMD(true)}>Delete attachment</button>
            <p style={pS}><b style={fW}>Note: </b>This action will permenently delete the recording and unattach it from the note.</p>
        </>}
        {modalDel && <Suspense fallback={<></>}><ModalDelete _id={_id} fId={fId} org={id} pId={uId} onhandleModalDel={handleModalDel} /></Suspense>}
    </div>
}