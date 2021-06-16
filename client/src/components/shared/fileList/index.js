import React, { lazy, Suspense, useState } from 'react';
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
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
import { Link } from 'react-router-dom';
let icons = [{ G: GFolder, B: BFolder }];
const FileList = lazy(() => import('./fileList'));
const ListC = lazy(() => import('../catListC'));

const List = ({
    id, _id, catId, pCat, fileData, string, type, handleS, handleT, tabNav, setTN, isList, handleISL, category, fetchCombinedShared, profile
}) => {

    const [ord, setO] = useState(0);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleSearch = e => {
        e.preventDefault();
        let data = { string: string, cat: catId, type: type === 'All' ? type : type.toLowerCase(), pId: _id };
        fetchCombinedShared(data);
    };

    const renderOptions = () => returnSelectT().map(Item => <option key={Item} data-key={Item}>{Item}</option>);

    let list = [], listF = [];

    if (fileData && fileData.files) {
        listF = fileData.files;
        listF.map(i => i.isChecked = false);
    }

    if (fileData && fileData.cats) {
        list = fileData.cats;
    };

    const BreadCrumb = () => {

        if (category && category.cat) {

            let pCats = [];

            if (category.cat.pCat && category.cat.pCat.length > 0) {
                let index = 0;

                category.cat.pCat.map((i, k) => {
                    if (i._id === pCat) index = k;
                    return i;
                });

                pCats = category.cat.pCat.filter((i, k) => k >= index);
            }
            return <>
                {profile && profile._id && <Link to={`/organization/${category.cat.org}/user/${profile._id}/shared/files/page/0`} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>Shared</Link>}
                {profile && profile._id && <Link to={`/organization/${category.cat.org}/user/${profile._id}/shared/files/page/0`} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>{'>'}</Link>}
                {pCats.map((pCate, k) => <div style={{ display: 'flex', flexDirection: 'row' }} key={k}>
                    <Link to={`/organization/${category.cat.org}/sharedby/${category.cat.uId}/parentCategory/${pCat}/category/${pCate._id}/list`}
                        style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', marginTop: '-2px' }}>{pCate.name}</Link>
                    <Link to={`/organization/${category.cat.org}/sharedby/${category.cat.uId}/parentCategory/${pCat}/category/${pCate._id}/list`}
                        style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer', marginTop: '-2px' }}>{'>'}</Link>
                </div>)}
                <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px' }}>{category.cat.name}</h6>
            </>
        }
    };


    return <div className="col-11 sh-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">Shared Folders</h4>
            <div style={{ marginLeft: 'auto' }} />
            <div className="input-group col-lg-3">
                <input type="text" className="form-control col-8" placeholder="Enter text here" value={string} onChange={e => handleS(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <select className="custom-select col-4" onChange={e => handleSelect(e)} defaultValue={type}>
                    {renderOptions()}
                </select>
            </div>
            <div className={`order ${ord < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                <img src={ord === 1 ? CalAsc : CalDes} alt="Icon" style={{ width: '100%' }} />
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
        <Tabnav items={[category.cat && category.cat && category.cat.name ? category.cat.name : '']} i={tabNav} setI={setTN} icons={icons} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>{BreadCrumb()}</div>
        {((!listF || listF.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
            <h6 style={{ fontSize: '14px', fontWeight: '600', color: 'grey' }}>Nothing found.</h6>
        </div>}

        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
            {list && list.length > 0 && <Suspense fallback={<></>}><ListC catId={pCat} id={id} ord={ord} uId={_id} list={list} isList={isList} /></Suspense>}
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
};

export default connect(mapStateToProps, { fetchCombinedShared })(List);