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
import { fetchCombinedCP } from '../../../redux/actions/categoryActions';
import { fetchCombined } from '../../../redux/actions/userCategoryActions';
import { fetchCombinedC } from '../../../redux/actions/clientCategoryAction';
import { fetchCombinedPM } from '../../../redux/actions/project_categoryActions';
import history from '../../../utils/history';
const FileList = lazy(() => import('./fileList'));
const CatList = lazy(() => import('./catList'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const eS = { textAlign: 'center', marginTop: '50px', marginBottom: '80px', width: '100%' };
const mT = { marginTop: '16px' };

const List = ({
    fileData, id, type,
    string, handleS, category, tabNav, typeU, pId, catData,
    stringU, handleSU, handleTU, typeC, client,
    stringC, handleSC, handleTC, auth, admin, fetchCombinedPM,
    stringP, handleSP, handleISL, isList, categoryP, fetchCombined, fetchCombinedC
}) => {
    const [categories, setC] = useState([]),
        [categoriesP, setCP] = useState([]),
        [categoriesC, setCC] = useState([]), [listC, setListC] = useState([]),
        [categoriesU, setCU] = useState([]), [listU, setListU] = useState([]),
        [ord, setO] = useState(0);

    useEffect(() => {
        let cat = [], catP = [];
        setC([]); setCP([]); setCC([]); setCU([]); setListC([]); setListU([]);
        if (!admin && category && category.length > 0) {
            cat = category;
            setC(cat);
        } else if (catData && catData.catList) {
            setC(catData.catList);
        }

        if (!auth && categoryP && categoryP.length > 0) {
            let tempArr = [];
            categoryP.map((i) => {
                if (!tempArr.includes(i.name)) {
                    tempArr.push(i.name);
                    catP.push(i);
                }
                return i;
            })
            setCP(catP);
        } else if (catData && catData.catList) {
            setCP(catData.catList);
        }

        if (fileData && tabNav === 2) {
            setListU(fileData.files);
            setCU(fileData.cats);
        }

        if (fileData && tabNav === 3) {
            setListC(fileData.files);
            setCC(fileData.catList);
        }

    }, [category, categoryP, string, stringP, auth, tabNav, fileData, catData, admin]);

    const onhandleS = e => handleS(e.target.value);
    const onhandleSU = e => handleSU(e.target.value);
    const onhandleSC = e => handleSC(e.target.value);
    const onhandleSP = e => handleSP(e.target.value);


    const handleSelectU = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleTU(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSelectC = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleTC(e.target.options[selectedIndex].getAttribute('data-key'));
    }


    const setIN = i => {
        history.push(`/organization/${id}/all/files/page/${i}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        let cat = [];
        if (!string) {
            cat = category;
        } else {
            cat = category;
            cat = cat.filter(Item => { return new RegExp('^^.*' + string + '.*', "i").test(Item.name); });
        }
        setC(cat);
    }

    const handleSearchU = e => {
        e.preventDefault();
        let data = { string: stringU, type: typeU === 'All' ? typeU : typeU.toLowerCase(), pId: pId };
        fetchCombined(data);
    }

    const handleSearchC = e => {
        e.preventDefault();
        let data = { string: stringC, type: typeC === 'All' ? typeC : typeC.toLowerCase(), pId: pId };
        fetchCombinedC(data);
    }

    const handleSearchP = e => {
        if (!auth) {
            e.preventDefault();
            let cat = [];
            if (!stringP) {
                cat = categoryP;
            } else {
                cat = categoryP;
                cat = cat.filter(Item => { return new RegExp('^^.*' + stringP + '.*', "i").test(Item.name); });
            }
            setCP(cat);
        } else {
            fetchCombinedPM({ string: stringP });
        }
    };

    const renderOptions = () => returnSelectT().map(Item => <option data-key={Item} key={Item}>{Item}</option>);

    let listItems = ['Company', 'Project', 'Personal'];

    if (client) listItems.push('Client');

    return <div className="col-11 f-w p-0">
        <h4 className="h">All Files</h4>
        <Tabnav items={listItems} i={tabNav} setI={setIN} />

        {tabNav === 0 && <>
            <div style={dF}>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Folder name" value={string} onChange={e => onhandleS(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
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

            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
                {categories && categories.length > 0 ? <Suspense fallback={<></>}> <CatList list={categories} isList={isList} i={0} id={id} ord={ord} /></Suspense>
                    : <h6 className="f-n" style={eS}>No folder found</h6>}
            </div>
        </>}

        {tabNav === 1 && <>
            <div style={dF}>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Folder name" value={stringP} onChange={e => onhandleSP(e)} onKeyPress={e => e.key === 'Enter' && handleSearchP(e)} />
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearchP(e)} ><div className="faH" /></button>
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

            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
                {categoriesP && categoriesP.length > 0 ? <Suspense fallback={<></>}> <CatList list={categoriesP} i={1} id={id} ord={ord} isList={isList} /></Suspense>
                    : <h6 className="f-n" style={eS}>No folder found</h6>}
            </div>
        </>}

        {tabNav === 2 && <>
            <div style={dF}>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Enter text here" value={stringU} onChange={e => onhandleSU(e)}
                        onKeyPress={e => e.key === 'Enter' && handleSearchU(e)} />
                    <select className="custom-select col-lg-2 col-4" onChange={e => handleSelectU(e)} defaultValue={type}>
                        {renderOptions()}
                    </select>
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearchU(e)} ><div className="faH" /></button>
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

            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
                {categoriesU && categoriesU.length > 0 && <Suspense fallback={<></>}> <CatList i={2} list={categoriesU} id={id} ord={ord} isList={isList} /></Suspense>}
                {listU && listU.length > 0 && <Suspense fallback={<></>}> <FileList i={2} isList={isList} list={listU} ord={ord} id={id} /> </Suspense>}
            </div>
            {((!listU || listU.length <= 0) && (!categoriesU || categoriesU.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
                <h6 style={{ fontSize: '14px', fontWeight: '600', color: 'grey' }}>Nothing found.</h6>
            </div>}
        </>}

        {tabNav === 3 && <>
            <div style={dF}>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Enter text here" value={stringC} onChange={e => onhandleSC(e)}
                        onKeyPress={e => e.key === 'Enter' && handleSearchC(e)} />
                    <select className="custom-select col-lg-2 col-4" onChange={e => handleSelectC(e)} defaultValue={type}>
                        {renderOptions()}
                    </select>
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearchC(e)} ><div className="faH" /></button>
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
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
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
    fetchCombined, fetchCombinedC, fetchCombinedCP, fetchCombinedPM
})(List);