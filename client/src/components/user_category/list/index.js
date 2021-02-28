import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { fetchCombined, registerCat, updateCatName, deleteCat } from '../../../redux/actions/userCategoryActions';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import Tabnav from '../../tabnav';
import More from '../../../assets/more.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import { returnSelectT } from '../../types';
import GenerateFolderLink from './modalLinkFolder';
import GenerateFileLink from './modalLinkFile';
import AddFolder from '../modals/addFolder';
import EditFolder from '../modals/editFolder';
import AddFile from '../modals/addFile';
import AddFiles from '../modals/addFiles';
import DeleteModal from '../../containers/deleteContainer';
import { deleteFile, deleteVersion, getFileDetailsM } from '../../../redux/actions/userFilesActions';
import AddVer from '../modals/addVer';
import AddNew from '../modals/addNew';
import EditFile from '../modals/editFile';
import Assigned from '../modals/shared';
import AssignedFolder from '../modals/sharedFolder';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const FolderList = lazy(() => import('./folderList'));
const FileList = lazy(() => import('./fileList'));
const dF = { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' };
const mT = { marginTop: '16px' };

const ListCat = ({
    id, _id, string, handleS, tabNav, setTN, isList, fileData, type, handleT, fetchCombined, handleISL, getList, registerCat, updateCatName, deleteCat, deleteFile,
    deleteVersion, getFileDetailsM, File
}) => {
    const [ord, setO] = useState(0), [active, setAct] = useState(false), [modalUpt, setMUpt] = useState(false), [ver, setVer] = useState(false), [verN, setVerN] = useState(false),
        [modalDel, setMD] = useState(false), [sM, setSM] = useState(false), [modalDelF, setMDF] = useState(false), [modalAdd, setMA] = useState(false),
        [sMF, setSMF] = useState(false), [upt, setUpt] = useState(false), [catId, setCID] = useState(false), [eF, setEF] = useState(false), [data, setData] = useState(false),
        [string1, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [limitMult2, setLM2] = useState(0), [shModC, setSHMODC] = useState(false),
        [limit2, setL2] = useState(12), [string2, setS2] = useState(''), [typeF, setTF] = useState('Users'), [shMod, setSHMOD] = useState(false);

    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
        return
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    const handleAdd = async text => {

        let data = {
            _id: id,
            uId: _id,
            name: text
        };

        await registerCat(data);
        getList();
    };

    const handleUpt = async (id, text) => {

        let data = {
            _id: id,
            uId: _id,
            value: text
        };

        await updateCatName(data);
        getList();
    };

    const handleSearch = e => {
        e.preventDefault();
        let data = { _id: _id, string: string, type: type === 'All' ? type : type.toLowerCase() };
        fetchCombined(data);
    };

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const renderOptions = () => returnSelectT().map(Item => <option key={Item} data-key={Item}>{Item}</option>);

    const getDetails = (val) => {
        let data = { _id: val, pId: _id, pCat: catId };
        getFileDetailsM(data);
    };

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);
    const onhandleL2 = n => setL2(n);
    const onhandleLM2 = n => setLM2(n);
    const onhandleS2 = s => setS2(s);

    let list = [], listF = [];

    if (fileData && fileData.files) {
        listF = fileData.files;
        listF.map(i => i.isChecked = false);
    }

    if (fileData && fileData.cats) {
        list = fileData.cats;
    };

    return <div className="col-11 c-d-w p-0">
        <h4 className="h">My Space</h4>
        <Tabnav items={['Folders']} i={tabNav} setI={setTN} />
        {tabNav === 0 && <>
            <div style={dF}>
                <div className={`order ${ord < 2 ? 'orderA' : ''}`} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                    <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                    <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
                <div className={`order`} onClick={e => handleISL(!isList)}>
                    <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                </div>
                <h6 className={`order`} style={{ padding: '10px 8px 6px 8px', marginBottom: '0px' }} onClick={e => setAct(!active)} ref={node}>
                    <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')`, position: 'relative' }} />
                    <div className="dropdown-content" style={{ display: `${active ? 'flex' : 'none'}`, top: '30px' }}>
                        <h6 className='s-l' style={bS} onClick={e => { setMA(true); setAct(false); }}>Add Folder</h6>
                        <h6 className='s-l' style={bS} onClick={e => { setUpt(1); setAct(false); }}>Upload File</h6>
                        <h6 className='s-l' style={bS} onClick={e => { setUpt(2); setAct(false); }}>Upload Multiple Files</h6>
                    </div>
                </h6>
            </div>
            <div style={dF}>
                <div className="input-group col-lg-5 col-12" style={mT}>
                    <input type="text" className="form-control" placeholder="Enter text here" value={string} onChange={e => handleS(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                    <select className="custom-select col-lg-2 col-4" onChange={e => handleSelect(e)} defaultValue={type}> {renderOptions()} </select>
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                    </div>
                </div>
            </div>
            {((!listF || listF.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
                <h6>Nothing found</h6>
            </div>}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {list && list.length > 0 && <Suspense fallback={<></>}>
                    <FolderList id={id} ord={ord} uId={_id} list={list} isList={isList} setMUpt={setMUpt} setSHMOD={setSHMODC}
                        setLink={val => setSM(val)} setDel={val => setMD(val)} setCID={val => setCID(val)} /></Suspense>}
                {listF && listF.length > 0 && <Suspense fallback={<></>}>
                    <FileList list={listF} isList={isList} ord={ord} id={id} uId={_id} setEF={val => { setEF(true); getDetails(val); }} setVerN={setVerN}
                        setF={setVer} setDel={setMDF} setLink={setSMF} setSHMOD={setSHMOD} /> </Suspense>}
            </div>
        </>}

        {shMod && <Assigned id={id} _id={_id} fId={shMod} limit={limit} limitMult={limitMult} string={string1} limit2={limit2} limitMult2={limitMult2} string2={string2} tabNav={tabNav}
            handleL={onhandleL} handleLM={onhandleLM} handleS={onhandleS} handleL2={onhandleL2} handleLM2={onhandleLM2} handleS2={onhandleS2} type={typeF} setType={setTF}
            onhandleModal={e => setSHMOD(false)} />}

        {shModC && <AssignedFolder id={id} _id={_id} cId={shModC} limit={limit} limitMult={limitMult} string={string1} limit2={limit2} limitMult2={limitMult2} string2={string2} tabNav={tabNav}
            handleL={onhandleL} handleLM={onhandleLM} handleS={onhandleS} handleL2={onhandleL2} handleLM2={onhandleLM2} handleS2={onhandleS2} type={typeF} setType={setTF}
            onhandleModal={e => setSHMODC(false)} />}

        {eF && File && File.file && <EditFile uId={_id} onSetData={data => { setEF(false); setData(data); }} getList={getList} File={File} onhandleModal={e => setEF(false)} />}

        {modalUpt && <EditFolder txt={modalUpt.name} onhandleUpt={text => handleUpt(modalUpt._id, text)} onhandleModal={e => setMUpt(false)} />}
        {modalAdd && <AddFolder onhandleAdd={text => handleAdd(text)} onhandleModal={e => setMA(false)} />}

        {catId && <AddFile id={id} _id={_id} catId={catId} onhandleModal={e => setCID(false)} />}

        {ver && <AddVer id={id} uId={_id} verId={ver.versionId} onhandleModal={e => setVer(false)} />}
        {verN && <AddNew id={id} verId={verN.versionId} userId={_id} onhandleModal={e => setVerN(false)} />}

        {upt === 1 && <AddFile id={id} _id={_id} catId={''} onhandleModal={e => setUpt(false)} />}
        {upt === 2 && <AddFiles id={id} _id={_id} catId={''} onhandleModal={e => setUpt(false)} />}

        {sM && <GenerateFolderLink catId={sM} showModal={e => setSM(false)} />}
        {sMF && <GenerateFileLink id={sMF} showModal={e => setSMF(false)} />}

        {modalDel && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
            await deleteCat(modalDel);
            getList();
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {modalDelF && <DeleteModal handleModalDel={e => setMDF(false)} handleDelete={async e => {
            await deleteFile(modalDelF, '', '');
            getList();
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {data && <DeleteModal handleModalDel={e => setData(false)} handleDelete={async e => {
            await deleteVersion(data);
            getList();
        }}>
            <p style={mT}>Are you sure that you want to delete version {ver}? </p>
        </DeleteModal>}
    </div >
}

const mapStateToProps = state => {
    return {
        catData: state.Category.list,
        isSuc: state.Category.isSuc,
        fileData: state.File.list,
        isSucF: state.File.isSuc,
        File: state.File.data
    }
}

export default connect(mapStateToProps, { fetchCombined, registerCat, updateCatName, deleteCat, deleteFile, deleteVersion, getFileDetailsM })(ListCat);