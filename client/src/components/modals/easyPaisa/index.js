import React, { useEffect, useRef } from 'react';
import aesjs from 'aes-js';
import ModalBgContainer from '../../containers/modalStrContainer';
import { baseUrl } from '../../../utils/api';
import { connect } from 'react-redux';
import { transactionStatus } from '../../../redux/actions/organizationActions';

const EasyPaisa = ({ order, type, onHandleModal, transactionStatus }) => {

    const ifr = useRef('');

    useEffect(() => async () => {
        await transactionStatus({ orderId: order.orderId });
    }, [order, transactionStatus]);

    useEffect(() => {
        function loadIframe() {
            var storeID = document.getElementById("storeId").value;
            var amount = document.getElementById("amount").value;
            var orderID = document.getElementById("orderId").value;
            var email = document.getElementById("email").value;
            var cellNo = document.getElementById("cellNo").value;

            let tokenDate = new Date(Date.now());
            tokenDate.setDate(tokenDate.getDate() + 1);

            let timeStamp = new Date(Date.now());

            let month = tokenDate.getMonth() + 1 >= 10 ? tokenDate.getMonth() + 1 : `0${tokenDate.getMonth() + 1}`;
            let day = tokenDate.getDate() >= 10 ? tokenDate.getDate() : `0${tokenDate.getDate()}`;

            let mins = tokenDate.getMinutes() >= 10 ? tokenDate.getMinutes() : `0${tokenDate.getMinutes()}`;
            let seconds = tokenDate.getSeconds() >= 10 ? tokenDate.getSeconds() : `0${tokenDate.getSeconds()}`;

            let monthS = timeStamp.getMonth() + 1 >= 10 ? timeStamp.getMonth() + 1 : `0${timeStamp.getMonth() + 1}`;
            let dayS = timeStamp.getDate() >= 10 ? timeStamp.getDate() : `0${timeStamp.getDate()}`;

            let minsS = timeStamp.getMinutes() >= 10 ? timeStamp.getMinutes() : `0${timeStamp.getMinutes()}`;
            let secondsS = timeStamp.getSeconds() >= 10 ? timeStamp.getSeconds() : `0${timeStamp.getSeconds()}`;

            let tS = timeStamp.getFullYear() + '-' +
                monthS + '-' +
                dayS + 'T' +
                timeStamp.getHours() + ':' +
                minsS + ':' +
                secondsS;

            tokenDate = tokenDate.getFullYear() + '' +
                month + '' +
                day + ' ' +
                tokenDate.getHours() + '' +
                mins + '' +
                seconds;

            let params = {
                storeId: storeID,
                orderId: orderID,
                transactionAmount: amount,
                mobileAccountNo: cellNo,
                emailAddress: email,
                transactionType: 'InitialRequest',
                tokenExpiry: encodeURIComponent(tokenDate),
                bankIdentificationNumber: '',
                merchantPaymentMethod: '',
                postBackURL: encodeURIComponent(`${baseUrl}/login`),
                signature: '',
                encryptedHashRequest: '',
            };

            let paramsEncryption = {
                amount: amount,
                emailAddress: email,
                expiryDate: tokenDate,
                mobileNum: cellNo,
                orderRefNum: orderID,
                storeID: storeID,
                timeStamp: tS,
                postBackURL: `${baseUrl}/login`
            };

            let sampleString = `amount=${paramsEncryption.amount}&expiryDate=${paramsEncryption.expiryDate}&merchantPaymentMethod=${type}&orderRefNum=${paramsEncryption.orderRefNum}&paymentMethod=InitialRequest&postBackURL=${paramsEncryption.postBackURL}&storeId=${paramsEncryption.storeID}&timeStamp=${paramsEncryption.timeStamp}`;

            //let hashKey = "4QEI4BKYDC8M5ZYB";

            let hashKey = "US0HTKYKOQOZNE0D";

            const keyBuffer = aesjs.utils.utf8.toBytes(hashKey);
            const inputBuffer = aesjs.padding.pkcs7.pad(aesjs.utils.utf8.toBytes(sampleString));
            const escEcb = new aesjs.ModeOfOperation.ecb(keyBuffer);
            const encryptedBytes = escEcb.encrypt(inputBuffer);
            const encryptedData = Buffer.from(encryptedBytes).toString('base64');

            params.encryptedHashRequest = encodeURIComponent(encryptedData);


            if (ifr && ifr.current) {
                if (params.storeId !== "" && params.orderId !== "") {
                    // let mainUrl = `https://easypaystg.easypaisa.com.pk/tpg/?storeId=${params.storeId}&orderId=${params.orderId}&transactionAmount=${params.transactionAmount}&mobileAccountNo=${params.mobileAccountNo}&emailAddress=${params.emailAddress}&transactionType=InitialRequest&tokenExpiry=${params.tokenExpiry}&bankIdentificationNumber=&merchantPaymentMethod=${type}&postBackURL=${params.postBackURL}&signature=&encryptedHashRequest=${params.encryptedHashRequest}`;
                    let mainUrl = `https://easypay.easypaisa.com.pk/tpg/?storeId=${params.storeId}&orderId=${params.orderId}&transactionAmount=${params.transactionAmount}&mobileAccountNo=${params.mobileAccountNo}&emailAddress=${params.emailAddress}&transactionType=InitialRequest&tokenExpiry=${params.tokenExpiry}&bankIdentificationNumber=&merchantPaymentMethod=${type}&postBackURL=${params.postBackURL}&signature=&encryptedHashRequest=${params.encryptedHashRequest}`;
                    ifr.current.src = mainUrl;
                }
                return false;
            }

            return true;
        }

        true && loadIframe();
    }, [type]);

    return <ModalBgContainer handleModal={e => {
        onHandleModal();
    }} EP={true} isTrial={false}>
        {true && <>
            <input name="storeId" id="storeId" defaultValue="78076" hidden />
            {false && <input name="storeId" id="storeId" defaultValue="11989" hidden />}
            <input name="amount" id="amount" defaultValue={`${order.price}`} hidden />
            <input name="orderId" id="orderId" defaultValue={order.orderId} hidden />
            <input name="email" id="email" defaultValue="" hidden />
            <input name="cellNo" id="cellNo" defaultValue="" hidden />
            <iframe id="easypay-iframe" title="Easy Paisa" style={{ width: '100%', height: '500px' }} className={order ? 'show-iframe' : ''} name="easypay-iframe" ref={ifr} src="about:blank"></iframe>
        </>}
    </ModalBgContainer>
};

export default connect(null, { transactionStatus })(EasyPaisa);
