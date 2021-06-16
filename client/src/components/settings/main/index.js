import React, { lazy, Suspense } from 'react';
import '../style.css';
const Setting = lazy(() => import('../details'));
export default ({ Org, User, tabNav, setTN, disabled }) => <Suspense fallback={<></>}>
    <Setting Org={Org} tabNav={tabNav} setTN={setTN} User={User} disabled={disabled} />
</Suspense>