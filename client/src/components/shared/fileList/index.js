import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { fetchCombined } from '../../../redux/actions/userFilesActions';
import { returnSelectT } from '../../types';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
const FileList = lazy(() => import('./fileList'));
const ListC = lazy(() => import('../catListC'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const mT = { marginTop: '16px' };

const List = ({
    id, _id, catId, fileData, string, type, handleS, handleT, tabNav, setTN, isList, handleISL, category, fetchCombined,
}) => {

    const [ord, setO] = useState(0);

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

    let list = [], listF = [];

    if (fileData && fileData.files) {
        listF = fileData.files;
        listF.map(i => i.isChecked = false);
    }

    if (fileData && fileData.cats) {
        list = fileData.cats;
    };

    return <div className="col-11 sh-w p-0">
        <h4 className="h">Shared Files</h4>
        <Tabnav items={[category.cat && category.cat && category.cat.name ? category.cat.name : '']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <div className="input-group col-lg-5 col-12" style={mT}>
                <input type="text" className="form-control" placeholder="Folder name" value={string} onChange={e => handleS(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
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
                <img src={ord === 1 ? CalAsc : CalDes} alt="Icon" style={{ width: '100%' }} />
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
        </div>
        {((!listF || listF.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
            <h6 style={{ fontSize: '14px', fontWeight: '600', color: 'grey' }}>Nothing found.</h6>
        </div>}

        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
            {list && list.length > 0 && <Suspense fallback={<></>}><ListC id={id} ord={ord} uId={_id} list={list} isList={isList} /></Suspense>}
            {listF && listF.length > 0 && <Suspense fallback={<></>}><FileList list={listF} isList={isList} ord={ord} id={id} uId={_id} /> </Suspense>}
        </div>
    </div>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isSuc: state.File.isSuc,
        category: state.Category.data
    }
}

export default connect(mapStateToProps, { fetchCombined })(List);