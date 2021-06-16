import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { copyFiles, cutFiles, deleteFile, deleteFiles, fetchFile, getFileDetailsM } from '../../../redux/actions/clientFilesAction';
import { returnSelectT } from '../../types';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import More from '../../../assets/more.svg';
import Tabnav from '../../tabnav';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import DeleteModal from '../../containers/deleteContainer';
import EditFile from '../modals/editFile';
import FileList from './fileList';
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
import Searchbar from '../../searchbarReusable';
const ModalCut = lazy(() => import('../modals/cutCopy'));
const ModalLink = lazy(() => import('./modalLink'));
let icons = [{ G: GFolder, B: BFolder }];

const mT = {
    marginTop: '16px'
};
const eS = {
    textAlign: 'center',
    marginTop: '50px'
};
const bS = {
    borderBottom: 'solid 1px #dcdde1'
};

const List = ({
    fetchFile, id, _id, catId, fileData, isSuc, string,
    type, handleS, handleT, selectList, tabNav, setTN, isList,
    handleISL, deleteFile, File, getFileDetailsM, deleteFiles,
    cutFiles, copyFiles, disabled
}) => {
    const [sM, setSM] = useState(false), [ord, setO] = useState(0), [sL, setSL] = useState([]), [list, setList] = useState([]),
        [active, setAct] = useState(false), [count, setCount] = useState(0), [name, setName] = useState(''), [modalDelF, setMDF] = useState(false),
        [eF, setEF] = useState(false), [mC, setMC] = useState(false), [mD, setMD] = useState(false), [mCP, setMCP] = useState(false);
    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    useEffect(() => {
        if (fileData && fileData.files && fileData.files.length > 0) {
            let list = fileData.files;
            list.map(i => i.isChecked = false);
            setList(list);
        }
        let catList = selectList;
        catList = catList.filter(i => i._id === catId)
        catList && catList[0] && setName(catList[0].name);
    }, [setList, setCount, fileData, selectList, catId, isSuc]);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleSearch = e => {
        e.preventDefault();
        let data = { string: string, cat: catId, type: type === 'All' ? type : type.toLowerCase(), pId: _id };
        fetchFile(data);
    };

    const renderOptions = () => returnSelectT().map(Item => <option key={Item} data-key={Item}>{Item}</option>);

    const handleModal = (e, val) => setSM(val);

    const deleteF = async () => {
        if (sL && sL.length > 0) {
            let data = { arr: sL };
            await deleteFiles(data);
        }
    };

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

    const getDetails = (val) => {
        let data = { _id: val, pId: _id };
        getFileDetailsM(data);
    };


    const cut = async cId => {
        if (sL && sL.length > 0) {
            let data = { arr: sL, value: cId };
            await cutFiles(data, id, _id);
        }
    };

    const copy = async cId => {
        if (sL && sL.length > 0) {
            let data = { arr: sL, catId: cId };
            await copyFiles(data, id, _id);
        }
    };

    const handleModalMC = (e, val) => setMC(val);
    const handleModalMCP = (e, val) => setMCP(val);

    return <div className="col-11 f-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">Client File</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={false} classN={true ? `col-lg-5 col-12` : 'col-lg-4 col-12'} pad={true} value={string} onHandleInput={val => handleS(val)}
                holder={'Enter text here'} handleSearch={e => handleSearch(e)} comp={<>
                    <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                    <select className="custom-select col-3" onChange={e => handleSelect(e)} value={type}>
                        {renderOptions()}
                    </select>
                </>}>
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
                <h6 className={`order mTHS`} style={{ padding: '10px 8px 6px 8px', position: 'relative', marginTop: '0px', marginBottom: '0px' }} onClick={e => setAct(!active)}>
                    <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                    <div ref={node} className="dropdown-content-c" style={{ display: `${active ? 'flex' : 'none'}` }}>
                        <h6 className='s-l' style={bS} onClick={e => { !disabled && setSM(true); setAct(false); }}>Generate Url</h6>
                    </div>
                </h6>
            </div>
        </div>
        <Tabnav items={[name]} i={tabNav} setI={setTN} icons={icons} />
        {list && list.length > 0 ?
            <FileList isList={isList} sL={sL} onsetSL={handleSL} catId={catId} list={list} disabled={disabled}
                ord={ord} count={count} id={id} uId={_id} onFetch={fetch} setMDF={setMDF} setEF={val => { setEF(val); getDetails(val); }} />
            : <div> <h6 className="f-n" style={eS}>No file found</h6> </div>}
        {sM && <Suspense fallback={<></>}><ModalLink id={id} _id={_id} catId={catId} showModal={handleModal} /></Suspense>}
        {eF && File && File.file && <EditFile uId={_id} File={File} onhandleModal={e => setEF(false)} />}


        {modalDelF && <DeleteModal handleModalDel={e => setMDF(false)} handleDelete={async e => {
            await deleteFile(modalDelF, '', '');
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {mD && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={deleteF}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {mC && <Suspense fallback={<></>}><ModalCut catL={selectList} text="Move To" onhandleIds={cut} onhandleModalC={handleModalMC} catId={catId} /></Suspense>}
        {mCP && <Suspense fallback={<></>}><ModalCut text={'Copy To'} catL={selectList} onhandleIds={copy} onhandleModalC={handleModalMCP} catId={catId} /></Suspense>}
    </div>

}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isErr: state.File.isErr,
        isSuc: state.File.isSuc,
        selectList: state.Category.list,
        File: state.File.data
    }
};

export default connect(mapStateToProps, { fetchFile, deleteFile, getFileDetailsM, cutFiles, copyFiles, deleteFiles })(List);