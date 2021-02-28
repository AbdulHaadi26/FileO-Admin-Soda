import React, { useState, Suspense, lazy, useEffect } from 'react';
import { returnSelectT } from '../../../types';
import { connect } from 'react-redux';
import { fetchCombined, getCatSelect } from '../../../../redux/actions/userFilesActions';
import Loader from '../../../loader/simpleLoader';
import ModalBg from '../../../containers/modalBgContainer';
const FileList = lazy(() => import('./fileList'));
const eS = { textAlign: 'center', marginTop: '30px' };
const lS = { marginTop: '30px', marginBottom: '30px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };

const Modal = ({ _id, fetchCombined, fileData, isSuc, isL, onhandleModal, getCatSelect, onAttach, catList }) => {
    const [type, setT] = useState('All'), [cId, setCId] = useState(''), [string, setS] = useState(''), [started, setStarted] = useState(0);

    useEffect(() => {
        let data = { string: '', type: 'All', pId: _id };
        fetchCombined(data);
        getCatSelect(_id);
        setStarted(1);
    }, [fetchCombined, getCatSelect, _id]);

    const onhandleInput = e => setS(e.target.value);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && setT(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSelectType = e => {
        const selectedIndex = e.target.options.selectedIndex;
        setCId(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleSearch = e => {
        e.preventDefault();
        let data = { string: string, type: type === 'All' ? type : type.toLowerCase(), pId: _id, cId: cId };
        fetchCombined(data);
    }

    const renderOptions = () => returnSelectT().map(Item => <option key={Item} data-key={Item}>{Item}</option>);

    const renderOptionsT = () => {
        var list = [{ name: 'All', _id: '' }];
        if (catList && catList.length > 0) catList.map(i => list.push(i));
        return list.map((Item, k) => <option key={k} data-key={Item._id}>{Item.name}</option>);
    }

    var list = [];

    if (isSuc && fileData) list = fileData.files;

    const onAttachFile = (e, file) => onAttach(e, file);

    return <ModalBg handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Attach File</h3>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            <div className="input-group" style={{ width: '100%' }}>
                <input type="text" className="form-control" placeholder="File name" value={string} onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <select className="custom-select col-lg-2 col-4" onChange={e => handleSelect(e)} defaultValue={type}>
                    {renderOptions()}
                </select>
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                </div>
            </div>
            <select className="form-control" style={{marginTop:'12px'}} onChange={e => handleSelectType(e)}>
                {renderOptionsT()}
            </select>
            <h3 style={{ fontWeight: '600', fontSize: '14px', marginTop: '12px' }}>My Space Files</h3>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {list && list.length > 0 ? <Suspense fallback={<></>}>
                    <FileList list={list} onAttachement={onAttachFile} /> </Suspense> :
                    !isL && started > 0 ? <div> <h6 className="f-n" style={eS}>No file found</h6> </div> : <div style={lS}><Loader /></div>}
            </div>
        </div>
    </ModalBg>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isSuc: state.File.isSuc,
        isL: state.File.isL,
        catList: state.Category.list
    }
}

export default connect(mapStateToProps, { fetchCombined, getCatSelect })(Modal);