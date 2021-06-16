import React, { useState, useEffect, useRef } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import Link from 'react-router-dom/Link';
import { finalizeType, returnSelectT } from '../../types';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import More from '../../../assets/elpW.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import { ModalProcess } from '../../../redux/actions/profileActions';
import {
    deleteFiles,
    cutFiles,
    copyFiles,
    fetchCombinedP,
    deleteFile,
    getFileDetailsM,
    deleteVersion,
    cutFile,
    registerFileNew,
    registerFileVer,
    registerFile
} from '../../../redux/actions/project_filesActions';
import {
    registerCatC,
    deleteCat,
    updateCat,
    registerCat
} from '../../../redux/actions/project_categoryActions';
import AddFolder from '../modals/addFolder';
import EditFolder from '../modals/editFolder';
import DeleteModal from '../../containers/deleteContainer';
import AddFile from '../modals/addFile';
import AddVer from '../modals/addVer';
import AddNew from '../modals/addNew';
import EditFile from '../modals/editFile';
import FolderList from './folderList';
import FileList from './fileList';
import { DragDropContext } from 'react-beautiful-dnd';
import DragDrop from '../../dragDrop';
import UploadFile from '../../uploadModal/uploadPFile';
import MoveCopyModal from '../modals/folderList';
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
import Searchbar from '../../searchbarReusable';
let icons = [{ G: GFolder, B: BFolder }];

const mT = {
    marginTop: '16px'
};

