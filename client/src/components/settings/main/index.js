import React, { lazy, Suspense } from 'react';
import '../style.css';
const Setting = lazy(() => import('../details'));
export default ({ Org, User, tabNav, setTN }) => <Suspense fallback={<></>}> <Setting Org={Org} tabNav={tabNav} setTN={setTN} User={User} /></Suspense> 