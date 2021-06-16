import React, { lazy, Suspense, Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { fetchCombined } from '../../../redux/actions/personal/fvrActions';
import { returnSelectT } from '../../types';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import GFvr from '../../../assets/tabnav/G-favorites.svg';
import BFvr from '../../../assets/tabnav/B-favorites.svg';
import Searchbar from '../../searchbarReusable';
import Tabnav from '../../tabnav';
import '../style.css';
let icons = [
    { G: GFvr, B: BFvr }
];
const FileList = lazy(() => import('./fileList'));
const mB = { textAlign: 'center', marginTop: '50px', marginLeft: 'auto', marginRight: 'auto' };

const List = ({
    fetchCombined, id, uId, fileData, isSuc, type,
    s, handleT, handleS, tabNav, setTN, isList, handleISL
}) => {
    const [ord, setO] = useState(0);
    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSearch = e => {
        e.preventDefault();
        let data = { string: s, type: type === 'All' ? type : type.toLowerCase() };
        fetchCombined(data);
    }

    const renderOptions = () => returnSelectT().map(Item => <option key={Item} data-key={Item}>{Item}</option>);

    var list = [];

    if (isSuc && fileData) {
        list = fileData.files;
    }

    return <div className="col-11 f-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap:'wrap' }}>
            <h4 className="h">Favorite File</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={false} classN={false ? `col-lg-7 col-12` : 'col-lg-5 col-12'} pad={true} value={s}
                handleSearch={e => handleSearch(e)} onHandleInput={val => handleS(val)} holder={'File name'} comp={<>
                    <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                    <select className="custom-select col-3" onChange={e => handleSelect(e)} value={type}>
                        {renderOptions()}
                    </select>
                </>} />
            <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
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
        </div>
        <Tabnav items={['Files']} i={tabNav} setI={setTN} icons={icons} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
            {list && list.length > 0 ? <Suspense fallback={<Fragment />}> <FileList list={list} isList={isList} ord={ord} uId={uId} id={id} /> </Suspense> :
                <h6 className="f-n" style={mB}>No file found</h6>}
        </div>
    </div>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isErr: state.File.isErr,
        isSuc: state.File.isSuc
    }
}

export default connect(mapStateToProps, { fetchCombined })(List);