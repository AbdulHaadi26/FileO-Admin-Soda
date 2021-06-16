import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchCombined } from '../../../../redux/actions/userFilesActions';
import { getCatC } from '../../../../redux/actions/userCategoryActions';
import Loader from '../../../loader/simpleLoader';
import ModalBg from '../../../containers/modalBgContainer';
import FolderList from './folderList';
import FileList from './fileList';
import { returnSelectT } from '../../../types';
const lS = { marginTop: '30px', marginBottom: '30px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };

const Modal = ({ fetchCombined, cId, catData, onhandleModal, onAttachCat, onAttachFile, setCId, getCatC, isL, fileData, setModal, disabled }) => {
    const [string, setS] = useState(''), [started, setStarted] = useState(0), [type, setType] = useState('All');

    useEffect(() => {
        let data = {
            cat: cId,
            type: 'All'
        };

        fetchCombined(data);
        cId && getCatC(cId);
        setStarted(1);
    }, [fetchCombined, cId, getCatC]);

    const handleSearch = e => {
        e.preventDefault();
        let data = {
            cat: cId, type: type === 'All' ? type : type.toLowerCase(), string: string
        };
        fetchCombined(data);
    };

    let list = [], listC = [];

    const renderOptions = () => returnSelectT().map(Item => <option key={Item} data-key={Item}>{Item}</option>);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && setType(e.target.options[selectedIndex].getAttribute('data-key'));
    };


    if (fileData) {
        listC = fileData.cats;
        list = fileData.files;
    }

    const BreadCrumb = () => {
        if (cId && catData && catData.cat) {
            return <>
                <h6 onClick={e => setCId('')} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', color: 'gray' }}>My Space</h6>
                <h6 onClick={e => setCId('')} style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer', color: 'gray' }}>{'>'}</h6>
                {catData.cat.pCat && catData.cat.pCat.length > 0 && catData.cat.pCat.map((pCat, k) => <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <h6 key={k} onClick={e => setCId(pCat._id)} style={{ fontWeight: '600', fontSize: '12px', color: 'gray', marginRight: '6px', cursor: 'pointer' }}>{pCat.name}</h6>
                    <h6 onClick={e => setCId(pCat._id)} style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', color: 'gray', cursor: 'pointer' }}>{'>'}</h6>
                </div>)}
                <h6 onClick={e => setCId(catData.cat._id)} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px' }}>{catData.cat.name}</h6>

            </>
        }

        return <h6 onClick={e => setCId('')} style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer', color: 'gray' }}>My Space</h6>
    };

    return <ModalBg handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', marginBottom: '12px', padding: '6px 12px' }}>Attach Folder/File</h3>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: '6px 12px' }}>{BreadCrumb()}</div>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}><button style={{ marginBottom: '12px', marginLeft: 'auto', marginTop: '0px' }} disabled={disabled} className="btn btn-dark" onClick={e => setModal()}>Attach files from PC</button>
            <div className="input-group" style={{ width: '100%' }}>
                <input type="text" className="form-control col-8" placeholder="Enter text here" value={string} onChange={e => setS(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <select className="custom-select col-4" onChange={e => handleSelect(e)} defaultValue={type}> {renderOptions()} </select>
            </div>
            <hr />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {!isL && started > 0 && listC && listC.length > 0 &&
                    <FolderList list={listC} onAttachement={onAttachCat} setCId={setCId} />}
                {!isL && started > 0 && list && list.length > 0 &&
                    <FileList list={list} onAttachement={onAttachFile} />}
            </div>
            {!isL && started > 0 && ((!listC || listC.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
                <h6>Nothing found</h6>
            </div>}
            {isL && <div style={lS}><Loader /></div>}
        </div>
    </ModalBg>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isL: state.File.isL,
        catData: state.Category.data
    }
};

export default connect(mapStateToProps, { fetchCombined, getCatC })(Modal);