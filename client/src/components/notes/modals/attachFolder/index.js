import React, { useState, Suspense, lazy, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchCombined } from '../../../../redux/actions/userCategoryActions';
import Loader from '../../../loader/simpleLoader';
import ModalBg from '../../../containers/modalBgContainer';
const FileList = lazy(() => import('./fileList'));
const eS = { textAlign: 'center', marginTop: '30px', marginLeft: 'auto', marginRight: 'auto' };
const lS = { marginTop: '30px', marginBottom: '30px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };

const Modal = ({ _id, fetchCombined, catData, isL, onhandleModal, onAttach }) => {
    const [string, setS] = useState(''), [started, setStarted] = useState(0);

    useEffect(() => {
        let data = { _id: _id };
        fetchCombined(data);
        setStarted(1);
    }, [fetchCombined, _id]);

    const handleSearch = e => {
        e.preventDefault();
        let data = { _id: _id, string: string };
        fetchCombined(data);
    }

    let list = [];

    if (catData) {
        list = catData.cats;
    }

    const onAttachCat = (e, cat) => onAttach(e, cat);

    return <ModalBg handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Attach Folder</h3>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            <div className="input-group" style={{ width: '100%' }}>
                <input type="text" className="form-control" placeholder="Folder name" value={string} onChange={e => setS(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                </div>
            </div>
            <h3 style={{ fontWeight: '600', fontSize: '14px', marginTop: '12px' }}>My Space Folder</h3>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {list && list.length > 0 ? <Suspense fallback={<></>}> <FileList list={list} onAttachement={onAttachCat} /> </Suspense> :
                    !isL && started > 0 ? <h6 className="f-n" style={eS}>No folder found</h6> : <div style={lS}><Loader /></div>}
            </div>
        </div>
    </ModalBg>
}

const mapStateToProps = state => {
    return {
        catData: state.File.list,
    }
}

export default connect(mapStateToProps, { fetchCombined })(Modal);