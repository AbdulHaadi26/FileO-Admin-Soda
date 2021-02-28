import React, { lazy, Suspense, useEffect, useState } from 'react';
import '../style.css';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
const CatList = lazy(() => import('./catList'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const eS = { textAlign: 'center', marginTop: '50px', marginBottom: '80px' };
const mT = { marginTop: '16px' };

const List = ({
    id, isList, handleISL,
    string, handleS, category, tabNav, setTN
}) => {
    const [categories, setC] = useState([]), [ord, setO] = useState(0);

    useEffect(() => {
        if (category) {
            let cat = category;
            if (string) cat = cat.filter(Item => { return new RegExp('^^.*' + string + '.*', "i").test(Item.name); });
            setC(cat);
        }
    }, [category, setC, string, id]);

    const onhandleS = e => handleS(e.target.value);


    const handleSearch = (e, num) => {
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

    return <div className="col-11 f-w p-0">
        <h4 className="h">Files</h4>
        <Tabnav items={['Folders']} i={tabNav} setI={setTN} />
        {tabNav === 0 && <>
            <div style={dF}>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Folder name" value={string} onChange={e => onhandleS(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e, 2)} />
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e, 2)} ><div className="faH" /></button>
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
            {categories && categories.length > 0 ? <Suspense fallback={<></>}> <CatList list={categories} id={id} ord={ord} isList={isList} /></Suspense>
             : <div><h6 className="f-n" style={eS}>No folder found</h6> </div>}
        </>}
    </div>
}


export default List;