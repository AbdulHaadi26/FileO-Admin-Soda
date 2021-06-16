import React from 'react';

export default ({ onHandleInput, value, children, comp, holder, handleSearch, isCreate, pad, classN, callFunc, isElp, callSub, isInput, comp2 }) => {
    return <div className={`d-flexS ${classN}`} >
        <div className={`${isCreate ? 'col-lg-8' : 'col-12'} col-12 p-0`} style={{ marginLeft: isCreate ? '0px' : 'auto' }}>
            <div className="searchbox" style={{ padding: !pad ? '10px' : '5px 10px' }}>
                <div alt="Search Icon" className="icon" style={{ cursor: 'pointer' }} onClick={e => handleSearch(e)} />
                {!isInput && <input type="text" style={{ flex: '1' }} placeholder={holder} value={value}
                    onKeyPress={e => e.key === 'Enter' && handleSearch(e)}
                    onChange={e => onHandleInput(e.target.value)} />}
                {comp}
            </div>
        </div>
        {isCreate && <div className="col-lg-4 col-12">
            <div className={`buttonS ${isElp ? '' : 'full-widthb'}`} style={{ position: 'relative', alignSelf:'stretch' }} onClick={e => !isElp && callFunc(e)}>
                <div className={isElp ? `col-10` : 'col-12 p-0'} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} onClick={e => isElp && callFunc(e)}>
                    <div className="ico"></div>
                    <h6 className="text">Create New</h6>
                </div>
                {isElp && <div className="col-2 side">
                    {children}
                </div>}
            </div>
        </div>}
    </div>

}