import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { deleteFiles, fetchCombined, cutFiles, copyFiles, deleteFile, getFileDetailsM, deleteVersion } from '../../../redux/actions/userFilesActions';
import { returnSelectT } from '../../types';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import More from '../../../assets/more.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import Cut from '../../../assets/cut.svg';
import Del from '../../../assets/del.svg';
import Copy from '../../../assets/copy.svg';
import { registerCatC, updateCatName, deleteCat } from '../../../redux/actions/userCategoryActions';
import { ModalProcess } from '../../../redux/actions/profileActions';
import EditFolder from '../modals/editFolder';
import AddFolder from '../modals/addFolder';
import GenerateFileLink from './modalLinkFile';
import GenerateFolderLink from './modalLinkFolder';
import DeleteModal from '../../containers/deleteContainer';
import AddFile from '../modals/addFile';
import AddFiles from '../modals/addFiles';
import AddVer from '../modals/addVer';
import AddNew from '../modals/addNew';
import EditFile from '../modals/editFile';
import Assigned from '../modals/shared';
import AssignedFolder from '../modals/sharedFolder';
const CutCopyModal = lazy(() => import('../modals/cutCopy'));
const FileList = lazy(() => import('./fileList'));
const FolderList = lazy(() => import('./folderList'));
const dF = { display: 'flex', justifyContent: 'flex-end', position: 'relative' };
const mT = { marginTop: '16px' };
const bS = { borderBottom: 'solid 1px #dcdde1' };


