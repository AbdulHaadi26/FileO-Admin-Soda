import React, { useEffect, useState } from 'react';
import Modal from '../../containers/modalBLContainer';
import Logo from '../../../assets/logo.svg';
import Down from '../../../assets/downloadBill.svg';
import { getPackage } from '../../../redux/actions/organizationActions';
import { connect } from 'react-redux';
import ReactToPdf from 'react-to-pdf';

const Bill = ({ onhandleModal, setOId, Bill, organization, getPackage, width }) => {
    const [pkg, setPKG] = useState('');
    const ref = React.createRef();

    useEffect(() => {
        const render = async () => {
            let pg = '';

            if (Bill.data && Bill.data.pkgId) {
                pg = await getPackage({ _id: Bill.data.pkgId });
                if (pg && pg.plan)
                    setPKG(pg.plan);
            }
        };
        render();
    }, [Bill, setPKG, getPackage])

    const renderType = (type) => {
        switch (type) {
            case 'Employee': return 'User Upgrade';
            case 'Trail': return 'Trail Upgrade';
            case 'Upgrade': return 'Stroage Upgrade';
            default: return type;

        }
    };

    function numberWithCommas(x) {
        return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : x;
    };


    const ToBeRendered = () => {
        return <div style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', position: 'absolute', width: '786px', zIndex: '-1', top: '0px' }} ref={ref}>
            <h3 style={{ fontSize: '36px', fontWeight: '600', width: '100%', textAlign: 'center' }}>File-O</h3>
            <h6 style={{ fontSize: '12px', fontWeight: '600', marginTop: '24px' }}>INVOCIE</h6>
            <h6 style={{ fontSize: '12px' }}>{organization.name}</h6>
            <h6 style={{ fontSize: '12px' }}>{organization.address}</h6>
            <h6 style={{ fontSize: '12px', marginTop: '24px' }}><b>Invoice Date:</b> {Bill.date ? Bill.date.substr(0, 10) : ''}</h6>
            <h6 style={{ fontSize: '12px' }}><b>Invoice Type:</b> {renderType(Bill.type)}</h6>
            <h6 style={{ fontSize: '12px' }}><b>OrderId:</b> {Bill.orderId}</h6>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#dfe6e9', margin: '24px 0px 0px 0px', padding: '6px 12px', borderRadius: '6px', color: 'gray' }}>
                <h6 style={{ fontSize: '12px', marginTop: '6px' }}>Total Bill</h6>
                <h1 style={{ fontSize: '28px', color: 'black' }}>PKR {numberWithCommas(Bill.price)}</h1>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h6 style={{ fontSize: '12px', marginRight: '12px', color: 'black' }}>Storage Payment {pkg && pkg.size && `(${pkg.size} GB)`}</h6>
                        {pkg && pkg.size && <h6 style={{ fontSize: '12px', marginRight: '11px' }}>{pkg && pkg.size && `${pkg.size} GB`} at PKR 5 per GB/month</h6>}
                    </div>
                    <h6 style={{ fontSize: '12px', marginLeft: 'auto', color: 'black' }}>PKR {numberWithCommas(Bill.pkgPrice)}</h6>
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h6 style={{ fontSize: '12px', marginRight: '12px', color: 'black' }}>User Payment {Bill.data && Bill.data.count && `(${Bill.data.count} ${Bill.data.count > 1 ? 'Users' : 'User'})`}</h6>
                        {Bill.data && Bill.data.count && <h6 style={{ fontSize: '12px', marginRight: '11px' }}>
                            {`${Bill.data.count} ${Bill.data.count > 1 ? 'users' : 'user'}`} at PKR 275 per user/month
                    </h6>}
                    </div>
                    <h6 style={{ fontSize: '12px', marginLeft: 'auto', color: 'black' }}>PKR {numberWithCommas(Bill.userPrice)}</h6>
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h6 style={{ fontSize: '12px', marginRight: '12px', color: 'black' }}>Difference</h6>
                    </div>
                    <h6 style={{ fontSize: '12px', marginLeft: 'auto', color: 'black' }}>PKR {numberWithCommas(Bill.difference)}</h6>
                </div>
                <div style={{ width: '100%', backgroundColor: 'gray', height: '2px', margin: '8px 0px' }}></div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h6 style={{ fontSize: '12px', marginRight: '12px', color: 'black' }}>Total Amount</h6>
                    </div>
                    <h6 style={{ fontSize: '12px', marginLeft: 'auto', color: 'black' }}>PKR {numberWithCommas(Bill.price)}</h6>
                </div>
            </div>
        </div>
    }

    return <Modal handleModal={onhandleModal} isOpt={true}>
        <ReactToPdf targetRef={ref} filename={`Invoice.pdf`} y={1.8}>
            {({ toPdf }) => (
                <img src={Down} alt="Download" onClick={toPdf} style={{ zIndex: '9999', width: '16px', height: '16px', cursor: 'pointer', position: 'absolute', top: '12px', right: '12px' }} />
            )}
        </ReactToPdf>
        <div className="col-12" style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: 'white' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <img src={Logo} alt="File Logo" style={{ width: '60px', height: '60px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '12px', marginLeft: '12px' }}>
                    <h6 style={{ fontSize: '12px', fontWeight: '600' }}>INVOCIE</h6>
                    <h6 style={{ fontSize: '12px' }}>{organization.name}</h6>
                    <h6 style={{ fontSize: '12px' }}>{organization.address}</h6>
                </div>
            </div>
            <h6 style={{ fontSize: '12px', marginTop: '24px' }}><b>Invoice Date:</b> {Bill.date ? Bill.date.substr(0, 10) : ''}</h6>
            <h6 style={{ fontSize: '12px' }}><b>Invoice Type:</b> {renderType(Bill.type)}</h6>
            <h6 style={{ fontSize: '12px' }}><b>OrderId:</b> {Bill.orderId}</h6>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#dfe6e9', margin: Bill.status === 'Unpaid' ? '24px 0px 0px 0px' : '24px 0px', padding: '6px 12px', borderRadius: '6px', color: 'gray' }}>
                <h6 style={{ fontSize: '12px', marginTop: '6px' }}>Total Bill</h6>
                <h1 style={{ fontSize: '28px', color: 'black' }}>PKR {numberWithCommas(Bill.price)}</h1>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h6 style={{ fontSize: '12px', marginRight: '12px', color: 'black' }}>Storage Payment {pkg && pkg.size && `(${pkg.size} GB)`}</h6>
                        {pkg && pkg.size && <h6 style={{ fontSize: '12px', marginRight: '11px' }}>{pkg && pkg.size && `${pkg.size} GB`} at PKR 5 per GB/month</h6>}
                    </div>
                    <h6 style={{ fontSize: '12px', marginLeft: 'auto', color: 'black' }}>PKR {numberWithCommas(Bill.pkgPrice)}</h6>
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h6 style={{ fontSize: '12px', marginRight: '12px', color: 'black' }}>User Payment {Bill.data && Bill.data.count && `(${Bill.data.count} ${Bill.data.count > 1 ? 'Users' : 'User'})`}</h6>
                        {Bill.data && Bill.data.count && <h6 style={{ fontSize: '12px', marginRight: '11px' }}>
                            {`${Bill.data.count} ${Bill.data.count > 1 ? 'users' : 'user'}`} at PKR 275 per user/month
                        </h6>}
                    </div>
                    <h6 style={{ fontSize: '12px', marginLeft: 'auto', color: 'black' }}>PKR {numberWithCommas(Bill.userPrice)}</h6>
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h6 style={{ fontSize: '12px', marginRight: '12px', color: 'black' }}>Difference</h6>
                    </div>
                    <h6 style={{ fontSize: '12px', marginLeft: 'auto', color: 'black' }}>PKR {numberWithCommas(Bill.difference)}</h6>
                </div>
                <div style={{ width: '100%', backgroundColor: 'gray', height: '2px', margin: '8px 0px' }}></div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h6 style={{ fontSize: '12px', marginRight: '12px', color: 'black' }}>Total Amount</h6>
                    </div>
                    <h6 style={{ fontSize: '12px', marginLeft: 'auto', color: 'black' }}>PKR {numberWithCommas(Bill.price)}</h6>
                </div>
            </div>
            {Bill.status === 'Unpaid' &&
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: '6px 12px', marginTop: '12px', marginBottom: '12px' }}>
                    <button className="btn btn-primary" type="button" onClick={e => {
                        onhandleModal();
                        setOId(Bill)
                    }} style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '600', padding: '6px 24px' }}>Pay Now</button>
                </div>}
        </div>
        <ToBeRendered />
    </Modal>

};

export default connect(null, { getPackage })(Bill);
