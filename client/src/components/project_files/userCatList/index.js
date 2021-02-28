import React, { useEffect, useState, lazy, Suspense } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
const CatList = lazy(() => import('./folderList'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const mT = { marginTop: '16px' };
const eS = { textAlign: 'center', marginTop: '50px', marginBottom: '80px' };

const User = ({
    project, tabNav, setTN, org, emp, isList, handleISL, string, handleS
}) => {
    const [categories, setC] = useState([]), [pId, setPID] = useState(''), [mainCat, setMC] = useState([]), [ord, setO] = useState(0);

    useEffect(() => {
        if (emp) {
            let { userRoles, projId } = emp;
            let cats = [];
            if (userRoles && userRoles.length > 0) {
                userRoles.map(i => cats = cats.concat(i.category))
                cats = Array.from(new Set(cats));
            }
            if (cats.length > 0) {
                let cat = cats;
                if (string) cat = cat.filter(Item => { return new RegExp('^^.*' + string + '.*', "i").test(Item.name); });
                setC(cat); setMC(cats); setPID(projId);
            }
        }
    }, [emp, setC, string]);

    const onhandleS = e => handleS(e.target.value);

    const handleSearch = (e, num) => {
        e.preventDefault();
            let cat = [];
            if (!string) {
                cat = mainCat;
            } else {
                cat = mainCat;
                cat = cat.filter(Item => { return new RegExp('^^.*' + string + '.*', "i").test(Item.name); });
            }
            setC(cat); 
    }

    return <div className="col-11 f-w p-0">
        <h4 className="h">{project && project.project ? project.project.name : ''}</h4>
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
            {categories && categories.length > 0 ? <div className="col-12 p-0">
                <Suspense fallback={<></>}> <CatList list={categories} ord={ord} org={org} pId={pId} isList={isList} /></Suspense>
            </div> : <div> <h6 className="f-n" style={eS}>No folder found</h6> </div>}
        </>}
    </div>
}

const mapStateToProps = state => {
    return {
        isSucP: state.Project.isSuc,
        project: state.Project.data
    }
}

export default connect(mapStateToProps)(User);