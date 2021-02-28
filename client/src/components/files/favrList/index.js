import React, { lazy, Suspense, Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { fetchCombined } from '../../../redux/actions/fvrActions';
import { returnSelectT } from '../../types';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import '../style.css';
const FileList = lazy(() => import('./fileList'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const mT = { marginTop: '16px' };
const mB = { textAlign: 'center', marginTop: '50px', marginLeft: 'auto', marginRight: 'auto' };

const List = ({
    fetchCombined, id, uId, fileData, isSuc, type,
    s, handleT, handleS, tabNav, setTN, isList, handleISL
}) => {
    const [ord, setO] = useState(0);
    const onhandleInput = e => handleS(e.target.value);
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
        <h4 className="h">Favorite File</h4>
        <Tabnav items={['Files']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <div className="input-group" style={mT}>
                <input type="text" className="form-control" placeholder="File name" value={s} onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
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
        </div>

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