import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import Link from 'react-router-dom/Link';
import { finalizeType, returnSelectT } from '../../types';
import More from '../../../assets/elpW.svg';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Searchbar from '../../searchbarReusable';
import '../style.css';
import Tabnav from '../../tabnav';
import {
    deleteFiles,
    cutFiles,
    copyFiles,
    deleteFile,
    fetchCombinedCPC,
    getFileDetailsM,
    deleteVersion,
    cutFile,
    registerFile,
    registerFileVer,
    registerFileNew
} from '../../../redux/actions/fileActions';
import {
    registerCatC,
    deleteCat,
    updateCat,
    registerCat
} from '../../../redux/actions/categoryActions';
import AddFolder from '../modals/addFolder';
import EditFolder from '../modals/editFolder';
import AddFile from '../modals/addFile';
import DeleteModal from '../../containers/deleteContainer';
import AddVer from '../modals/addVer';
import AddNew from '../modals/addNew';
import EditFile from '../modals/editFile';
import FolderList from './folderList';
import FileList from './fileList';
import { DragDropContext } from 'react-beautiful-dnd';
import DragDrop from '../../dragDrop';
import UploadFile from '../../uploadModal/uploadFile';
import MoveCopyModal from '../modals/folderList';
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
let icons = [{ G: GFolder, B: BFolder }];
const mT = {
    marginTop: '16px'
};

