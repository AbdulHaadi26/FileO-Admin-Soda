import React from 'react';
import returnType from '../../../types';
import PlusB from '../../../../assets/plusB.svg';

export default ({ list, onAttachement }) => list.map(File => <div className="col-lg-2 col-4 mFWS" key={File._id}>
           <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
                <div onClick={e => onAttachement(e, File)} style={{
                    width: '18px', height: '18px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                    justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                }}>
                    <div style={{ width: '10px', height: '10px', cursor: 'pointer', backgroundImage: `url('${PlusB}')` }} />
                </div>
            </h6>
        </div>
        <img src={returnType(File.type)} alt="File"/>
        <h6 style={{ fontSize: '12px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>{File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</h6>
</div>);