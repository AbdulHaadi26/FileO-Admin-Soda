import React, { useState, useEffect, lazy, Suspense } from 'react';
import Modal from '../../containers/modalBgContainer';
import Link from 'react-router-dom/Link';
import Cross from '../../../assets/cross.svg';
import ConvertDate from '../../containers/dateConvert';
import { updateFile } from '../../../redux/actions/project_filesActions';
import { connect } from 'react-redux';
import Popover from '../../popover';
const CB = lazy(() => import('./cb'));
const dS = { display: 'flex', flexDirection: 'row', alignItems: 'center' };
const lS = { textDecoration: 'none', fontWeight: '400' };
const uS = { fontSize: '11px', fontWeight: '600', color: 'grey', marginLeft: '8px', marginTop: '10px' };
const tM = { width: '10px', marginLeft: '12px', height: '10px', cursor: 'pointer', backgroundImage: `url('${Cross}')` }
const iG = { marginTop: '12px', width: '100%' };
const tS = { marginTop: '12px', width: '100%', textAlign: 'left' };

const Edit = ({ onhandleModal, File, uId, updateFile, onSetData }) => {
    const [text, setText] = useState(''), [description, setDescription] = useState(''), 
        [tempId, setTI] = useState(''), [versions, setVersions] = useState([]), [versionId, setVID] = useState(''), [cbUpload, setCBU] = useState(false),
        [cbVersion, setCBV] = useState(false), [cbCompare, setCBC] = useState(false), [cbLatest, setCBL] = useState(false), [cbActive, setCBA] = useState(false);

    const { file } = File;
    const { _id, org } = file;

    let version = versions.sort(function (a, b) {
        var textA = a.version;
        var textB = b.version;
        return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
    });

    useEffect(() => {
        setVersions(File.versions.reverse());
        setTI(file.category._id);
        setText(file.name); setDescription(file.description);
        setVID(file.versionId); setDescription(file.description ? file.description : '');
        setCBL(file.latest); setCBA(file.active); setCBC(file.compare); setCBV(file.versioning); setCBU(file.uploadable);
    }, [File, file, setVersions, setVID, setTI, setDescription]);

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);
    const uptFile = async (e) => {
        e.preventDefault()
        let data = { name: text, description, cat: tempId, _id: _id, active: cbActive, versioning: cbVersion, compare: cbCompare, uploadable: cbUpload, latest: cbLatest };
        await updateFile(data);
        onhandleModal();
    };

    const renderVersionList = () => version.map(Item => <div className="col-12 p-0" style={dS} key={Item._id} >
        <Link to={`/organization/${Item.org}/myspace/user/${uId}/version/${Item.version}/file/${Item.versionId}`} style={lS}>Version {Item.version}</Link>
        <h6 style={uS}>Uploaded on {ConvertDate(Item.date)}</h6>
        <div style={tM} onClick={e => setTemps(Item._id, Item.version)} />
    </div>);

    const setTemps = (tmpId, vers) => {
        onSetData({ _id: tmpId, orgId: org, versionId: versionId, ver: vers })
    };

    const handleCBA = e => setCBA(e.target.checked);
    const handleCBC = e => setCBC(e.target.checked);
    const handleCBV = e => setCBV(e.target.checked);
    const handleCBU = e => setCBU(e.target.checked);
    const handleCBL = e => setCBL(e.target.checked);

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => uptFile(e)}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>Edit File</h3>
            <hr />
            <div className="col-12" style={{ padding: '6px 12px' }}>
                <h3 style={{ fontWeight: '600', fontSize: '14px' }}>Name</h3>
                <div className="input-group" style={iG}>
                    <input type={'text'} className="form-control" placeholder={'File name'} value={text}
                        onChange={e => setText(e.target.value)} required={true} />
                </div>
                <h3 style={{ fontWeight: '600', fontSize: '14px', marginTop: '18px' }}>Description</h3>
                <div className="input-group" style={iG}>
                    <textarea type='text' className="form-control" placeholder={'File description'} value={description} onChange={e => onhandleInputA(e)} style={tS} />
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <p className="word-count" style={{ fontSize: '12px' }}>{description.split(" ").length} / 500</p>
                </div>
                <h3 style={{ fontWeight: '600', fontSize: '14px', marginTop: '18px' }}>Versions</h3>
                {renderVersionList()}
                <h3 style={{ fontWeight: '600', fontSize: '14px', marginTop: '18px' }}>Permissions</h3>
                <Suspense fallback={<></>}>
                <CB i={'cbActive'} t='Active' c={cbActive} onhandleCB={handleCBA}>
                    <Popover sty={{ marginLeft: '6px' }} text={'This action will activate the file. The project participants will be able to see the file.'} url={`/doc/topic/3/content/0`} />
                </CB>
                <CB i={'cbUpload'} t='Uploadable' c={cbUpload} onhandleCB={handleCBU}>
                    <Popover sty={{ marginLeft: '6px' }} text={'If this is selected then the project participants that are allowed access to this file can also upload to this file.'} url={`/doc/topic/3/content/0`} />
                </CB>
                <CB i={'cbVersion'} t='Versioning' c={cbVersion} onhandleCB={handleCBV}>
                    <Popover sty={{ marginLeft: '6px' }} text={'This action will activate the versioning for a file. Project participant will be able to upload the updated versions.'} url={`/doc/topic/3/content/0`} />
                </CB>
            </Suspense>
            {cbVersion && <Suspense fallback={<></>}>
                <CB i={'cbLatest'} t='Latest Version' c={cbLatest} onhandleCB={handleCBL} >
                    <Popover z={true} sty={{ marginLeft: '6px' }} text={'This action will only show the latest version of file to the user. Only project manager will be able to see all the versions.'} url={`/doc/topic/3/content/0`} />
                </CB>
            </Suspense>}
            {cbVersion && <Suspense fallback={<></>}>
                <CB i={'cbCompare'} t='Compareable' c={cbCompare} disabled={cbLatest} onhandleCB={handleCBC} >
                    <Popover sty={{ marginLeft: '6px' }} text={'This action will allow a project participants to compare all the versions with each other within the system.'} url={`/doc/topic/3/content/0`} />
                </CB>
            </Suspense>}
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal();
                }}>Cancel</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Update</button>
            </div>
        </form>
    </Modal>
};

export default connect(null, { updateFile })(Edit);
