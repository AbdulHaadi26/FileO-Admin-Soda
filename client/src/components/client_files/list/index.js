import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { deleteFile, fetchFile, getFileDetailsM } from '../../../redux/actions/clientFilesAction';
import { returnSelectT } from '../../types';
import LinkI from '../../../assets/link.svg';
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
const FileList = lazy(() => import('./fileList'));
const ModalLink = lazy(() => import('./modalLink'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const mT = { marginTop: '16px' };
const eS = { textAlign: 'center', marginTop: '50px' };
const bS = { borderBottom: 'solid 1px #dcdde1' };

const List = ({
    fetchFile, id, _id, catId, fileData, isSuc, string, getList,
    type, handleS, handleT, selectList, tabNav, setTN, isList,
    handleISL, deleteFile, File, getFileDetailsM
}) => {
    const [sM, setSM] = useState(false), [ord, setO] = useState(0), [sv, setSV] = useState(false), [sL, setSL] = useState([]), [list, setList] = useState([]),
        [active, setAct] = useState(false), [count, setCount] = useState(0), [name, setName] = useState(''), [modalDelF, setMDF] = useState(false), [eF, setEF] = useState(false);
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
        if (isSuc && fileData) {
            let list = fileData.files;
            list.map(i => i.isChecked = false);
            setList(list);
        }
        let catList = selectList;
        catList = catList.filter(i => i._id === catId)
        catList && catList[0] && setName(catList[0].name);
    }, [setList, setCount, fileData, selectList, catId, isSuc]);

    const onhandleInput = e => handleS(e.target.value);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSearch = e => {
        e.preventDefault();
        let data = { string: string, cat: catId, type: type === 'All' ? type : type.toLowerCase(), pId: _id };
        fetchFile(data);
    }

    const renderOptions = () => returnSelectT().map(Item => <option key={Item} data-key={Item}>{Item}</option>);

    const handleModal = (e, val) => setSM(val);

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

    const getDetails = (val) => {
        let data = { _id: val, pId: _id };
        getFileDetailsM(data);
    };

    return <div className="col-11 f-w p-0">
        <h4 className="h">Client File</h4>
        <Tabnav items={[name]} i={tabNav} setI={setTN} />
        <div style={dF}>
            <button className="btn btn-dark" onClick={e => setSM(true)}>Generate Url<div className="faS" style={{ backgroundImage: `url('${LinkI}')` }} /></button>
        </div>
        <div style={dF}>
            <div className="input-group" style={mT}>
                <input type="text" className="form-control" placeholder="File name" value={string} onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
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
            <h6 className={`order`} style={{ padding: '10px 8px 6px 8px', position: 'relative' }} onClick={e => setAct(!active)}>
                <div style={{ width: '14px', height: '14px', backgroundImage: `url('${More}')` }} />
                <div ref={node} className="dropdown-content" style={{ display: `${active ? 'flex' : 'none'}` }}>
                    {!sv ? <> <h6 className='s-l' style={bS} onClick={e => handleSV()}>Select Object</h6>
                        <h6 className='s-l' onClick={e => addAll()}>Select All</h6>
                    </> : <h6 className='s-l' style={bS} onClick={e => removeAll()}>View Object</h6>}
                </div>
            </h6>
        </div>
        {isSuc && list && list.length > 0 ? <Suspense fallback={<></>}>
            <FileList isList={isList} sL={sL} onsetSL={handleSL} getList={getList} sv={sv} catL={selectList} catId={catId} list={list}
                ord={ord} count={count} id={id} uId={_id} onFetch={fetch} setMDF={setMDF} setEF={val => { setEF(val); getDetails(val); }} />
        </Suspense>
            : <div> <h6 className="f-n" style={eS}>No file found</h6> </div>}
        {sM && <Suspense fallback={<></>}><ModalLink id={id} _id={_id} catId={catId} showModal={handleModal} /></Suspense>}
        {eF && File && File.file && <EditFile uId={_id} getList={getList} File={File} onhandleModal={e => setEF(false)} />}


        {modalDelF && <DeleteModal handleModalDel={e => setMDF(false)} handleDelete={async e => {
            await deleteFile(modalDelF, '', '');
            getList();
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}
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
}

export default connect(mapStateToProps, { fetchFile, deleteFile, getFileDetailsM })(List);