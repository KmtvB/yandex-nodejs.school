
var MyForm = (function () {
    /* 
    * form data
    */
    const formElems = {
        form: document.querySelector('#myForm'),
        fio: document.querySelector('#myForm #fio'),
        email: document.querySelector('#myForm #email'),
        phone: document.querySelector('#myForm #phone'),
        submit: document.querySelector('#myForm #submitButton')
    }
    const getData = () => ({
        [formElems.fio.name]: formElems.fio.value,
        [formElems.email.name]: formElems.email.value,
        [formElems.phone.name]: formElems.phone.value
    });
    const setData = ({ fio, email, phone }) => {
        formElems.fio.value = fio;
        formElems.phone.value = phone;
        formElems.email.value = email;
    }

    /* 
    * validating
    */
    function validateFio(fio) {
        return fio.search(/^[a-zA-ZА-Яа-я]+ [a-zA-ZА-Яа-я]+ [a-zA-ZА-Яа-я]+$/) !== -1;
    }
    function validateEmail(email) {
        const regex = /^[A-Z0-9._%+-]+@([A-Z0-9.-]+.[A-Z]{2,4})$/im;
        if (!regex.test(email))
            return false;

        const domain = regex.exec(email)[1];
        const allowedDomain = ['ya.ru', 'yandex.ru', 'yandex.ua', 'yandex.by', 'yandex.kz', 'yandex.com'];
        if (allowedDomain.indexOf(domain) === -1)
            return false;

        return true;
    }
    function validatePhone(phone) {
        if (phone.search(/^\+\d\(\d{3}\)\d{3}-\d{2}-\d{2}$/) === -1)
            return false;

        const arr = phone.match(/\d/g)
            .map(val => parseInt(val, 10))
            .reduce((prev, cur) => prev + cur, 0);
        if (arr > 30)
            return false;

        return true;
    }
    const validate = () => {
        const formData = getData();
        const fio = formData[formElems.fio.name], 
            email = formData[formElems.email.name],
            phone = formData[formElems.phone.name];
        const fieldHasError = [
            !validateFio(fio) ? 'fio' : null, //
            !validateEmail(email) ? 'email' : null,
            !validatePhone(phone) ? 'phone' : null
        ]
            .filter(elem => elem !== null);

        return {
            isValid: fieldHasError.length === 0,
            errorFields: fieldHasError
        }
    }

    /* 
    * requests
    */
    function objToURL(obj) {
        return Object.keys(obj)
            .map(key => key + '=' + encodeURIComponent(obj[key]))
            .join('&');
    }
    function clearInputClass() {
        formElems.fio.className = '';
        formElems.email.className = '';
        formElems.phone.className = '';
    }

    function sendForm() {
        const xhr = new XMLHttpRequest();
        const url = formElems.form.action + '?' + objToURL(getData());
        xhr.open('GET', url);
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4)
                return;
            if (xhr.status === 200)
                responseCb(JSON.parse(xhr.responseText));
        }
    }
    function responseCb(data) {
        const resCont = document.getElementById('resultContainer');
        switch (data.status) {
            case 'success':
                resCont.innerText = 'Success';
                resCont.className = 'success';
                break;
            case 'error':
                resCont.innerText = data.reason;
                resCont.className = 'error';
                break;
            case 'progress':
                setTimeout(sendForm, parseInt(data.timeout));
                resCont.className = 'progress';
                break;
            default:
                break;
        }
    }

    const submit = () => {
        clearInputClass();
        const validateResult = validate();
        if (validateResult.isValid === true) {
            formElems.submit.disabled = true;
            sendForm();
        } else {
            for (let name of validateResult.errorFields)
                formElems[name].className = 'error';
        }
    }
    /* 
    * 
    */
    return {
        validate,
        getData,
        setData,
        submit,
    }
}());

document.querySelector('#submitButton').onclick = (e) => {
    MyForm.submit();
    e.preventDefault();
}