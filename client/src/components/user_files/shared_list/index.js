import React, { lazy, Suspense, useEffect, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { fetchCombinedShared } from '../../../redux/actions/userFilesActions';
import { returnSelectT } from '../../types';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
const FileList = lazy(() => import('./fileList'));
const ListC = lazy(() => import('./catList'));

const List = ({
    fetchCombinedShared, id, _id, catId, fileData, isSuc, string, type, handleT, handleS, selectList, tabNav, setTN, isList, handleISL
}) => {
    const [ord, setO] = useState(0), [name, setName] = useState(''), [list, setList] = useState([]), [listC, setListC] = useState([]);

    useEffect(() => {
        if (isSuc && fileData) {
            let list = fileData.files;
            list && list.length > 0 && list.map(i => i.isChecked = false);
            setList(list);
            setListC(fileData.cats);
        }
        let catList = selectList;
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
        let data = { string: string, cat: catId, type: type === 'All' ? type : type.toLowerCase(), pId: _id };
        fetchCombinedShared(data);
    }

    const renderOptions = () => returnSelectT().map(Item => <option key={Item} data-key={Item}>{Item}</option>);

    return <div className="col-11 f-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">Shared Files</h4>
            <div style={{ marginLeft: 'auto' }} />
            <div className="input-group col-lg-3">
                <input type="text" className="form-control col-8" placeholder="Enter text here" value={string} onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <select className="custom-select col-4" onChange={e => handleSelect(e)} defaultValue={type}> {renderOptions()} </select>
            </div>
            <div className={`order ${ord < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Date</span>
            </div>
            <div className={`order ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Name</span>
            </div>
            <div className={`order`} style={{ marginTop: '0px' }} onClick={e => handleISL(!isList)}>
                <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
            </div>

        </div>
        <Tabnav items={[name]} i={tabNav} setI={setTN} />
        {((!listC || listC.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
            <h6 style={{ fontSize: '14px', fontWeight: '600', color: 'grey' }}>Nothing found.</h6>
        </div>}

        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
            {listC && listC.length > 0 && <Suspense fallback={<></>}><ListC id={id} ord={ord} uId={_id} list={listC} isList={isList} /></Suspense>}
            {list && list.length > 0 && <Suspense fallback={<></>}> <FileList isList={isList} list={list} ord={ord} id={id} uId={_id} /> </Suspense>}
        </div>
    </div>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isSuc: state.File.isSuc,
        selectList: state.Category.list,
    }
}

export default connect(mapStateToProps, { fetchCombinedShared })(List);