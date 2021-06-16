import React, { Suspense, lazy, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchCatModal, moveCat, copyCat } from '../../../../redux/actions/userCategoryActions';
import Loader from '../../../loader/simpleLoader';
import ModalBg from '../../../containers/modalBgContainer';
import { cutFile, copyFile } from '../../../../redux/actions/userFilesActions';
const FolderList = lazy(() => import('./folderList'));
const eS = {
    textAlign: 'center',
    marginTop: '30px',
    marginLeft: 'auto',
    marginRight: 'auto'
};
const lS = {
    marginTop: '30px',
    marginBottom: '30px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const Modal = ({
    fetchCatModal, catData, onhandleModal, title, data, setCId, setSId,
    setMA, type, moveCat, cutFile, copyFile, copyCat, callFunc
}) => {

    useEffect(() => {
        fetchCatModal({ catId: data.sId, _id: data._id });
    }, [fetchCatModal, data.sId, data._id]);

    const handleSubmit = async e => {
        let dataSend;
        if (data.type === 0) {
            if (type === 0) {
                dataSend = {
                    _id: data._id,
                    catId: data.catId
                };

                await copyCat(dataSend);
            } else if (type === 1) {
                dataSend = {
                    _id: data._id,
                    catId: data.catId
                };

                await moveCat(dataSend);
            } else {
                callFunc()
            }
        } else {
            if (type === 0) {
                dataSend = {
                    _id: data._id,
                    catId: data.catId
                };

                await copyFile(dataSend);
            } else if (type === 1) {
                dataSend = {
                    _id: data._id,
                    cat: data.catId
                };

                await cutFile(dataSend);
            } else {
                callFunc();
            }
        }
    };

    const BreadCrumb = () => {
        if (catData && catData.cat) {
            return <>
                <h6 onClick={e => setSId('')} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', color: '#0000EE' }}>My Space</h6>
                <h6 onClick={e => setSId('')} style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer', color: '#0000EE' }}>{'>'}</h6>
                {catData.cat.pCat && catData.cat.pCat.length > 0 && catData.cat.pCat.map((pCat, k) => <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <h6 key={k} onClick={e => setSId(pCat._id)} style={{ fontWeight: '600', fontSize: '12px', color: '#0000EE', marginRight: '6px', cursor: 'pointer' }}>{pCat.name}</h6>
                    <h6 onClick={e => setSId(pCat._id)} style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', color: '#0000EE', cursor: 'pointer' }}>{'>'}</h6>
                </div>)}
                <h6 onClick={e => setSId(catData.cat._id)} style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px' }}>{catData.cat.name}</h6>
            </>
        }

        return <h6 onClick={e => setSId('')} style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer', color: '#0000EE' }}>My Space</h6>
    };

    return <ModalBg handleModal={onhandleModal}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginTop: '12px', padding: '6px 12px' }}>{title}</h3>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: '6px 12px' }}>{BreadCrumb()}</div>
        <hr />
        <div className="col-12" style={{ padding: '6px 12px' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <button type="button" onClick={e => setMA(true)} className="btn btn-primary" style={{ fontSize: '12px', padding: '4px 8px' }}>Create Folder</button>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {catData && catData.cats && catData.cats.length > 0 ? <Suspense fallback={<></>}> <FolderList list={catData.cats} _id={data._id} setCId={setCId} cId={data.catId} setSId={setSId} /> </Suspense> :
                    (!catData || !catData.cats) ? <div style={lS}><Loader /></div> : <h6 className="f-n" style={eS}>No folder found</h6>}
            </div>
        </div>
        <hr />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
            <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                onhandleModal();
            }}>Cancel</button>
            <button className="btn btn-primary" type="button" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={async e => {
                await handleSubmit(e);
                onhandleModal();
            }}>{title}</button>
        </div>
    </ModalBg>
}

const mapStateToProps = state => {
    return {
        catData: state.Category.dataList,
    }
}

export default connect(mapStateToProps, { fetchCatModal, moveCat, cutFile, copyFile, copyCat })(Modal);