import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { AddToF, DelToF } from '../../../redux/actions/fvrActions';
import ConvertDate from '../../containers/dateConvert';
import { downloadFile, urlFile } from '../../../redux/actions/personal/clientFilesAction';
import ModalLink from './modalLink';
import Tabnav from '../../tabnav';
import More from '../../../assets/more.svg';
import GView from '../../../assets/tabnav/G-admin files.svg';
import BView from '../../../assets/tabnav/B-admin files.svg';
let icons = [
    { G: GView, B: BView }
];
const FileType = lazy(() => import('../../containers/fileType'));
const bS = { borderBottom: 'solid 1px #dcdde1' };

const View = ({ fId, File, AddToF, DelToF, tabNav, setTN, downloadFile, urlFile, disabled }) => {
    if (File && File.file) var { name, url, _id, type, postedBy, date, description, email, contact } = File.file;

    const [width, setWidth] = useState(0), [sM, setSM] = useState(false), [i, setI] = useState(0), [active, setAct] = useState(false);

    const node = useRef({});


    useEffect(() => {
        uWD();
        if (File) {
            setI(File.isF ? 1 : 0);
        }
        window.addEventListener('resize', uWD);
        return () => window.removeEventListener('resize', uWD);
    }, [File]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    const uWD = () => setWidth(window.innerWidth);

    const renderAccordingToFileTypesDyn = (type, url, name, p, d, desc, email, contact) => <Suspense fallback={<></>}>
        <FileType width={width} type={type} url={url} name={name} />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px' }}>
            <h6 className="name mr-auto">{p}</h6>
            <h6 className="date">Uploaded on {ConvertDate(d)}</h6>
        </div>
        {email && <h6 className="date"><b style={{ color: 'black' }}>Email:</b> {email}</h6>}
        {contact && <h6 className="date"><b style={{ color: 'black' }}>Contact:</b> {contact}</h6>}
        {desc && <h6 className="desc"><b>Description:</b> {desc}</h6>}
    </Suspense>

    const Add = async () => {
        let data = { fileId: fId, fileType: 3, pId: '' };
        i === 0 ? await AddToF(data) : await DelToF({ fileId: _id });
        setI(1);
    };

    const handleModal = val => setSM(val);

    return <div className="col-11 p-0 f-w">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">External Uploads</h4>
            <div style={{ marginLeft: 'auto' }} />
            <h6 ref={node} className="order orderA" style={{ position: 'relative', width: 'fit-content', marginRight: '0px', marginTop:'0px' }} onClick={e => setAct(!active)}>
                    <div style={{ width: '16px', height: '16px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                    <div className="dropdown-content" style={{ display: `${active ? 'flex' : 'none'}`, top: '12px' }}>
                        {!File.isF ?
                            <h6 className='s-l' style={bS} onClick={e => { setAct(false); Add(); }}>Add To Favorites</h6> :
                            <h6 className='s-l' style={bS} onClick={e => { setAct(false); Add(); }}>Remove From Favorites</h6>}
                        <h6 className='s-l' style={bS} onClick={e => { setAct(false); !disabled && downloadFile(_id); }}>Download File</h6>
                        <h6 className='s-l' style={bS} onClick={e => { setAct(false); !disabled && urlFile(_id); !disabled && handleModal(true); }}>Generate Link</h6>
                    </div>
                </h6>
        </div>
        <Tabnav items={[name ? name : '']} icons={icons} i={tabNav} setI={setTN} />
        {tabNav === 0 && <>
            {url !== '' && _id !== '' && renderAccordingToFileTypesDyn(type, url, name, postedBy, date, description, email, contact)}
        </>}
        {sM && <ModalLink showModal={handleModal} />}
    </div>
}

export default connect(null, { AddToF, DelToF, downloadFile, urlFile })(View);