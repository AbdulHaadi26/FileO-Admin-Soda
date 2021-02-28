import React, { useEffect, useState, Suspense, lazy } from 'react';
import '../style.css';
import ButtonDown from './buttonDown';
import { connect } from 'react-redux';
import { AddToF, DelToF } from '../../../redux/actions/fvrActions';
import Heart from '../../../assets/empty-heart.svg';
import Filled from '../../../assets/heart-filled.svg';
import ConvertDate from '../../containers/dateConvert';
import ModalLink from './modalLink';
import Tabnav from '../../tabnav';
const FileType = lazy(() => import('../../containers/fileType'));
const dF = { display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' };

const View = ({ fId, File, getF, AddToF, DelToF, tabNav, setTN, }) => {
    if (File && File.file) var { name, url, _id, type, postedBy, date, description, email, contact } = File.file;
    const [width, setWidth] = useState(0), [sM, setSM] = useState(false), [i, setI] = useState(0);
    useEffect(() => {
        uWD();
        if (File) {
            setI(File.isF ? 1 : 0);
        }
        window.addEventListener('resize', uWD);
        return () => window.removeEventListener('resize', uWD);
    }, [File])

    const uWD = () => setWidth(window.innerWidth);

    const renderAccordingToFileTypesDyn = (type, url, name, p, d, desc, email, contact) => <Suspense fallback={<></>}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px' }}>
            <h6 className="name mr-auto">{p}</h6>
            <h6 className="date">Uploaded on {ConvertDate(d)}</h6>
        </div>
        {email && <h6 className="date"><b style={{ color: 'black' }}>Email:</b> {email}</h6>}
        {contact && <h6 className="date"><b style={{ color: 'black' }}>Contact:</b> {contact}</h6>}
        {desc && <h6 className="desc"><b>Description:</b> {desc}</h6>}
        <FileType width={width} type={type} url={url} name={name} />
    </Suspense>

    const Add = async () => {
        var data = { fileId: fId, fileType: 3, pId: '' };
        i === 0 ? await AddToF(data) : await DelToF({ fileId: _id });
        getF();
        setI(1);
    };

    const handleModal = val => setSM(val);

    return <div className="col-11 p-0 f-w">
        <h4 className="h">Client File</h4>
        <Tabnav items={[name ? name : '']} i={tabNav} setI={setTN} />
        {tabNav === 0 && <>
            <div style={dF}>
                <h6 className={`order`} onClick={e => Add()}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${i === 0 ? Heart : Filled}')` }} /></h6>
                <ButtonDown id={_id} url={url} showModal={handleModal} />
            </div>
            {url !== '' && _id !== '' && renderAccordingToFileTypesDyn(type, url, name, postedBy, date, description, email, contact)}
        </>}
        {sM && <ModalLink showModal={handleModal} />}
    </div>
}

export default connect(null, { AddToF, DelToF })(View);