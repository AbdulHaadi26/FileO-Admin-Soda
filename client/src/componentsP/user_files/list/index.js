import React, { useEffect, useRef, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import {
    deleteFiles,
    fetchCombined,
    cutFiles,
    copyFiles,
    deleteFile,
    getFileDetailsM,
    deleteVersion,
    registerFile,
    cutFile,
    registerFileNew,
    registerFileVer
} from '../../../redux/actions/personal/userFilesActions';
import { finalizeType, returnSelectT } from '../../types';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import More from '../../../assets/elpW.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import {
    registerCatC,
    updateCat,
    deleteCat,
    registerCat
} from '../../../redux/actions/personal/userCategoryActions';
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
import { DragDropContext } from 'react-beautiful-dnd';
import DragDrop from '../../dragDrop';
import FolderList from './folderList';
import FileList from './fileList';
import UploadUserFile from '../../uploadModal/uploadUserFile';
import MoveCopyModal from '../modals/folderList';
import { Link } from 'react-router-dom';
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
import Searchbar from '../../searchbarReusable';

let icons = [{ G: GFolder, B: BFolder }];
const mT = {
    marginTop: '16px'
};

const List = ({
    fetchCombined, _id, catId, fileData, getList, string, type, getFileDetailsM,
    handleS, handleT, tabNav, setTN, isList, handleISL, registerCatC, File, profile,
    category, deleteFiles, copyFiles, cutFiles, updateCat, deleteCat, deleteFile, deleteVersion,
    registerFile, cutFile, registerFileNew, registerFileVer, registerCat, disabled
}) => {

    const [ord, setO] = useState(0), [sv, setSV] = useState(false), [name, setName] = useState(''), [sMF, setSMF] = useState(false), [cId, setCID] = useState(false), [data, setData] = useState(false),
        [active, setAct] = useState(false), [sL, setSL] = useState([]), [list, setList] = useState([]), [mD, setMD] = useState(false), [activeV, setActV] = useState(false),
        [listC, setListC] = useState([]), [sM, setSM] = useState(false), [modalAdd, setMA] = useState(false), [modalDelF, setMDF] = useState(false), [ver, setVer] = useState(false), [verN, setVerN] = useState(false),
        [modalUpt, setMUpt] = useState(false), [sMFL, setSMFL] = useState(false), [modalDelFL, setMDFL] = useState(false), [upt, setUpt] = useState(false), [eF, setEF] = useState(false),
        [copy, setCopy] = useState({
            type: 0, _id: '', catId: catId, isModal: false, sId: catId
        }), [move, setMove] = useState({
            type: 0, _id: '', catId: catId, isModal: false, sId: catId
        }), [mark, setMark] = useState({
            type: 0, _id: 0, catId: catId, isModal: false, sId: catId
        });

    const node = useRef({}), nodeV = useRef({});

    useEffect(() => {
        const handleClick = e => {
            if (nodeV && nodeV.current && !nodeV.current.contains(e.target)) {
                setActV(false);
            }
        };

        document.addEventListener('mousedown', handleClick, true);
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
        return
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    const handleSuccess = (file) => {
        if (file) {
            let type = file.name.split(".");
            let typeS = finalizeType(type[type.length - 1]);
            let data = {
                _id: '', name: type[0], size: file.size,
                mime: file.type, postedby: _id, category: catId, type: typeS,
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
                postedby: file.postedby, category: file.category ? file.category._id : '',
                active: true, type: typeS, description: '', fName: dFile.name
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
                postedby: file.postedby, category: file.category ? file.category._id : '',
                active: true, type: typeS, description: '', fName: dFile.name
            };

            registerFileNew(data, dFile);
        };
    }

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

    const BreadCrumb = () => {
        if (category && category.cat) {
            return <>
                <Link to={`/personal/myspace/user/${_id}/category/list`} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>My Space</Link>
                <Link to={`/personal/myspace/user/${_id}/category/list`} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>{'>'}</Link>
                {category.cat.pCat && category.cat.pCat.length > 0 && category.cat.pCat.map((pCat, k) => <div style={{ display: 'flex', flexDirection: 'row' }} key={k}>
                    <Link to={`/personal/myspace/user/${_id}/files/${pCat._id}/list`}
                        style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>{pCat.name}</Link>
                    <Link to={`/personal/myspace/user/${_id}/files/${pCat._id}/list`}
                        style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer', marginTop: '-2px' }}>{'>'}</Link>
                </div>)}
                <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px' }}>{category.cat.name}</h6>
            </>
        }

        return <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer' }}>My Space</h6>
    };

    const handleModal = bool => setSM(bool);

    const handleAdd = async text => {

        let data = {
            name: text,
            pCat: catId
        };

        await registerCatC(data);
    };

    const handleUpt = async (id, text) => {

        let data = {
            _id: id,
            uId: _id,
            value: text
        };

        await updateCat(data);
    };

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleSearch = e => {
        e.preventDefault();
        let data = {
            string: string,
            cat: catId,
            type: type === 'All' ? type : type.toLowerCase()
        };
        fetchCombined(data);
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
            await cutFiles(data, '', _id);
        }
    };

    const copyFile = async cId => {
        if (sL && sL.length > 0) {
            let data = { arr: sL, catId: cId };
            await copyFiles(data, '', _id);
        }
    };

    const getDetails = (val) => {
        let data = { _id: val, pId: _id, pCat: catId };
        getFileDetailsM(data);
    };

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

    const handleAddC = async (text, pCat) => {

        let data;

        if (!pCat) data = {
            name: text,
            skip: true
        };
        else data = {
            name: text,
            pCat: pCat,
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
                <h4 className="h">My Space</h4>
                <div style={{ marginLeft: 'auto' }} />

                <Searchbar isCreate={true} classN={true ? `col-lg-7 col-12` : 'col-lg-5 col-12'} pad={true} value={string} onHandleInput={val => handleS(val)}
                    callFunc={e =>
                        !active && setActV(true)} isElp={true}
                    holder={'Enter text here'} handleSearch={e => handleSearch(e)} comp={<>
                        <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                        <select className="custom-select col-3" onChange={e => handleSelect(e)} value={type}>
                            {renderOptions()}
                        </select>
                    </>}>
                    <div className="dropdown-content-c" ref={nodeV} style={{ display: `${activeV ? 'flex' : 'none'}` }}>
                        <h6 className='s-l' onClick={e => { setActV(false); !disabled && setMA(true); }}>Add Folder</h6>
                        <h6 className='s-l' onClick={e => { !disabled && setUpt(1); setActV(false); }}>Upload File</h6>
                        <h6 className='s-l' onClick={e => { !disabled && setUpt(2); setActV(false); }}>Upload Multiple Files</h6>
                    </div>
                    <h6 className={`mTHS`} style={{ padding: '10px 8px 6px 8px', position: 'relative', marginTop: '0px', marginBottom: '0px', marginRight: '-3px' }}>
                        <div className="more" onClick={e => setAct(true)}
                            style={{
                                width: '14px', height: '14px', marginRight: '-3px', backgroundImage: `url('${More}')`,
                                cursor: 'pointer', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'
                            }}
                        />
                        <div className="dropdown-content-c" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                            {!sv ? <>
                                <h6 className='s-l' onClick={e => { handleSV(); setAct(false); }}>Mark</h6>
                                <h6 className='s-l' onClick={e => { addAll(); setAct(false); }}>Mark All</h6>
                                <h6 className='s-l' onClick={e => { !disabled && setSM(true); setAct(false); }}>Generate Link</h6>
                            </> : <>
                                <h6 className='s-l' onClick={e => { removeAll(true); setAct(false); }}>View Mode</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); setMark({ ...mark, _id: 1 }); }}>Move</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); !disabled && setMark({ ...mark, _id: 2 }); }}>Copy</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); setMD(true); }}>Delete</h6>
                            </>}
                        </div>
                    </h6>
                </Searchbar>
                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ord < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px', marginLeft: '12px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
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
            <Tabnav items={[name]} i={tabNav} setI={setTN} icons={icons} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>{BreadCrumb()}</div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    {listC && listC.length > 0 &&
                        <FolderList ord={ord} uId={_id} list={listC} isList={isList}
                            setLink={val => setSMF(val)} setDel={val => setMDF(val)} setMUpt={setMUpt} setCID={setCID}
                            setCopy={data => setCopy({ type: 0, _id: data._id, catId: catId, sId: catId })}
                            setMove={data => setMove({ type: 0, _id: data._id, catId: catId, sId: catId })}
                            disabled={disabled}
                        />}
                    {list && list.length > 0 &&
                        <FileList sL={sL} setDel={setMDFL} setLink={setSMFL} setF={setVer} setEF={val => { setEF(val); getDetails(val) }} setVerN={setVerN}
                            isList={isList} handleSel={handleSel} list={list} ord={ord} sv={sv} catId={catId} uId={_id}
                            setCopy={data => setCopy({ type: 1, _id: data._id, catId: catId, sId: catId })} disabled={disabled}
                            setMove={data => setMove({ type: 1, _id: data._id, catId: catId, sId: catId })}
                        />}
                </DragDropContext>
            </div>
            {((!listC || listC.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
                <h6>Nothing found</h6>
            </div>}

            {eF && File && File.file && <EditFile uId={_id} onSetData={data => { setEF(false); setData(data); }} File={File} onhandleModal={e => setEF(false)} />}

            {copy._id && !copy.isModal && <MoveCopyModal data={copy} title={'Copy'} onhandleModal={e => getList()} type={0}
                setCId={catId => setCopy({ ...copy, catId: catId })} setMA={e => setCopy({ ...copy, isModal: true })} setSId={catId => setCopy({ ...copy, sId: catId, catId: catId })}
            />}

            {move._id && !move.isModal && <MoveCopyModal data={move} title={'Move'} onhandleModal={e => getList()} type={1}
                setCId={catId => setMove({ ...move, catId: catId })} setMA={e => setMove({ ...move, isModal: true })} setSId={catId => setMove({ ...move, sId: catId, catId: catId })}
            />}

            {mark._id > 0 && !mark.isModal && <MoveCopyModal data={mark} title={mark._id === 1 ? 'Move' : 'Copy'} onhandleModal={e => getList()}
                callFunc={e => mark._id === 1 ? cut(mark.catId) : copyFile(mark.catId)} type={3}
                setCId={catId => setMark({ ...mark, catId: catId })} setMA={e => setMark({ ...mark, isModal: true })}
                setSId={catId => setMark({ ...mark, sId: catId, catId: catId })}
            />}

            {copy.isModal && <AddFolder onhandleAdd={text => handleAddC(text, copy.sId)} onhandleModal={e => setCopy({ ...copy, isModal: false })} />}
            {move.isModal && <AddFolder onhandleAdd={text => handleAddC(text, move.sId)} onhandleModal={e => setMove({ ...move, isModal: false })} />}
            {mark.isModal && <AddFolder onhandleAdd={text => handleAddC(text, mark.sId)} onhandleModal={e => setMark({ ...mark, isModal: false })} />}

            {ver && <AddVer uId={_id} verId={ver.versionId} onhandleModal={e => setVer(false)} />}
            {verN && <AddNew verId={verN.versionId} userId={profile.user._id} onhandleModal={e => setVerN(false)} />}

            {cId && <AddFile _id={_id} catId={cId} onhandleModal={e => setCID(false)} />}

            {upt === 1 && <AddFile _id={_id} catId={catId} onhandleModal={e => setUpt(false)} />}
            {upt === 2 && <AddFiles _id={_id} catId={catId} onhandleModal={e => setUpt(false)} />}

            {modalAdd && <AddFolder onhandleAdd={text => handleAdd(text)} onhandleModal={e => setMA(false)} />}
            {modalUpt && <EditFolder txt={modalUpt.name} onhandleUpt={text => handleUpt(modalUpt._id, text)} onhandleModal={e => setMUpt(false)} />}

            {sM && <GenerateFolderLink catId={catId} showModal={handleModal} />}
            {sMF && <GenerateFolderLink catId={sMF} showModal={e => setSMF(false)} />}
            {sMFL && <GenerateFileLink id={sMFL} showModal={e => setSMFL(false)} />}

            {mD && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
                await deleteF();
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {modalDelF && <DeleteModal handleModalDel={e => setMDF(false)} handleDelete={async e => {
                await deleteCat(modalDelF);
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {modalDelFL && <DeleteModal handleModalDel={e => setMDFL(false)} handleDelete={async e => {
                await deleteFile(modalDelFL, '', '');
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {data && <DeleteModal handleModalDel={e => setData(false)} handleDelete={async e => {
                await deleteVersion(data);
            }}>
                <p style={mT}>Are you sure that you want to delete version {ver}? </p>
            </DeleteModal>}
            <UploadUserFile handleNew={handleNew} handleVer={handleVer} getList={getList} />
        </div>
    </DragDrop>
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
    cutFiles, copyFiles, updateCat, deleteCat, deleteFile, deleteVersion,
    registerFile, cutFile, registerFileVer, registerFileNew, registerCat
})(List);