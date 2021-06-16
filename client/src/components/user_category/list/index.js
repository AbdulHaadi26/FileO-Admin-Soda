import React, { useEffect, useRef, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import {
    fetchCombined,
    registerCat,
    updateCat,
    deleteCat,
    registerCatC
} from '../../../redux/actions/userCategoryActions';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import Tabnav from '../../tabnav';
import More from '../../../assets/elpW.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import { finalizeType, returnSelectT } from '../../types';
import GenerateFolderLink from './modalLinkFolder';
import GenerateFileLink from './modalLinkFile';
import AddFolder from '../modals/addFolder';
import EditFolder from '../modals/editFolder';
import AddFile from '../modals/addFile';
import AddFiles from '../modals/addFiles';
import DeleteModal from '../../containers/deleteContainer';
import Searchbar from '../../searchbarReusable';
import {
    deleteFile,
    deleteVersion,
    getFileDetailsM,
    registerFile,
    cutFile,
    registerFileVer,
    registerFileNew,
    cutFiles,
    copyFiles,
    deleteFiles
} from '../../../redux/actions/userFilesActions';
import AddVer from '../modals/addVer';
import AddNew from '../modals/addNew';
import EditFile from '../modals/editFile';
import Assigned from '../modals/shared';
import AssignedFolder from '../modals/sharedFolder';
import FolderList from './folderList';
import FileList from './fileList';
import { DragDropContext } from 'react-beautiful-dnd';
import DragDrop from '../../dragDrop';
import UploadUserFile from '../../uploadModal/uploadUserFile';
import MoveCopyModal from '../modals/folderList';
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
let icons = [{ G: GFolder, B: BFolder }];

const mT = {
    marginTop: '16px'
};

const ListCat = ({
    id, _id, string, handleS, tabNav, setTN, isList, fileData, type, handleT, fetchCombined, handleISL, getList, registerCat, updateCat, deleteCat, deleteFile,
    deleteVersion, getFileDetailsM, File, registerFileVer, registerFile, cutFile, registerFileNew, registerCatC, cutFiles, deleteFiles, copyFiles, disabled
}) => {

    const [ord, setO] = useState(0), [active, setAct] = useState(false), [modalUpt, setMUpt] = useState(false), [ver, setVer] = useState(false), [verN, setVerN] = useState(false),
        [modalDel, setMD] = useState(false), [sM, setSM] = useState(false), [modalDelF, setMDF] = useState(false), [modalAdd, setMA] = useState(false),
        [sMF, setSMF] = useState(false), [upt, setUpt] = useState(false), [catId, setCID] = useState(false), [eF, setEF] = useState(false), [data, setData] = useState(false),
        [shModC, setSHMODC] = useState(false), [shMod, setSHMOD] = useState(false), [copy, setCopy] = useState({
            type: 0, _id: '', catId: '', isModal: false, sId: ''
        }), [move, setMove] = useState({
            type: 0, _id: '', catId: '', isModal: false, sId: ''
        }), [mark, setMark] = useState({
            type: 0, _id: 0, catId: '', isModal: false, sId: ''
        }), [mD, setMDD] = useState(false), [sL, setSL] = useState([]), [list, setList] = useState([]), [listC, setListC] = useState(false),
        [activeV, setActV] = useState(false), [sv, setSV] = useState(false);

    const handleSuccess = (file) => {
        if (file && !disabled) {
            let type = file.name.split(".");
            let typeS = finalizeType(type[type.length - 1]);
            let data = {
                _id: '', name: type[0], size: file.size,
                mime: file.type, postedby: _id,
                org: id, category: '', type: typeS,
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
                active: true, type: typeS, description: '', fName: dFile.name
            };
            registerFileVer(data, dFile);
        };
    };

    const handleNew = (file, dFile) => {
        if (file) {
            let type = dFile.name.split(".");
            let typeS = finalizeType(type[type.length - 1]);

            let data = {
                _id: file.versionId, name: file.name, size: dFile.size, mime: dFile.type,
                postedby: file.postedby, org: file.org, category: file.category ? file.category._id : '',
                active: true, type: typeS, description: '', fName: dFile.name
            };

            registerFileNew(data, dFile);
        };
    }

    const node = useRef({}), nodeV = useRef({});

    useEffect(() => {
        const handleClick = e => {
            if (activeV && nodeV && nodeV.current && !nodeV.current.contains(e.target)) {
                setActV(false);
            }
        };

        document.addEventListener('mousedown', handleClick, true);
    }, [activeV]);

    useEffect(() => {
        const handleClick = e => {
            if (active && node && node.current && !node.current.contains(e.target)) {
                setAct(false);
            }
        };
        document.addEventListener('mousedown', handleClick, true);
        return
    }, [active]);



    const handleAdd = async text => {

        let data = {
            _id: id,
            uId: _id,
            name: text
        };

        await registerCat(data);
    };

    const handleAddC = async (text, pCat) => {

        let data;

        if (!pCat) data = {
            _id: id,
            uId: _id,
            name: text,
            skip: true
        };
        else data = {
            _id: id,
            uId: _id,
            name: text,
            pCat: pCat,
            skip: true
        }

        !pCat ? await registerCat(data) : await registerCatC(data);
        setCopy({ ...copy, isModal: false });
        setMove({ ...move, isModal: false });
        setMark({ ...mark, isModal: false });

    };

    const handleUpt = async (id, text) => {

        let data = {
            _id: id,
            uId: _id,
            value: text
        };

        await updateCat(data);
    };

    const handleSearch = e => {
        e.preventDefault();
        let data = {
            string: string,
            type: type === 'All' ? type : type.toLowerCase()
        };
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

    const handleSL = lst => {
        let tempList = list;
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

    const handleSel = File => {
        var tempList = sL;
        if (!File.isChecked) {
            tempList.push(File._id);
            handleSL(tempList);
        } else {
            tempList = tempList.filter(i => i !== File._id);
            handleSL(tempList);
        }
    };

    const cut = async (cId) => {
        if (sL && sL.length > 0) {
            let data = { arr: sL, value: cId };
            await cutFiles(data, id, _id);
        }
    };

    const copyFile = async cId => {
        if (sL && sL.length > 0) {
            let data = { arr: sL, catId: cId };
            await copyFiles(data, id, _id);
        }
    };

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

    }, [setList, fileData]);

    const handleOnDragEnd = async (data) => {
        if (data && data.source && data.destination) {
            let destination = data.destination.droppableId.split('-');
            let source = data.source.droppableId.split('-');
            if (destination[destination.length - 2] === 'Folder' && source[source.length - 2] === 'File') {
                let folderId = destination[destination.length - 1];
                let fileId = source[source.length - 1];
                await cutFile({ _id: fileId, cat: folderId });
            }
        }
    };

    return <DragDrop handleSuccess={handleSuccess}>
        <div className="col-11 c-d-w p-0">
            <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <h4 className="h">My Space</h4>
                <div style={{ marginLeft: 'auto' }} />
                <Searchbar isCreate={true} classN={true ? `col-lg-7 col-12` : 'col-lg-5 col-12'} pad={true} value={string} onHandleInput={val => handleS(val)}
                    callFunc={e => setActV(true)} isElp={true} callSub={e => setAct(true)}
                    holder={'Enter text here'} handleSearch={e => handleSearch(e)} comp={<>
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className="custom-select col-3" onChange={e => handleSelect(e)} value={type}>
                            {renderOptions()}
                        </select>
                    </>}>
                    <h6 className={`mTHS`} style={{ padding: '10px 8px 6px 8px', position: 'relative', marginTop: '0px', marginBottom: '0px', marginRight: '-3px' }}>
                        <div className="more" onClick={e => setAct(true)}
                            style={{
                                width: '14px', height: '14px', marginRight: '-3px', backgroundImage: `url('${More}')`,
                                cursor: 'pointer', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'
                            }}
                        />
                        {active && <div className="dropdown-content-c" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                            {!sv ? <>
                                <h6 className='s-l' onClick={e => { handleSV(); setAct(false); }}>Mark</h6>
                                <h6 className='s-l' onClick={e => { addAll(); setAct(false); }}>Mark All</h6>
                            </> : <>
                                <h6 className='s-l' onClick={e => { removeAll(true); setAct(false); }}>View Mode</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); setMark({ ...mark, _id: 1 }); }}>Move</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); !disabled && setMark({ ...mark, _id: 2 }); }}>Copy</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); setMDD(true); }}>Delete</h6>
                            </>}
                        </div>}
                        {activeV && <div className="dropdown-content-c" ref={nodeV} style={{ display: `${activeV ? 'flex' : 'none'}` }}>
                            <h6 className='s-l' onClick={e => { setActV(false); !disabled && setMA(true); }}>Add Folder</h6>
                            <h6 className='s-l' onClick={e => { !disabled && setUpt(1); setActV(false); }}>Upload File</h6>
                            <h6 className='s-l' onClick={e => { !disabled && setUpt(2); setActV(false); }}>Upload Multiple Files</h6>
                        </div>}
                    </h6>
                </Searchbar>
                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ord < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                        <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Date</span>
                    </div>
                    <div className={`order mTHS ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                        <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Name</span>
                    </div>
                    <div className={`order mTHS`} style={{ marginTop: '0px' }} onClick={e => handleISL(!isList)}>
                        <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                    </div>
                </div>
            </div>
            <Tabnav items={['Folders']} i={tabNav} setI={setTN} icons={icons} />
            <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', marginTop: '12px' }}>My Space</h6>
            {tabNav === 0 && <>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        {listC && listC.length > 0 &&
                            <FolderList id={id} ord={ord} uId={_id} list={listC} isList={isList}
                                setMUpt={setMUpt} setSHMOD={setSHMODC} setLink={val => setSM(val)}
                                setDel={val => setMD(val)} setCID={val => setCID(val)}
                                setCopy={data => setCopy({ type: 0, _id: data._id, catId: '', sId: '' })}
                                setMove={data => setMove({ type: 0, _id: data._id, catId: '', sId: '' })}
                                disabled={disabled}
                            />}
                        {list && list.length > 0 &&
                            <FileList list={list} isList={isList} handleSel={handleSel} sv={sv} ord={ord} id={id} uId={_id}
                                setEF={val => {
                                    setEF(true);
                                    getDetails(val);
                                }} setVerN={setVerN}
                                setF={setVer} setDel={setMDF} setLink={setSMF} setSHMOD={setSHMOD}
                                setCopy={data => setCopy({ type: 1, _id: data._id, catId: '', sId: '' })}
                                setMove={data => setMove({ type: 1, _id: data._id, catId: '', sId: '' })}
                                disabled={disabled}
                            />}
                    </DragDropContext>
                </div>
                {((!listC || listC.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
                    <h6>Nothing found</h6>
                </div>}
            </>}

            {copy._id && !copy.isModal && <MoveCopyModal data={copy} title={'Copy'} onhandleModal={e => getList()} type={0}
                setCId={catId => setCopy({ ...copy, catId: catId })} setMA={e => setCopy({ ...copy, isModal: true })} setSId={catId => setCopy({ ...copy, sId: catId })}
            />}

            {move._id && !move.isModal && <MoveCopyModal data={move} title={'Move'} onhandleModal={e => getList()} type={1}
                setCId={catId => setMove({ ...move, catId: catId })} setMA={e => setMove({ ...move, isModal: true })} setSId={catId => setMove({ ...move, sId: catId })}
            />}

            {shMod && <Assigned id={id} _id={_id} fId={shMod} onhandleModal={e => setSHMOD(false)} />}

            {shModC && <AssignedFolder id={id} _id={_id} cId={shModC} onhandleModal={e => setSHMODC(false)} />}

            {eF && File && File.file && <EditFile uId={_id} onSetData={data => {
                setEF(false);
                setData(data);
            }} File={File} onhandleModal={e => setEF(false)} />}

            {modalUpt && <EditFolder txt={modalUpt.name} onhandleUpt={text => handleUpt(modalUpt._id, text)} onhandleModal={e => setMUpt(false)} />}
            {modalAdd && <AddFolder onhandleAdd={text => handleAdd(text)} onhandleModal={e => setMA(false)} />}

            {copy.isModal && <AddFolder onhandleAdd={text => handleAddC(text, copy.sId)} onhandleModal={e => setCopy({ ...copy, isModal: false })} />}
            {move.isModal && <AddFolder onhandleAdd={text => handleAddC(text, move.sId)} onhandleModal={e => setMove({ ...move, isModal: false })} />}

            {catId && <AddFile id={id} _id={_id} catId={catId} onhandleModal={e => setCID(false)} />}

            {ver && <AddVer id={id} uId={_id} verId={ver.versionId} onhandleModal={e => setVer(false)} />}
            {verN && <AddNew id={id} verId={verN.versionId} userId={_id} onhandleModal={e => setVerN(false)} />}

            {upt === 1 && <AddFile id={id} _id={_id} catId={''} onhandleModal={e => setUpt(false)} />}
            {upt === 2 && <AddFiles id={id} _id={_id} catId={''} onhandleModal={e => setUpt(false)} />}

            {sM && <GenerateFolderLink catId={sM} showModal={e => setSM(false)} />}
            {sMF && <GenerateFileLink id={sMF} showModal={e => setSMF(false)} />}

            {modalDel && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
                await deleteCat(modalDel);
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {modalDelF && <DeleteModal handleModalDel={e => setMDF(false)} handleDelete={async e => {
                await deleteFile(modalDelF, '', '');
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {data && <DeleteModal handleModalDel={e => setData(false)} handleDelete={async e => {
                await deleteVersion(data);
            }}>
                <p style={mT}>Are you sure that you want to delete version {ver}? </p>
            </DeleteModal>}

            {mark._id > 0 && !mark.isModal && <MoveCopyModal data={mark} title={mark._id === 1 ? 'Move' : 'Copy'} onhandleModal={e => getList()}
                callFunc={e => mark._id === 1 ? cut(mark.catId) : copyFile(mark.catId)} type={3}
                setCId={catId => setMark({ ...mark, catId: catId })} setMA={e => setMark({ ...mark, isModal: true })}
                setSId={catId => setMark({ ...mark, sId: catId, catId: catId })}
            />}

            {mark.isModal && <AddFolder onhandleAdd={text => handleAddC(text, mark.catId)} onhandleModal={e => setMark({ ...mark, isModal: false })} />}

            {mD && <DeleteModal handleModalDel={e => setMDD(false)} handleDelete={async e => {
                await deleteF();
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            <UploadUserFile handleVer={handleVer} handleNew={handleNew} getList={getList} />
        </div >
    </DragDrop>
}


const mapStateToProps = state => {
    return {
        catData: state.Category.list,
        isSuc: state.Category.isSuc,
        fileData: state.File.list,
        isSucF: state.File.isSuc,
        File: state.File.data
    }
};

export default connect(mapStateToProps, {
    fetchCombined, registerCat, registerFileVer, updateCat, deleteCat,
    deleteFile, deleteVersion, getFileDetailsM, registerFile,
    cutFile, registerFileNew, registerCatC, cutFiles, deleteFiles, copyFiles
})(ListCat);

