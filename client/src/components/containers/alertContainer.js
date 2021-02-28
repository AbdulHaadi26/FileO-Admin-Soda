import React, { Suspense } from 'react';
const aS = { display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '16px', marginBottom: '16px' };

export default ({ isErr, eT, onClear, children }) => isErr ? <div className="alert alert-danger" style={aS}>
    <strong className="mr-auto">{eT}</strong>
    <button type="button" className="btn close" onClick={e => onClear()}> <span aria-hidden="true">&times;</span> </button>
</div> : <Suspense fallback={<></>}>{children}</Suspense>