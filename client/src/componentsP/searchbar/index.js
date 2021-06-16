import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCombinedL } from '../../redux/actions/personal/userCategoryActions';
import SimpleLoader from '../loader/simpleLoader'
import returnType from '../types';
import Folder from '../../assets/folder.svg';
import './style.css';
import history from '../../utils/history';

const SearchBar = ({ fetchCombinedL, isL, fileData, pId }) => {

    const [value, setVal] = useState(''), [active, setAct] = useState(false);

    const node = useRef({});


    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
        return
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    const renderFileList = (list) => {
        let listF = list.filter((i, k) => k < 7);
        return listF.map((File, k) => <div className="LI" style={{ borderRadius: '4px', position: 'relative', border:'none', cursor:'pointer' }} key={k} onClick={e => history.push(`/personal/myspace/user/${File.postedby}/file/${File._id}`)}>
            <img src={returnType(File.type)} alt="file" style={{ width: '36px', height: '36px' }} />
            <h6 style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400', marginLeft: '12px' }} className="mr-auto">{File.name}</h6>
        </div>)
    };

    const renderCatList = (list) => {
        let listF = list.filter((i, k) => k < 7);
        return listF.map((File, k) => <div className="LI" style={{ borderRadius: '4px', position: 'relative', border:'none', cursor:'pointer' }} key={k} onClick={e => history.push(`/personal/myspace/user/${File.uId}/files/${File._id}/list`)}>
            <img src={Folder} alt="Folder" style={{ width: '36px', height: '36px' }} />
            <h6 style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400', marginLeft: '12px' }} className="mr-auto">{File.name}</h6>
        </div>)
    };

    return <div className={`d-flexS col-lg-6 col-12 p-0`} style={{ marginLeft: 'auto' }}>
        <div className="searchbox" style={{ width: '100%', position: 'relative' }}>
            <div alt="Search Icon" className="icon" />
            <input type="text" placeholder="Search" value={value}
                onChange={e => setVal(e.target.value)} onKeyPress={e => {
                    if (e.key === 'Enter') {
                        fetchCombinedL({ string: value, type: 'All' });
                        setAct(true);
                    }
                }} />
            <div className="dropdown-content-sea" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                {isL && <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: 'auto' }}>
                    <SimpleLoader height={`2rem`} width={`2rem`} />
                </div>}
                {!isL && (!fileData || ((!fileData.cats || fileData.cats.length <= 0) && (!fileData.files || fileData.files.length <= 0))) &&
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: 'auto' }}>
                        <h6 style={{ fontSize: '14px', color: 'gray' }}>Nothing found.</h6>
                    </div>}
                {!isL && fileData && fileData.cats && fileData.cats.length > 0 && renderCatList(fileData.cats)}
                {!isL && fileData && fileData.files && fileData.files.length > 0 && renderFileList(fileData.files)}
                {!isL && fileData && fileData.cats && fileData.files && fileData.cats.length + fileData.files.length >= 15 &&
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: 'auto' }}>
                        <Link to={`/personal/myspace/user/${pId}/category/data/${value}/list`} style={{ fontSize: '14px', margin: '12px 0px' }}>Show more</Link>
                    </div>}
            </div>
        </div>
    </div>

};

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        isL: state.File.isL
    }
};

export default connect(mapStateToProps, { fetchCombinedL })(SearchBar);