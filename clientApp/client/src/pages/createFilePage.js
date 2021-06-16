import React, { useState, useEffect, lazy, Suspense } from 'react';
import Axios from 'axios';
import Loader from '../components/loader/loader';
import { clientUrl } from '../utils/api';
const FileLoader = lazy(() => import('../components/loader/mfileLoader'));
const CreateFile = lazy(() => import('../components/createFile'));
const Error = lazy(() => import('../components/file/error'));
const Success = lazy(() => import('../components/file/success'));

export default ({ match }) => {
    const { postedby, category } = match.params;
    const [val, setS] = useState(1), [errT, setET] = useState(0), [set, setSet] = useState(''), [fileData, setFD] = useState([]), [per, setPer] = useState(0);

    useEffect(() => {
        async function fetchSetting() {
            const res = await Axios.get(`${clientUrl}/apiC/settings/settings`);
            if (!res.data.error && res.data.setting) { setS(0); setSet(res.data.setting); }
        }
        fetchSetting();
    }, []);

    const handleS = (val, eT) => { setS(val); setET(eT); }
    const handleFD = (fd, per) => { setFD(fd); setPer(per) };

    return <div className="container-fluid">
        <div className="row">
            {val === 1 && <Loader />}
            <Suspense fallback={<></>}>
                {val === 0 && <CreateFile onhandleS={handleS} setting={set} onhandleFD={handleFD} postedby={postedby} category={category ? category : ''} />}
                {val === 2 && <Error eT={errT} />}
                {val === 3 && <div className="col-12 p-0" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <FileLoader setting={set} fileList={fileData} onFinish={handleS} per={per} />
                </div>}
                {val === 4 && <Success />}
            </Suspense>
        </div>
    </div>
}