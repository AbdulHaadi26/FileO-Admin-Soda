import React, { Suspense, lazy, useState } from 'react';
import '../style.css';
import { registerSetting } from '../../../redux/actions/settingActions';
import { connect } from 'react-redux';
import Tabnav from '../../tabnav';
import GSet from '../../../assets/tabnav/G-settings.svg';
import BSet from '../../../assets/tabnav/B-settings.svg';

let icons = [
    { G: GSet, B: BSet }
];

const SPKG = lazy(() => import('../../edits/editPackages'));

const Setting = ({ registerSetting, Org, tabNav, setTN, disabled }) => {
    const [num, setNum] = useState(0);

    const onhandleModal = mV => setNum(mV);

    const handleGenerate = e => {
        e.preventDefault();
        registerSetting();
    }

    const renderSettings = ({ packages }) => <Suspense fallback={<></>}>
        <SPKG disabled={disabled} head={'User Storage'} modal={num === 1 ? true : false} num={1} len={packages && packages.length > 0 ? packages : []} handleModal={onhandleModal} />
    </Suspense>

    return <div className="col-11 set-w p-0">
        <h4 className="h">Setting</h4>
        <Tabnav items={['Options']} i={tabNav} setI={setTN} icons={icons} />
        {!Org.settingsId && <div> <button disabled={disabled} className="btn btn-dark ml-2" onClick={e => handleGenerate(e)}>Generate settings</button> </div>}
        {Org.settingsId && renderSettings(Org.settingsId)}
    </div>
}


export default connect(null, { registerSetting })(Setting);