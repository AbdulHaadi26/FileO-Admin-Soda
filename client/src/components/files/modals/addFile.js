import React, { lazy, Suspense, Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { registerFile } from '../../../redux/actions/fileActions';
import '../style.css';
import returnType, { finalizeType } from '../../types';
import Popover from '../../popover';
import Modal from '../../containers/modalBgContainer';
const File = lazy(() => import('../selectFile/file'));
const CB = lazy(() => import('./cb'));
const dF = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const eS = { marginTop: '16px', marginBottom: '12px', marginLeft: '1%', width: '89%', textAlign: 'left', fontWeight: 700, color: '#b33939', fontSize: '12px' };
const tS = { resize: 'none', height: '60px' };

const Add = ({ setting, registerFile, id, userId, catId, onhandleModal }) => {

    const [name, setN] = useState(''), [errn, setErrN] = useState(false), [size, setS] = useState(0),
        [type, setT] = useState(''), [value, setV] = useState(''), [file, setF] = useState(''), [fS, setFS] = useState(''), [fName, setFN] = useState(''),
        [errF, setErrF] = useState(false), [errB, setErrB] = useState(false), [cbActive, setCB] = useState(false), [mimeT, setMT] = useState(''),
        [cbVersion, setCBV] = useState(false), [cbCompare, setCBC] = useState(false), [errS, setErrS] = useState(false), [description, setDescription] = useState(''),
        [cbUpt, setCBU] = useState(false), [cbLatest, setCBL] = useState(false);

    let fileSize = setting && setting.maxFileSize ? setting.maxFileSize : 5;

    const handleSubmit = e => {
        e.preventDefault();
        if (name && fS && !errB) {
            setErrB(false); setErrF(false);

            let latest = cbVersion ? cbLatest : false;
            let ver = cbVersion && !latest ? cbCompare : false;

            let data = {
                name: name, size: size, postedby: userId, org: id, category: catId, mime: mimeT, fName: fName, latest: latest,
                active: cbActive, type: type, versioning: cbVersion, compare: ver, description: description ? description : '',
                uploadable: cbUpt
            };
            onhandleModal();
            registerFile(data, file);
        } else {
            !name && setErrN(true); !fS && setErrS(true);
        }
    }

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);

    const onhandleInput = e => {
        setN(e.target.value);
        setErrN(false);
    }
    const handleCBAct = e => setCB(e.target.checked);
    const handleCBCmp = e => setCBC(e.target.checked);
    const handleCBVer = e => setCBV(e.target.checked);
    const handleCBUpt = e => setCBU(e.target.checked);
    const handleCBLatest = e => setCBL(e.target.checked);

    const handleFilePreview = e => {
        if (e.target.files && e.target.files[0]) {
            setErrB(false); setErrS(false); setErrF(false);
            var type = e.target.files[0].name.split(".");
            var typeS = finalizeType(type[type.length - 1]);
            setT(typeS);
            setV(returnType(typeS));
            if (e.target.files[0].size <= (fileSize * 1024 * 1024)) {
                setF(e.target.files[0]); setS(e.target.files[0].size); setFS(true);
                setFN(e.target.files[0].name); setN(type[0]); setMT(e.target.files[0].type);
            } else setErrF(true);
        }
    }

    return <Modal handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Upload File</h3>
        <hr />
        <div className="col-12" style={dF}>
            <Suspense fallback={<Fragment />}>
                <File value={value} size={fileSize} errBroken={errB} errFile={errF} errSelected={errS} onhandleFilePreview={handleFilePreview} />
            </Suspense>
        </div>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            <div className="input-group" style={{ width: '100%', marginTop: '12px' }}>
                <input type={'text'} className="form-control" placeholder={'File name'} value={name} onChange={e => onhandleInput(e)} />
            </div>
            {errn && <div style={eS}>This field is required</div>}
            <div className="input-group" style={{ width: '100%', marginTop: '12px' }}>
                <textarea type='text' className="form-control" placeholder={'File description'} value={description} onChange={e => onhandleInputA(e)} style={tS} />
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '8px' }}>
                <p className="word-count" style={{ fontSize: '12px' }}>{description.split(" ").length} / 500</p>
            </div>
            <Suspense fallback={<></>}>
                <CB i={'cbActive'} t='Active' c={cbActive} onhandleCB={handleCBAct}>
                    <Popover sty={{ marginLeft: '6px' }} text={'This action will activate the file. The relevant user will be able to see the file.'} url={`/doc/topic/3/content/0`} />
                </CB>
                <CB i={'cbUpt'} t='Uploadable' c={cbUpt} onhandleCB={handleCBUpt}>
                    <Popover sty={{ marginLeft: '6px' }} text={'If this is selected then the users that are allowed access to this file can also upload to this file.'} url={`/doc/topic/3/content/0`} />
                </CB>
                <CB i={'cbVersion'} t='Versioning' c={cbVersion} onhandleCB={handleCBVer}>
                    <Popover sty={{ marginLeft: '6px' }} text={'This action will activate the versioning for a file. Users will be able to upload the updated versions.'}
                        url={`/doc/topic/3/content/0`} />
                </CB>
            </Suspense>
            {cbVersion && <Suspense fallback={<></>}>
                <CB i={'cbLatest'} t='Latest Version' c={cbLatest} onhandleCB={handleCBLatest} >
                    <Popover z={true} sty={{ marginLeft: '6px' }} text={'This action will only show the latest version of file to the user. Only you will be able to see all the versions.'} url={`/doc/topic/3/content/0`} />
                </CB>
            </Suspense>}
            {cbVersion && <Suspense fallback={<></>}>
                <CB i={'cbCompare'} t='Compareable' c={cbCompare} onhandleCB={handleCBCmp} disabled={cbLatest}>
                    <Popover sty={{ marginLeft: '6px' }} text={'This action will allow a user to compare all the versions with each other within the system.'} url={'/doc/topic/3/content/0'} />
                </CB>
            </Suspense>}
        </div>
        <hr />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
            <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                onhandleModal();
            }}>Cancel</button>
            <button className="btn btn-primary" type="button" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                handleSubmit(e);
            }}>Upload</button>
        </div>
    </Modal >
};


export default connect(null, { registerFile })(Add);