const List = ({
    fetchCombined, id, _id, catId, fileData, getList, string, type, ModalProcess, getFileDetailsM,
    handleS, handleT, selectList, tabNav, setTN, isList, handleISL, registerCatC, File, profile,
    category, deleteFiles, copyFiles, cutFiles, updateCatName, deleteCat, deleteFile, deleteVersion
}) => {

    const [ord, setO] = useState(0), [sv, setSV] = useState(false), [name, setName] = useState(''), [sMF, setSMF] = useState(false), [cId, setCID] = useState(false), [data, setData] = useState(false),
        [active, setAct] = useState(false), [sL, setSL] = useState([]), [list, setList] = useState([]), [mC, setMC] = useState(false), [mD, setMD] = useState(false), [mCP, setMCP] = useState(false),
        [listC, setListC] = useState([]), [sM, setSM] = useState(false), [modalAdd, setMA] = useState(false), [modalDelF, setMDF] = useState(false), [ver, setVer] = useState(false), [verN, setVerN] = useState(false),
        [modalUpt, setMUpt] = useState(false), [sMFL, setSMFL] = useState(false), [modalDelFL, setMDFL] = useState(false), [upt, setUpt] = useState(false), [eF, setEF] = useState(false),
        [string1, setS] = useState(''), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [limitMult2, setLM2] = useState(0), [shModC, setSHMODC] = useState(false),
        [limit2, setL2] = useState(12), [string2, setS2] = useState(''), [typeF, setTF] = useState('Users'), [shMod, setSHMOD] = useState(false);
    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);
    const onhandleL2 = n => setL2(n);
    const onhandleLM2 = n => setLM2(n);
    const onhandleS2 = s => setS2(s);

    useEffect(() => {

        if (fileData && fileData.files) {
            let list = fileData.files;
            list.map(i => i.isChecked = false);
            setList(list);
        }

        if (fileData && fileData.cats) {
            let list = fileData.cats;
            setListC(list);
        };

        if (category && category.cat) {
            setName(category.cat.name);
        }

    }, [setList, fileData, catId, category]);

    const onhandleInput = e => handleS(e.target.value);

    const handleModal = bool => setSM(bool);

    const handleAdd = async text => {

        let data = {
            _id: id,
            uId: _id,
            name: text,
            pCat: catId
        };

        await registerCatC(data);
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

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSearch = e => {
        e.preventDefault();
        let data = { string: string, cat: catId, type: type === 'All' ? type : type.toLowerCase(), pId: _id };
        fetchCombined(data);
    }

    const renderOptions = () => returnSelectT().map(Item => <option key={Item} data-key={Item}>{Item}</option>);

    const handleSL = lst => {
        var tempList = list;
        tempList.map(i => {
            i.isChecked = false;
            lst && lst.length > 0 && lst.map(j => {
                if (i._id === j) i.isChecked = true;
                return j;
            });
            return i;
        });
        setList(tempList);
        setSL(lst);
    }

    const addAll = () => {
        var tempList = [];
        var tempData = list;
        tempData.map(i => {
            tempList.push(i._id);
            i.isChecked = true;
            return i;
        });
        setSL(tempList);
        setList(tempData);
        setSV(true);
    }

    const removeAll = () => {
        var tempData = list;
        tempData.map(i => i.isChecked = false);
        setSL([]);
        setList(tempData);
        setSV(false);
    }

    const handleSV = () => {
        var tempData = list;
        tempData.map(i => i.isChecked = false);
        setSL([]);
        setList(tempData);
        setSV(true);
    }

    async function deleteF() {
        if (sL && sL.length > 0) {
            var data = { arr: sL };
            await deleteFiles(data);
            getList();
        }
    }

    const handleSel = File => {
        var tempList = sL;
        if (!File.isChecked) {
            tempList.push(File._id);
            handleSL(tempList);
        } else {
            tempList = tempList.filter(i => i !== File._id);
            handleSL(tempList);
        }
    }

    async function cut(cId) {
        if (sL && sL.length > 0) {
            var data = { arr: sL, value: cId };
            await cutFiles(data, id, _id);
            cId === catId && getList();
        }
    }

    function handleModalCP(e, val) {
        setMC(val);
    }

    const copy = async cId => {
        if (sL && sL.length > 0) {
            var data = { arr: sL, catId: cId };
            await copyFiles(data, id, _id);
            cId === catId && getList();
        }
    }

    const handleModalC = (e, val) => setMCP(val);

    const getDetails = (val) => {
        let data = { _id: val, pId: _id, pCat: catId };
        getFileDetailsM(data);
    };

    return <div className="col-11 f-w p-0">
        <h4 className="h">User Files</h4>
        <Tabnav items={[name]} i={tabNav} setI={setTN} />
        <div style={dF}>
            <div className="input-group" style={mT}>
                <input type="text" className="form-control" placeholder="Enter text here" value={string} onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <select className="custom-select col-lg-2 col-4" onChange={e => handleSelect(e)} defaultValue={type}> {renderOptions()} </select>
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                </div>
            </div>
        </div>
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
            <h6 className={`order`} style={{ padding: '10px 8px 6px 8px', position: 'relative' }} onClick={e => setAct(!active)}>
                <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                <div ref={node} className="dropdown-content" style={{ display: `${active ? 'flex' : 'none'}`, top: '30px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setMA(true); setAct(false); }}>Add Folder</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setUpt(1); setAct(false); }}>Upload File</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setUpt(2); setAct(false); }}>Upload Multiple Files</h6>
                    {!sv ? <> <h6 className='s-l' style={bS} onClick={e => handleSV()}>Select Object</h6>
                        <h6 className='s-l' style={bS} onClick={e => addAll()}>Select All</h6>
                    </> : <h6 className='s-l' style={bS} onClick={e => removeAll()}>View Object</h6>}
                    <h6 className='s-l' style={bS} onClick={e => setSHMODC(catId)}>Share Folder</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setSM(true); setAct(false); }}>Generate Link</h6>
                </div>
            </h6>
        </div>
        {sv && <div style={dF}>
            <h6 className={`order`} style={{ padding: '6px 6px 6px 6px' }} onClick={e => sL && sL.length > 0 && setMCP(true)}><div style={{ width: '14px', height: '14px', backgroundImage: `url('${Copy}')` }} /></h6>
            <h6 className={`order`} style={{ padding: '6px 6px 6px 6px' }} onClick={e => sL && sL.length > 0 ? setMC(true) : ModalProcess({ title: 'Files', text: 'Please select a file first.' })}><div style={{ width: '14px', height: '14px', backgroundImage: `url('${Cut}')` }} /></h6>
            <h6 className={`order`} style={{ padding: '6px 6px 6px 6px' }} onClick={e => sL && sL.length > 0 && setMD(true)}><div style={{ width: '14px', height: '14px', backgroundImage: `url('${Del}')` }} /></h6>
        </div>}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
            {listC && listC.length > 0 && <Suspense fallback={<></>}>
                <FolderList id={id} ord={ord} uId={_id} list={listC} isList={isList} setSHMOD={setSHMODC}
                    setLink={val => setSMF(val)} setDel={val => setMDF(val)} setMUpt={setMUpt} />
            </Suspense>}
            {list && list.length > 0 && <Suspense fallback={<></>}>
                <FileList sL={sL} setDel={setMDFL} setLink={setSMFL} setF={setVer} setEF={val => { setEF(val); getDetails(val) }} setVerN={setVerN}
                    isList={isList} handleSel={handleSel} list={list} ord={ord} sv={sv} id={id} catId={catId} uId={_id} setSHMOD={setSHMOD} /> </Suspense>}
        </div>
        {((!listC || listC.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
            <h6>Nothing found</h6>
        </div>}

        {eF && File && File.file && <EditFile uId={_id} onSetData={data => { setEF(false); setData(data); }} getList={getList} File={File} onhandleModal={e => setEF(false)} />}

        {shMod && <Assigned id={id} _id={_id} fId={shMod} limit={limit} limitMult={limitMult} string={string1} limit2={limit2} limitMult2={limitMult2} string2={string2} tabNav={tabNav}
            handleL={onhandleL} handleLM={onhandleLM} handleS={onhandleS} handleL2={onhandleL2} handleLM2={onhandleLM2} handleS2={onhandleS2} type={typeF} setType={setTF}
            onhandleModal={e => setSHMOD(false)} />}

        {shModC && <AssignedFolder id={id} _id={_id} cId={shModC} limit={limit} limitMult={limitMult} string={string1} limit2={limit2} limitMult2={limitMult2} string2={string2} tabNav={tabNav}
            handleL={onhandleL} handleLM={onhandleLM} handleS={onhandleS} handleL2={onhandleL2} handleLM2={onhandleLM2} handleS2={onhandleS2} type={typeF} setType={setTF}
            onhandleModal={e => setSHMODC(false)} />}


        {ver && <AddVer id={id} uId={_id} verId={ver.versionId} onhandleModal={e => setVer(false)} />}
        {verN && <AddNew id={id} verId={verN.versionId} userId={profile.user._id} onhandleModal={e => setVerN(false)} />}

        {cId && <AddFile id={id} _id={_id} catId={cId} onhandleModal={e => setCID(false)} />}

        {upt === 1 && <AddFile id={id} _id={_id} catId={catId} onhandleModal={e => setUpt(false)} />}
        {upt === 2 && <AddFiles id={id} _id={_id} catId={catId} onhandleModal={e => setUpt(false)} />}

        {modalAdd && <AddFolder onhandleAdd={text => handleAdd(text)} onhandleModal={e => setMA(false)} />}
        {modalUpt && <EditFolder txt={modalUpt.name} onhandleUpt={text => handleUpt(modalUpt._id, text)} onhandleModal={e => setMUpt(false)} />}

        {mC && <Suspense fallback={<></>}><CutCopyModal text="Move To" catL={selectList} onhandleIds={cut} onhandleModalC={handleModalCP} catId={catId} /></Suspense>}
        {mCP && <Suspense fallback={<></>}><CutCopyModal text="Copy To" catL={selectList} onhandleIds={copy} onhandleModalC={handleModalC} catId={catId} /></Suspense>}

        {sM && <GenerateFolderLink catId={catId} showModal={handleModal} />}
        {sMF && <GenerateFolderLink catId={sMF} showModal={e => setSMF(false)} />}
        {sMFL && <GenerateFileLink id={sMFL} showModal={e => setSMFL(false)} />}

        {mD && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
            await deleteF();
            getList();
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {modalDelF && <DeleteModal handleModalDel={e => setMDF(false)} handleDelete={async e => {
            await deleteCat(modalDelF);
            getList();
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {modalDelFL && <DeleteModal handleModalDel={e => setMDFL(false)} handleDelete={async e => {
            await deleteFile(modalDelFL, '', '');
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
    </div>
}

const mapStateToProps = state => {
    return {
        File: state.File.data,
        fileData: state.File.list,
        selectList: state.Category.list,
        category: state.Category.data,
        profile: state.Profile.data
    }
};

export default connect(mapStateToProps, {
    fetchCombined, registerCatC, ModalProcess, deleteFiles, getFileDetailsM,
    cutFiles, copyFiles, updateCatName, deleteCat, deleteFile, deleteVersion
})(List);