const List = ({
    fetchCombinedCPC, id, catId, auth, uId, fileData, getList, isSuc, tabNav, setTN, registerCatC, setting, updateCat, deleteFile, getFileDetailsM, cutFile,
    type, string, handleT, handleS, selectList, isList, handleISL, deleteFiles, cutFiles, copyFiles, profile, deleteCat, File, deleteVersion, category, registerFile,
    registerFileNew, registerFileVer, registerCat, disabled
}) => {
    const [ord, setO] = useState(0), [name, setName] = useState(''), [sv, setSV] = useState(false), [active, setAct] = useState(false), [modalDelF, setMDLF] = useState(false),
        [sL, setSL] = useState([]), [list, setList] = useState([]), [listC, setListC] = useState([]), [mD, setMD] = useState(false)
        , [modalUpt, setMUpt] = useState(false), [modalAdd, setMA] = useState(false), [upt, setUpt] = useState(false), [data, setData] = useState(false),
        [modalDel, setMDL] = useState(false), [cId, setCID] = useState(false), [ver, setVer] = useState(false), [verN, setVerN] = useState(false), [eF, setEF] = useState(false);
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


    const handleSuccess = (file) => {
        if (file && !disabled) {
            let type = file.name.split(".");
            let typeS = finalizeType(type[type.length - 1]);

            let data = {
                name: type[0], size: file.size, active: true, uploadable: false,
                mime: file.type, postedby: uId, versioning: true, latest: true,
                org: id, category: catId, type: typeS, compare: false,
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
                postedby: uId, org: file.org, category: file.category ? file.category._id : '',
                active: true, type: typeS, description: '', fName: dFile.name,
                uploadable: false, compare: false, latest: true, versioning: true
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
                postedby: uId, org: file.org, category: file.category ? file.category._id : '',
                active: true, type: typeS, description: '', fName: dFile.name,
                uploadable: false, compare: false, latest: true, versioning: true
            };

            registerFileNew(data, dFile);
        };
    }


    useEffect(() => {
        if (fileData) {
            let list = fileData.files;
            list && list.length > 0 && list.map(i => i.isChecked = false);
            setList(list);
            setListC(fileData.catList);
        }

        if (category && category.cat) {
            setName(category.cat.name);
        }
    }, [setList, fileData, selectList, catId, isSuc, category]);

    const handleAdd = async text => {

        let data = {
            name: text,
            pCat: catId
        };

        await registerCatC(data);
    };

    const handleUpt = async (_id, text, desc) => {

        let data = {
            org: id,
            _id: _id,
            value: text,
            desc: desc
        };

        await updateCat(data);
    };

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleSearch = e => {
        e.preventDefault();
        let data = { string: string, _id: id, catId: catId, type: type === 'All' ? type : type.toLowerCase(), auth: auth };
        fetchCombinedCPC(data);
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
            await cutFiles(data, id);
        }
    };

    const copyF = async cId => {
        if (sL && sL.length > 0) {
            let data = { arr: sL, catId: cId };
            await copyFiles(data, id);
        }
    };

    const getDetails = (val) => {
        let data = { _id: val, pId: uId, pCat: catId };
        getFileDetailsM(data);
    };

    const handleOnDragEnd = async (data) => {
        if (data && data.source && data.destination && auth) {
            let destination = data.destination.droppableId.split('-');
            let source = data.source.droppableId.split('-');
            if (destination[destination.length - 2] === 'Folder' && source[source.length - 2] === 'File') {
                let folderId = destination[destination.length - 1];
                let fileId = source[source.length - 1];
                await cutFile({ _id: fileId, cat: folderId });
            }
        }
    };

    const BreadCrumb = () => {
        if (category && category.cat) {
            return <>
                <Link to={`/organization/${id}/files/categories`} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>Admin Files</Link>
                <Link to={`/organization/${id}/files/categories`} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>{'>'}</Link>
                {category.cat.pCat && category.cat.pCat.length > 0 && category.cat.pCat.map((pCat, k) => <div style={{ display: 'flex', flexDirection: 'row' }} key={k}>
                    <Link to={`/organization/${id}/files/${pCat._id}/list`}
                        style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>{pCat.name}</Link>
                    <Link to={`/organization/${id}/files/${pCat._id}/list`}
                        style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer', marginTop: '-2px' }}>{'>'}</Link>
                </div>)}
                <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px' }}>{category.cat.name}</h6>
            </>
        };

        return <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer' }}>Admin Files</h6>
    };

    const handleAddC = async (text, desc, pCat) => {

        let data;

        if (!pCat) data = {
            _id: id,
            name: text,
            desc: desc,
            skip: true
        };
        else data = {
            _id: id,
            name: text,
            desc: desc,
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
                <h4 className="h">Files</h4>
                <div style={{ marginLeft: 'auto' }} />
                <Searchbar isCreate={auth} classN={auth ? `col-lg-7 col-12` : 'col-lg-5 col-12'} pad={auth} value={string} onHandleInput={val => handleS(val)}
                    callFunc={e => setActV(true)} isElp={true} callSub={e => setAct(!active)}
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
                        />   <div className="dropdown-content-c" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                            {!sv ? <>
                                <h6 className='s-l' onClick={e => { setAct(false); handleSV() }}>Mark</h6>
                                <h6 className='s-l' onClick={e => { setAct(false); addAll() }}>Mark All</h6>
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
                        <img src={ord === 1 ? CalAsc : CalDes} alt="Icon" style={{ width: '100%' }} />
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
                        <FolderList isList={isList} list={listC} ord={ord} id={id} auth={auth}
                            setMD={setMDL} setCID={setCID} setMUpt={setMUpt} disabled={disabled}
                            setCopy={data => setCopy({ type: 0, _id: data._id, catId: catId, sId: catId })}
                            setMove={data => setMove({ type: 0, _id: data._id, catId: catId, sId: catId })}
                        />}
                    {list && list.length > 0 &&
                        <FileList catL={selectList} isList={isList} sL={sL} onsetSL={handleSL}
                            list={list} setEF={val => { setEF(val); getDetails(val); }} uId={uId} ord={ord} sv={sv}
                            id={id} catId={catId} auth={auth} setDel={setMDLF} setF={setVer} setFN={setVerN}
                            setCopy={data => setCopy({ type: 1, _id: data._id, catId: catId, sId: catId })}
                            setMove={data => setMove({ type: 1, _id: data._id, catId: catId, sId: catId })}
                            disabled={disabled}
                        />}
                </DragDropContext>
            </div>

            {((!listC || listC.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
                <h6>Nothing found</h6>
            </div>}

            {copy._id && !copy.isModal && <MoveCopyModal data={copy} title={'Copy'} onhandleModal={e => getList()} type={0}
                setCId={catId => setCopy({ ...copy, catId: catId })} setMA={e => setCopy({ ...copy, isModal: true })} setSId={catId => setCopy({ ...copy, sId: catId, catId: catId })}
            />}

            {move._id && !move.isModal && <MoveCopyModal data={move} title={'Move'} onhandleModal={e => getList()} type={1}
                setCId={catId => setMove({ ...move, catId: catId })} setMA={e => setMove({ ...move, isModal: true })} setSId={catId => setMove({ ...move, sId: catId, catId: catId })}
            />}

            {mark._id > 0 && !mark.isModal && <MoveCopyModal data={mark} title={mark._id === 1 ? 'Move' : 'Copy'} onhandleModal={e => getList()}
                callFunc={e => mark._id === 1 ? cut(mark.catId) : copyF(mark.catId)} type={3}
                setCId={catId => setMark({ ...mark, catId: catId })} setMA={e => setMark({ ...mark, isModal: true })}
                setSId={catId => setMark({ ...mark, sId: catId, catId: catId })}
            />}

            {copy.isModal && <AddFolder onhandleAdd={(text, desc) => handleAddC(text, desc, copy.sId)} onhandleModal={e => setCopy({ ...copy, isModal: false })} />}
            {move.isModal && <AddFolder onhandleAdd={(text, desc) => handleAddC(text, desc, move.sId)} onhandleModal={e => setMove({ ...move, isModal: false })} />}
            {mark.isModal && <AddFolder onhandleAdd={text => handleAddC(text, '', mark.sId)} onhandleModal={e => setMark({ ...mark, isModal: false })} />}

            {modalUpt && <EditFolder txt={modalUpt.name} desc={modalUpt.description ? modalUpt.description : ''} onhandleUpt={(text, desc) => handleUpt(modalUpt._id, text, desc)} onhandleModal={e => setMUpt(false)} />}
            {modalAdd && <AddFolder onhandleAdd={(text, desc) => handleAdd(text, desc)} onhandleModal={e => setMA(false)} />}

            {ver && <AddVer id={id} verId={ver.versionId} userId={profile.user._id} onhandleModal={e => setVer(false)} />}
            {verN && <AddNew id={id} verId={verN.versionId} userId={profile.user._id} onhandleModal={e => setVerN(false)} />}

            {cId && <AddFile setting={setting && setting.setting} id={id} userId={profile.user._id} catId={cId} onhandleModal={e => setCID(false)} />}

            {upt && <AddFile setting={setting && setting.setting} id={id} userId={profile.user._id} catId={catId} onhandleModal={e => setUpt(false)} />}


            {modalDel && <DeleteModal handleModalDel={e => setMDL(false)} handleDelete={async e => {
                await deleteCat(modalDel, '');
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {modalDelF && <DeleteModal handleModalDel={e => setMDLF(false)} handleDelete={async e => {
                await deleteFile(modalDelF, '');
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {mD && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={deleteF}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {data && <DeleteModal handleModalDel={e => setData(false)} handleDelete={async e => {
                await deleteVersion(data);
            }}>
                <p style={mT}>Are you sure that you want to delete version {ver}? </p>
            </DeleteModal>}

            {eF && File && File.file && <EditFile onSetData={data => { setEF(false); setData(data); }} File={File} onhandleModal={e => setEF(false)} />}

            <UploadFile handleNew={handleNew} handleVer={handleVer} getList={getList} />
        </div>
    </DragDrop>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isErr: state.File.isErr,
        isSuc: state.File.isSuc,
        selectList: state.Category.list,
        setting: state.setting.data,
        profile: state.Profile.data,
        File: state.File.data,
        category: state.Category.data
    }
};

export default connect(mapStateToProps, {
    fetchCombinedCPC, deleteFiles, cutFiles, copyFiles,
    registerCatC, deleteCat, updateCat, deleteFile,
    getFileDetailsM, deleteVersion, cutFile, registerFile,
    registerFileNew, registerFileVer, registerCat
})(List);