import React, { useEffect, useState, Suspense, lazy } from 'react';
import './style.css';
import ButtonDown from './buttonDown';
import ConvertDate from '../../containers/dateConvert';
import Tabnav from '../../tabnav';
import { connect } from 'react-redux';
import { deleteAttachment } from '../../../redux/actions/noteActions';
import DeleteModal from '../../containers/deleteContainer';
import GRec from '../../../assets/tabnav/G-recording.svg';
import BRec from '../../../assets/tabnav/B-recording.svg';

let icons = [
    { G: GRec, B: BRec }
];

const mT = { marginTop: '16px' };
const FileType = lazy(() => import('../../containers/fileType'));
const dS = { marginTop: '20px', marginLeft: '10px', width: 'fit-content' };
const pS = { marginTop: '20px', marginLeft: '12px', fontSize: '12px' };
const fW = { fontWeight: '700' };

const FileView = ({ id, uId, File, tabNav, setTN, deleteAttachment }) => {
    if (File && File.file) var { name, url, _id, type, postedBy, date, description, email, contact } = File.file;

    const [width, setWidth] = useState(0), [modalDel, setMD] = useState(false);
    useEffect(() => {
        uWD();
        window.addEventListener('resize', uWD);
        return () => window.removeEventListener('resize', uWD);
    }, [File])

    const uWD = () => setWidth(window.innerWidth);

    const renderAccordingToFileTypesDyn = (type, url, name, p, d, desc, email, contact) => <Suspense fallback={<></>}>
        <FileType width={width} type={type} url={url} name={name} />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px' }}>
            <h6 className="name mr-auto">{p}</h6>
            <h6 className="date">Uploaded on {ConvertDate(d)}</h6>
        </div>
        <h6 className="date">{email}</h6>
        <h6 className="date">{contact}</h6>
        <h6 className="desc">{desc}</h6>
    </Suspense>

    return <div className="col-11 p-0 f-w">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">Attachment</h4>
            <div style={{ marginLeft: 'auto' }} />
            {tabNav === 0 && <ButtonDown id={_id} url={url} />}
        </div>
        <Tabnav items={[name ? name : '']} icons={icons} i={tabNav} setI={setTN} />
        {tabNav === 0 && <>
            {url !== '' && _id !== '' && renderAccordingToFileTypesDyn(type, url, name, postedBy, date, description, email, contact)}
            <button className="btn btn-danger" style={dS} onClick={e => setMD(true)}>Delete attachment</button>
            <p style={pS}><b style={fW}>Note: </b>This action will permenently delete the recording and unattach it from the note.</p>
        </>}

        {modalDel && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
            let data = { _id: _id, org: id, uId: uId };
            await deleteAttachment(data);
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}
    </div>
}

export default connect(null, { deleteAttachment })(FileView);