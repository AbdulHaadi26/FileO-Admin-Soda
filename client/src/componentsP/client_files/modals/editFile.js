import React, { useState, useEffect } from 'react';
import Modal from '../../containers/modalBgContainer';
import { updateFile } from '../../../redux/actions/clientFilesAction';
import { connect } from 'react-redux';
const iG = { marginTop: '12px', width: '100%' };
const fS = { width: '100%', marginTop: '12px' };
const tS = { marginTop: '12px', width: '100%', textAlign: 'left' };

const Edit = ({ onhandleModal, File, updateFile }) => {
    const [text, setText] = useState(''), [description, setDescription] = useState(''), [selectList, setSL] = useState([]), [tempId, setTI] = useState('');

    const { file, catList } = File;
    const { _id } = file;

    useEffect(() => {
        let tempList = catList;
        tempList = tempList.filter(item => item._id !== file.category._id);
        setSL(tempList); setTI(file.category._id);
        setText(file.name); setDescription(file.description);
        setDescription(file.description ? file.description : '');
    }, [File, file, catList, setSL, setTI, setDescription]);

    const onhandleInputA = e => e.target.value.split(' ').length <= 500 && setDescription(e.target.value);

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) setTI(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const renderList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    const uptFile = async (e) => {
        e.preventDefault()
        let data = { name: text, description, cat: tempId, _id: _id };
        await updateFile(data);
        onhandleModal();
    };

    var category = '';
    if (File && File.file) category = File.file.category;

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <form onSubmit={e => uptFile(e)}>
            <h3 style={{ fontWeight: '600', fontSize: '18px', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>Edit File</h3>
            <hr />
            <div className="col-12" style={{ padding: '6px 12px' }}>
                <h3 style={{ fontWeight: '600', fontSize: '14px' }}>Name</h3>
                <div className="input-group" style={iG}>
                    <input type={'text'} className="form-control" placeholder={'File name'} value={text}
                        onChange={e => setText(e.target.value)} required={true} />
                </div>
                <h3 style={{ fontWeight: '600', fontSize: '14px', marginTop: '18px' }}>Folder</h3>
                {selectList && <select style={fS} className="form-control" onChange={e => handleSelect(e)}>
                    {category && <option key={category._id} data-key={category._id} data-name={category.name}>{category.name}</option>}
                    {renderList(selectList)}
                </select>}
                <h3 style={{ fontWeight: '600', fontSize: '14px', marginTop: '18px' }}>Description</h3>
                <div className="input-group" style={iG}>
                    <textarea type='text' className="form-control" placeholder={'File description'} value={description} onChange={e => onhandleInputA(e)} style={tS} />
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <p className="word-count" style={{ fontSize: '12px' }}>{description.split(" ").length} / 500</p>
                </div>
            </div>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                <button className="btn btn-danger" type="button" style={{ fontSize: '14px', fontWeight: '600', padding: '6px 24px' }} onClick={e => {
                    onhandleModal();
                }}>Cancel</button>
                <button className="btn btn-primary" type="submit" style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Update</button>
            </div>
        </form>
    </Modal>
};

export default connect(null, { updateFile })(Edit);