const List = ({
    project, fetchCombinedP, id, catId, auth, fileData, getList, tabNav, setTN, handleISL, registerCatC,
    pId, string, type, handleS, handleT, isList, deleteFiles, cutFiles, disabled,
    copyFiles, deleteCat, updateCat, profile, setting, deleteFile, getFileDetailsM, deleteVersion, File,
    category, cutFile, _id, registerFile, registerFileNew, registerFileVer, registerCat
}) => {

    const [ord, setO] = useState(0), [sL, setSL] = useState([]), [sv, setSV] = useState(false), [list, setList] = useState([]), [ver, setVer] = useState(false),
        [listC, setListC] = useState([]), [name, setName] = useState(''), [active, setAct] = useState(false), [verN, setVerN] = useState(false),
        [mD, setMD] = useState(false), [modalAdd, setMA] = useState(false), [modalDel, setMDF] = useState(false), [eF, setEF] = useState(false),
        [modalUpt, setMUpt] = useState(false), [cId, setCID] = useState(false), [upt, setUpt] = useState(false), [modalDelF, setMDFL] = useState(false), [data, setData] = useState(false);
    const node = useRef({}), nodeV = useRef({}), [copy, setCopy] = useState({
        type: 0, _id: '', catId: catId, isModal: false, sId: catId
    }), [move, setMove] = useState({
        type: 0, _id: '', catId: catId, isModal: false, sId: catId
    }), [mark, setMark] = useState({
        type: 0, _id: 0, catId: catId, isModal: false, sId: catId
    }), [activeV, setActV] = useState(false);

    useEffect(() => {
        const handleClick = e => {
            if (auth && node && node.current && !node.current.contains(e.target)) {
                setAct(false);
            }
        };

        document.addEventListener('mousedown', handleClick, true);
    }, [auth]);

    useEffect(() => {
        const handleClick = e => {
            if (auth && nodeV && nodeV.current && !nodeV.current.contains(e.target)) {
                setActV(false);
            }
        };

        document.addEventListener('mousedown', handleClick, true);
    }, [auth]);


    useEffect(() => {
        if (fileData) {
            let list = fileData.files;
            list && list.length > 0 && list.map(i => i.isChecked = false);
            setList(list);
            fileData.cats && setListC(fileData.cats)
        }

        if (category && category.cat) {
            setName(category.cat.name);
        }
    }, [setList, fileData, catId, category]);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleSearch = e => {
        e.preventDefault();
        let data = {
            string: string, pId: pId, cat: catId,
            type: type === 'All' ? type : type.toLowerCase(),
            auth: auth
        };
        fetchCombinedP(data);
    };

    const handleAdd = async (text, desc) => {

        let data = {
            pId: pId,
            name: text,
            pCat: catId,
            desc
        };

        await registerCatC(data);
    };

    const handleUpt = async (id, text, desc) => {

        let data = {
            _id: id,
            value: text,
            pId: pId,
            desc: desc
        };

        await updateCat(data);
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
    };

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
    };

    const removeAll = (isT) => {
        var tempData = list;
        tempData.map(i => i.isChecked = false);
        setSL([]);
        setList(tempData);
        isT && setSV(false);
    };

    const handleSV = () => {
        var tempData = list;
        tempData.map(i => i.isChecked = false);
        setSL([]);
        setList(tempData);
        setSV(true);
    };

    const deleteF = async () => {
        if (sL && sL.length > 0) {
            let data = { arr: sL };
            await deleteFiles(data);
        }
    };

    const cut = async cId => {
        if (sL && sL.length > 0) {
            var data = { arr: sL, value: cId };
            await cutFiles(data, id, pId);
        }
    };

    const copyF = async cId => {
        if (sL && sL.length > 0) {
            var data = { arr: sL, catId: cId };
            await copyFiles(data, id, pId);
        }
    };

    const getDetails = (val) => {
        let data = { _id: val, pId: pId, pCat: catId };
        getFileDetailsM(data);
    };

    const handleOnDragEnd = async (data) => {
        if (auth && data && data.source && data.destination) {
            let destination = data.destination.droppableId.split('-');
            let source = data.source.droppableId.split('-');
            if (destination[destination.length - 2] === 'Folder' && source[source.length - 2] === 'File') {
                let folderId = destination[destination.length - 1];
                let fileId = source[source.length - 1];

                await cutFile({ _id: fileId, cat: folderId });
            }
        }
    };

    const handleSuccess = (file) => {
        if (file && !disabled) {
            let type = file.name.split(".");
            let typeS = finalizeType(type[type.length - 1]);

            let data = {
                name: type[0], size: file.size, active: true, uploadable: true,
                mime: file.type, postedby: _id, versioning: true, latest: false,
                org: id, category: catId, type: typeS, compare: false, pId,
                description: '', fName: file.name, uploadType: 1
            };
            registerFile(data, file);
        };
    };

    const handleVer = (file, dFile) => {
        if (file) {
            let type = dFile.name.split(".");
            let typeS = finalizeType(type[type.length - 1]);
            let data = {
                _id: file.versionId, mime: dFile.type, name: file.name, size: dFile.size,
                postedby: file.postedby, org: file.org, category: file.category ? file.category._id : '',
                active: true, type: typeS, description: '', fName: dFile.name, pId,
                uploadable: true, compare: false, latest: false, versioning: true
            };
            registerFileVer(data, dFile);
        };
    }

    const handleNew = (file, dFile) => {
        if (file) {
            let type = dFile.name.split(".");
            let typeS = finalizeType(type[type.length - 1]);

            let data = {
                _id: file.versionId, name: file.name, size: dFile.size, mime: dFile.type,
                postedby: file.postedby, org: file.org, category: file.category ? file.category._id : '',
                active: true, type: typeS, description: '', fName: dFile.name, pId,
                uploadable: true, compare: false, latest: false, versioning: true
            };

            registerFileNew(data, dFile);
        };
    }

    const BreadCrumb = () => {
        if (category && category.cat) {
            return <>
                <Link to={`/organization/${id}/projects/${pId}/categories/list/page/0`} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>{project && project.project ? project.project.name : ''}</Link>
                <Link to={`/organization/${id}/projects/${pId}/categories/list/page/0`} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>{'>'}</Link>
                {category.cat.pCat && category.cat.pCat.length > 0 && category.cat.pCat.map((pCat, k) => <div style={{ display: 'flex', flexDirection: 'row' }} key={k}>
                    <Link to={`/organization/${id}/projects/${pId}/files/${pCat._id}/list`}
                        style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>{pCat.name}</Link>
                    <Link to={`/organization/${id}/projects/${pId}/files/${pCat._id}/list`}
                        style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer', marginTop: '-2px' }}>{'>'}</Link>
                </div>)}
                <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px' }}>{category.cat.name}</h6>
            </>
        };

        return <Link to={`/organization/${id}/projects/${pId}/categories/list/page/0`} style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer' }}>{project && project.project ? project.project.name : ''}</Link>
    };

    const handleAddC = async (text, desc, pCat) => {

        let data;

        if (!pCat) data = {
            _id: id,
            name: text,
            desc: desc,
            pId,
            skip: true
        };
        else data = {
            _id: id,
            name: text,
            desc: desc,
            pCat: pCat,
            pId,
            skip: true
        }

        !pCat ? await registerCat(data) : await registerCatC(data);
        setCopy({ ...copy, isModal: false });
        setMove({ ...move, isModal: false });
        setMark({ ...mark, isModal: false });

    };

    return <DragDrop handleSuccess={handleSuccess}>
        <div className="col-11 f-w p-0">
            <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <h4 className="h">{project && project.project ? project.project.name : ''}</h4>
                <div style={{ marginLeft: 'auto' }} />
                <Searchbar isCreate={auth} classN={auth ? `col-lg-7 col-12` : 'col-lg-5 col-12'} pad={auth} value={string} onHandleInput={val => handleS(val)}
                    callFunc={e => setActV(true)} isElp={true} 
                    holder={'Enter text here'} handleSearch={e => handleSearch(e)} comp={<>
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className="custom-select col-3" onChange={e => handleSelect(e)} value={type}>
                            {renderOptions()}
                        </select>
                    </>}>
                    {auth && <div className="dropdown-content-c" ref={nodeV} style={{ display: `${activeV ? 'flex' : 'none'}` }}>
                        <h6 className='s-l' onClick={e => { setActV(false); !disabled && setMA(true); }}>Add Folder</h6>
                        <h6 className='s-l' onClick={e => { setActV(false); !disabled && setUpt(true); }}>Upload File</h6>
                    </div>}
                    {auth && <h6 className={`mTHS`} style={{ padding: '10px 8px 6px 8px', position: 'relative', marginTop: '0px', marginBottom: '0px', marginRight: '-3px' }}>
                        <div className="more" onClick={e => setAct(true)}
                            style={{
                                width: '14px', height: '14px', marginRight: '-3px', backgroundImage: `url('${More}')`,
                                cursor: 'pointer', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'
                            }}
                        />
                        <div className="dropdown-content-c" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                            {!sv ? <>
                                <h6 className='s-l' onClick={e => { setAct(false); handleSV(); }}>Mark</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); addAll(); }}>Mark All</h6>
                            </> : <>
                                <h6 className='s-l' onClick={e => { setAct(false); removeAll(true) }}>View Mode</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); setMark({ ...mark, _id: 1 }); }}>Move</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); !disabled && setMark({ ...mark, _id: 2 }); }}>Copy</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); setMD(true); }}>Delete</h6>
                            </>}
                        </div>
                    </h6>}
                </Searchbar>
                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ord < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px', marginLeft: '12px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                        <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Date</span>
                    </div>
                    <div className={`order mTHS ${ord >= 2 ? 'orderA' : ''}`} style={{ marginTop: '0px', padding: '4px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                        <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Name</span>
                    </div>
                    <div className={`order mTHS`} style={{ marginTop: '0px' }} onClick={e => handleISL(!isList)}>
                        <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                    </div>
                </div>
            </div>
            <Tabnav items={[name]} i={tabNav} setI={setTN} icons={icons} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>{BreadCrumb()}</div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    {listC && listC.length > 0 &&
                        <FolderList isList={isList} list={listC} ord={ord} org={id} auth={auth} pId={pId}
                            setMUpt={setMUpt} setMD={setMDF} setCID={setCID} disabled={disabled}
                            setCopy={data => setCopy({ type: 0, _id: data._id, catId: catId, sId: catId })}
                            setMove={data => setMove({ type: 0, _id: data._id, catId: catId, sId: catId })} />}
                    {list && list.length > 0 &&
                        <FileList isList={isList} sL={sL} onsetSL={handleSL} list={list} ord={ord} catId={catId}
                            id={id} sv={sv} auth={auth} pId={pId} setMDF={setMDFL} setF={setVer} setFN={setVerN}
                            setCopy={data => setCopy({ type: 1, _id: data._id, catId: catId, sId: catId })}
                            setMove={data => setMove({ type: 1, _id: data._id, catId: catId, sId: catId })}
                            setEF={val => { setEF(val); getDetails(val); }} disabled={disabled} />}
                </DragDropContext>
            </div>
            {((!listC || listC.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
                <h6>Nothing found</h6>
            </div>}

            {copy._id && !copy.isModal && <MoveCopyModal name={project && project.project ? project.project.name : ''} pId={pId} data={copy} title={'Copy'} onhandleModal={e => getList()} type={0}
                setCId={catId => setCopy({ ...copy, catId: catId })} setMA={e => setCopy({ ...copy, isModal: true })} setSId={catId => setCopy({ ...copy, sId: catId })}
            />}

            {move._id && !move.isModal && <MoveCopyModal name={project && project.project ? project.project.name : ''} pId={pId} data={move} title={'Move'} onhandleModal={e => getList()} type={1}
                setCId={catId => setMove({ ...move, catId: catId })} setMA={e => setMove({ ...move, isModal: true })} setSId={catId => setMove({ ...move, sId: catId })}
            />}

            {mark._id > 0 && !mark.isModal && <MoveCopyModal name={project && project.project ? project.project.name : ''} data={mark} title={mark._id === 1 ? 'Move' : 'Copy'} onhandleModal={e => getList()}
                callFunc={e => mark._id === 1 ? cut(mark.catId) : copyF(mark.catId)} type={3}
                setCId={catId => setMark({ ...mark, catId: catId })} setMA={e => setMark({ ...mark, isModal: true })}
                setSId={catId => setMark({ ...mark, sId: catId, catId: catId })}
            />}

            {copy.isModal && <AddFolder onhandleAdd={(text, desc) => handleAddC(text, desc, copy.sId)} onhandleModal={e => setCopy({ ...copy, isModal: false })} />}
            {move.isModal && <AddFolder onhandleAdd={(text, desc) => handleAddC(text, desc, move.sId)} onhandleModal={e => setMove({ ...move, isModal: false })} />}
            {mark.isModal && <AddFolder onhandleAdd={text => handleAddC(text, '', mark.sId)} onhandleModal={e => setMark({ ...mark, isModal: false })} />}

            {eF && File && File.file && <EditFile onSetData={data => { setEF(false); setData(data); }} File={File} onhandleModal={e => setEF(false)} />}

            {ver && <AddVer id={id} userId={profile.user._id} pId={pId} verId={ver.versionId} onhandleModal={e => setVer(false)} />}

            {verN && <AddNew id={id} userId={profile.user._id} pId={pId} verId={verN.versionId} onhandleModal={e => setVerN(false)} />}

            {modalUpt && <EditFolder txt={modalUpt.name} desc={modalUpt.description ? modalUpt.description : ''} onhandleUpt={(text, desc) => handleUpt(modalUpt._id, text, desc)} onhandleModal={e => setMUpt(false)} />}
            {modalAdd && <AddFolder onhandleAdd={(text, desc) => handleAdd(text, desc)} onhandleModal={e => setMA(false)} />}
            {modalDel && <DeleteModal handleModalDel={e => setMDF(false)} handleDelete={async e => {
                await deleteCat(modalDel, '', '');
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {modalDelF && <DeleteModal handleModalDel={e => setMDFL(false)} handleDelete={async e => {
                await deleteFile(modalDelF, '', '');
            }}>

                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {cId && <AddFile setting={setting && setting.setting} id={id} _id={pId} userId={profile.user._id} catId={cId} onhandleModal={e => setCID(false)} />}
            {upt && <AddFile setting={setting && setting.setting} id={id} _id={pId} userId={profile.user._id} catId={catId} onhandleModal={e => setUpt(false)} />}

            {mD && <DeleteModal handleDelete={deleteF} handleModalDel={e => setMD(false)}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {data && <DeleteModal handleModalDel={e => setData(false)} handleDelete={async e => {
                await deleteVersion(data);
            }}>
                <p style={mT}>Are you sure that you want to delete version {ver}? </p>
            </DeleteModal>}

            <UploadFile handleNew={handleNew} handleVer={handleVer} getList={getList} />
        </div>
    </DragDrop>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isSuc: state.File.isSuc,
        isSucP: state.Project.isSuc,
        project: state.Project.data,
        profile: state.Profile.data,
        setting: state.setting.data,
        File: state.File.data,
        category: state.Category.data
    }
};

export default connect(mapStateToProps, {
    fetchCombinedP, registerCatC, ModalProcess, deleteFiles, cutFiles, cutFile,
    copyFiles, deleteCat, updateCat, deleteFile, deleteVersion, getFileDetailsM,
    registerFile, registerFileNew, registerFileVer, registerCat
})(List);