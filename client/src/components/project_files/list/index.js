import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { returnSelectT } from '../../types';
import Upt from '../../../assets/upt.svg';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import More from '../../../assets/more.svg';
import Plus from '../../../assets/plus.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import Copy from '../../../assets/copy.svg';
import Cut from '../../../assets/cut.svg';
import Del from '../../../assets/del.svg';
import { ModalProcess } from '../../../redux/actions/profileActions';
import { deleteFiles, cutFiles, copyFiles, fetchCombinedP, deleteFile, getFileDetailsM, deleteVersion } from '../../../redux/actions/project_filesActions';
import { registerCatC, deleteCat, updateCat } from '../../../redux/actions/project_categoryActions';
import AddFolder from '../modals/addFolder';
import EditFolder from '../modals/editFolder';
import DeleteModal from '../../containers/deleteContainer';
import AddFile from '../modals/addFile';
import AddVer from '../modals/addVer';
import AddNew from '../modals/addNew';
import EditFile from '../modals/editFile';
const ModalCut = lazy(() => import('../modals/cutCopy'));
const FileList = lazy(() => import('./fileList'));
const CatList = lazy(() => import('./folderList'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const mT = { marginTop: '16px' };
const bS = { borderBottom: 'solid 1px #dcdde1' };

const List = ({
    project, fetchCombinedP, id, catId, auth, fileData, getList, tabNav, setTN, handleISL, registerCatC,
    isSuc, pId, string, type, handleS, handleT, selectList, isList, ModalProcess, deleteFiles, cutFiles,
    copyFiles, deleteCat, updateCat, profile, setting, deleteFile, getFileDetailsM, deleteVersion, File
}) => {

    const [ord, setO] = useState(0), [sL, setSL] = useState([]), [sv, setSV] = useState(false), [list, setList] = useState([]), [ver, setVer] = useState(false), 
        [listC, setListC] = useState([]), [name, setName] = useState(''), [active, setAct] = useState(false), [mC, setMC] = useState(false), [verN, setVerN] = useState(false),
        [mD, setMD] = useState(false), [mCP, setMCP] = useState(false), [modalAdd, setMA] = useState(false), [modalDel, setMDF] = useState(false), [eF, setEF] = useState(false),
        [modalUpt, setMUpt] = useState(false), [cId, setCID] = useState(false), [upt, setUpt] = useState(false), [modalDelF, setMDFL] = useState(false), [data, setData] = useState(false);
    const node = useRef({});

    useEffect(() => {
        const handleClick = e => {
            if (auth && node && node.current && !node.current.contains(e.target)) {
                setAct(false);
            }
        };
        document.addEventListener('mousedown', handleClick, true);
    }, [auth]);


    useEffect(() => {
        if (isSuc && fileData) {
            let list = fileData.files;
            list && list.length > 0 && list.map(i => i.isChecked = false);
            setList(list);
            setListC(fileData.cats)
        }
        let catList = selectList ? selectList : [];
        if (catList && catList.length > 0)
            catList = catList.filter(i => i._id === catId)
        catList && catList[0] && setName(catList[0].name);
    }, [setList, fileData, selectList, catId, isSuc]);

    const onhandleInput = e => handleS(e.target.value);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSearch = e => {
        e.preventDefault();
        let data = { string: string, pId: pId, cat: catId, type: type === 'All' ? type : type.toLowerCase(), auth: auth };
        fetchCombinedP(data);
    }

    const handleAdd = async text => {

        let data = {
            pId: pId,
            name: text,
            pCat: catId
        };

        await registerCatC(data);
        getList();
    };

    const handleUpt = async (id, text, desc) => {

        let data = {
            _id: id,
            value: text,
            pId: pId,
            desc: desc
        };

        await updateCat(data);
        getList();
    };

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


    const deleteF = async () => {
        if (sL && sL.length > 0) {
            var data = { arr: sL };
            await deleteFiles(data);
            getList();
        }
    }

    const cut = async cId => {
        if (sL && sL.length > 0) {
            var data = { arr: sL, value: cId };
            await cutFiles(data, id, pId);
            cId === catId && getList();
        }
    }

    const copy = async cId => {
        if (sL && sL.length > 0) {
            var data = { arr: sL, catId: cId };
            await copyFiles(data, id, pId);
            cId === catId && getList();
        }
    }

    const handleModal = (e, val) => setMC(val);
    const handleModalC = (e, val) => setMCP(val);

    const getDetails = (val) => {
        let data = { _id: val, pId: pId, pCat: catId };
        getFileDetailsM(data);
    };

    return <div className="col-11 f-w p-0">
        <h4 className="h">{project && project.project ? project.project.name : ''}</h4>
        <Tabnav items={[name]} i={tabNav} setI={setTN} />
        {auth && <div style={dF}>
            <button className="btn btn-dark" type="button" onClick={e => setMA(true)}>Add Folder<div className="faS" style={{ backgroundImage: `url('${Plus}')` }} /></button>
            <button style={{ marginLeft: '6px' }} className="btn btn-dark" onClick={e => setUpt(true)}>Upload file<div className="faS" style={{ backgroundImage: `url('${Upt}')` }} /></button>
        </div>}
        <div style={dF}>
            <div className="input-group" style={mT}>
                <input type="text" className="form-control" placeholder="Enter text here" value={string} onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <select className="custom-select col-lg-2 col-4" onChange={e => handleSelect(e)} defaultValue={type}>
                    {renderOptions()}
                </select>
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
            {auth && <h6 className={`order`} style={{ padding: '10px 8px 6px 8px', position: 'relative' }} onClick={e => setAct(!active)}>
                <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                    {!sv ? <> <h6 className='s-l' style={bS} onClick={e => handleSV()}>Select Object</h6>
                        <h6 className='s-l' onClick={e => addAll()}>Select All</h6>
                    </> : <h6 className='s-l' style={bS} onClick={e => removeAll()}>View Object</h6>}
                </div>
            </h6>}
        </div>
        {auth && sv && <div style={dF}>
            <h6 className={`order`} style={{ padding: '6px 6px 6px 6px' }} onClick={e => sL && sL.length > 0 && setMCP(true)}><div style={{ width: '14px', height: '14px', backgroundImage: `url('${Copy}')` }} /></h6>
            <h6 className={`order`} style={{ padding: '6px 6px 6px 6px' }} onClick={e => sL && sL.length > 0 ? setMC(true) : ModalProcess({ title: 'Files', text: 'Please select a file first.' })}><div style={{ width: '14px', height: '14px', backgroundImage: `url('${Cut}')` }} /></h6>
            <h6 className={`order`} style={{ padding: '6px 6px 6px 6px' }} onClick={e => sL && sL.length > 0 && setMD(true)}><div style={{ width: '14px', height: '14px', backgroundImage: `url('${Del}')` }} /></h6>
        </div>}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
            {listC && listC.length > 0 && <Suspense fallback={<></>}> <CatList isList={isList} list={listC} ord={ord} org={id} auth={auth} pId={pId}
                setMUpt={setMUpt} setMD={setMDF} setCID={setCID} /> </Suspense>}
            {list && list.length > 0 && <Suspense fallback={<></>}>
                <FileList isList={isList} getList={getList} sL={sL} onsetSL={handleSL} list={list} ord={ord} catId={catId}
                    id={id} sv={sv} auth={auth} pId={pId} setMDF={setMDFL} setF={setVer} setFN={setVerN} setEF={val => { setEF(val); getDetails(val); }} />
            </Suspense>}
        </div>
        {((!listC || listC.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
            <h6>Nothing found</h6>
        </div>}

        {eF && File && File.file && <EditFile onSetData={data => { setEF(false); setData(data); }} getList={getList} File={File} onhandleModal={e => setEF(false)} />}

        {ver && <AddVer id={id} userId={profile.user._id} pId={pId} verId={ver.versionId} onhandleModal={e => setVer(false)} />}

        {verN && <AddNew id={id} userId={profile.user._id} pId={pId} verId={verN.versionId} onhandleModal={e => setVerN(false)} />}

        {modalUpt && <EditFolder txt={modalUpt.name} desc={modalUpt.description ? modalUpt.description : ''} onhandleUpt={(text, desc) => handleUpt(modalUpt._id, text, desc)} onhandleModal={e => setMUpt(false)} />}
        {modalAdd && <AddFolder onhandleAdd={(text, desc) => handleAdd(text, desc)} onhandleModal={e => setMA(false)} />}
        {modalDel && <DeleteModal handleModalDel={e => setMDF(false)} handleDelete={async e => {
            await deleteCat(modalDel, '', '');
            getList();
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {modalDelF && <DeleteModal handleModalDel={e => setMDFL(false)} handleDelete={async e => {
            await deleteFile(modalDelF, '', '');
            getList();
        }}>

            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {cId && <AddFile setting={setting && setting.setting} id={id} _id={pId} userId={profile.user._id} catId={cId} onhandleModal={e => setCID(false)} />}
        {upt && <AddFile setting={setting && setting.setting} id={id} _id={pId} userId={profile.user._id} catId={catId} onhandleModal={e => setUpt(false)} />}

        {mD && <Suspense fallback={<></>}><DeleteModal handleDelete={deleteF} handleModalDel={e => setMD(false)}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>
        </Suspense>}
        {mC && <Suspense fallback={<></>}><ModalCut text={'Move To'} catL={selectList} onhandleIds={cut} onhandleModalC={handleModal} catId={catId} /></Suspense>}
        {mCP && <Suspense fallback={<></>}><ModalCut text={'Copy To'} catL={selectList} onhandleIds={copy} onhandleModalC={handleModalC} catId={catId} /></Suspense>}

        {data && <DeleteModal handleModalDel={e => setData(false)} handleDelete={async e => {
            await deleteVersion(data);
            getList();
        }}>
            <p style={mT}>Are you sure that you want to delete version {ver}? </p>
        </DeleteModal>}
    </div>;
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isSuc: state.File.isSuc,
        selectList: state.Category.list,
        isSucP: state.Project.isSuc,
        project: state.Project.data,
        profile: state.Profile.data,
        setting: state.setting.data,
        File: state.File.data
    }
};

export default connect(mapStateToProps, {
    fetchCombinedP, registerCatC, ModalProcess, deleteFiles, cutFiles,
    copyFiles, deleteCat, updateCat, deleteFile, deleteVersion, getFileDetailsM
})(List);