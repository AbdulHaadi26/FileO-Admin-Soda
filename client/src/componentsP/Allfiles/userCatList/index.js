import React, { lazy, Suspense, useEffect, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { returnSelectT } from '../../types';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import { fetchCombined } from '../../../redux/actions/personal/userCategoryActions';
import { fetchCombinedC } from '../../../redux/actions/personal/clientCategoryAction';
import GMySpace from '../../../assets/tabnav/G-hard-drive.svg';
import BMySpace from '../../../assets/tabnav/B-hard-drive.svg';
import GClient from '../../../assets/tabnav/G-hand-shake.svg';
import BClient from '../../../assets/tabnav/B-hand-shake.svg';
import history from '../../../utils/history';
import Searchbar from '../../searchbarReusable';
const FileList = lazy(() => import('./fileList'));
const CatList = lazy(() => import('./catList'));


let icons = [
    { G: GMySpace, B: BMySpace },
    { G: GClient, B: BClient }
];

const List = ({
    fileData, id,
    string, category, tabNav, typeU, pId, catData,
    stringU, handleSU, handleTU, typeC,
    stringC, handleSC, handleTC, auth, admin,
    stringP, handleISL, isList, categoryP,
    fetchCombined, fetchCombinedC
}) => {
    const [categoriesC, setCC] = useState([]), [listC, setListC] = useState([]),
        [categoriesU, setCU] = useState([]), [listU, setListU] = useState([]),
        [ord, setO] = useState(0);

    useEffect(() => {

        if (fileData && tabNav === 0) {
            setListU(fileData.files);
            setCU(fileData.cats);
        }

        if (fileData && tabNav === 1) {
            setListC(fileData.files);
            setCC(fileData.catList);
        }

    }, [category, categoryP, string, stringP, auth, tabNav, fileData, catData, admin]);

    const handleSelectU = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleTU(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleSelectC = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleTC(e.target.options[selectedIndex].getAttribute('data-key'));
    };


    const setIN = i => {
        history.push(`/personal/all/files/page/${i}`);
    };

    const handleSearchU = e => {
        e.preventDefault();
        let data = { string: stringU, type: typeU === 'All' ? typeU : typeU.toLowerCase(), _id: pId };
        fetchCombined(data);
    };

    const handleSearchC = e => {
        e.preventDefault();
        let data = { string: stringC, type: typeC === 'All' ? typeC : typeC.toLowerCase(), _id: pId };
        fetchCombinedC(data);
    };


    const renderOptions = () => returnSelectT().map(Item => <option data-key={Item} key={Item}>{Item}</option>);

    let listItems = ['Personal', 'Client'];

    return <div className="col-11 f-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap:'wrap' }}>
            <h4 className="h">All Files</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={false} classN={`col-lg-5 col-12`} pad={true}
                value={tabNav === 0 ? stringU : stringC}
                onHandleInput={val => tabNav === 0 ? handleSU(val) : handleSC(val)} comp={
                         <>
                            <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                            <select className="custom-select col-3" onChange={e => tabNav === 0 ? handleSelectU(e) : handleSelectC(e)} value={tabNav === 0 ? typeU : typeC}>
                                {renderOptions()}
                            </select>
                        </>} holder={'Enter text here'} handleSearch={e => {
                            tabNav === 0 ? handleSearchU(e) : handleSearchC(e)
                        }} />
            <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                <div className={`order ${ord < 2 ? 'orderA' : ''}`} style={{ marginLeft: '12px', marginTop: '0px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                    <img src={ord === 1 ? CalAsc : CalDes} alt="Icon" style={{ width: '100%', marginTop: '0px' }} />
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
        <Tabnav items={listItems} i={tabNav} setI={setIN} icons={icons} />

        {tabNav === 0 && <>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {categoriesU && categoriesU.length > 0 && <Suspense fallback={<></>}> <CatList i={2} list={categoriesU} id={id} ord={ord} isList={isList} /></Suspense>}
                {listU && listU.length > 0 && <Suspense fallback={<></>}> <FileList i={2} isList={isList} list={listU} ord={ord} id={id} /> </Suspense>}
            </div>
            {((!listU || listU.length <= 0) && (!categoriesU || categoriesU.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
                <h6 style={{ fontSize: '14px', fontWeight: '600', color: 'grey' }}>Nothing found.</h6>
            </div>}
        </>}

        {tabNav === 1 && <>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {categoriesC && categoriesC.length > 0 && <Suspense fallback={<></>}> <CatList i={3} list={categoriesC} id={id} ord={ord} isList={isList} /></Suspense>}
                {listC && listC.length > 0 && <Suspense fallback={<></>}> <FileList i={3} isList={isList} list={listC} ord={ord} id={id} /> </Suspense>}
            </div>
            {((!listC || listC.length <= 0) && (!categoriesC || categoriesC.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
                <h6 style={{ fontSize: '14px', fontWeight: '600', color: 'grey' }}>Nothing found.</h6>
            </div>}
        </>}
    </div>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        catData: state.Category.list,
    }
}

export default connect(mapStateToProps, {
    fetchCombined, fetchCombinedC
})(List);