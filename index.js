// ==UserScript==
// @name         PR Github Trello
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://github.com/*
// @grant        none
// @require      http://code.jquery.com/jquery-1.7.1.min.js
// @require      https://api.trello.com/1/client.js?key=c2193277e987e0f5f33523324b3ae260
// @require      https://gist.githubusercontent.com/lzientek/c39a8adf8d71804b99aab6b7cad7b2ae/raw/63cbc8dbcd8fefb5d09a379274bf8750fb82f78e/co-browser.js
// ==/UserScript==



const asyncTrello = function* (verb, url, body) {
    if(body) {
        yield new Promise((resolve, reject) => Trello[verb](url, body, resolve, reject));
    } else {
        yield new Promise((resolve, reject) => Trello[verb](url, resolve, reject));
    }
};

const asyncAuthorize = function* () {
    yield new Promise((resolve, reject) => Trello.authorize({
        type: 'popup',
        name: 'Getting Started Application',
        scope: {
            read: 'true',
            write: 'true' },
        expiration: 'never',
        success: () => {
            console.log('trello connected');
            resolve();
        },
        error:  function() {console.log('Connection to trello Failed'); reject();}
    }));
};

const idBoard = '58049dcd506f12d514f06674';
const listIds = {v1: {

}, v2: {

}};

const generateAndSetNewTitle = (currentId, prType, text) => {
    text= /\(\d+\)/.replace(text, '');
    let newVal = `[WIP] ${prType} ${currentId} - ${text}`;

    $('#pull_request_title').val(newVal);
    return newVal;
};
(function() {
    console.log('yes');
    co(function* () {
        let version = null;
        const splittedUrl = window.location.href.split('/');
        console.log('yes');
        if(splittedUrl.length >= 5) {
            version = splittedUrl[4] === 'mistertemp' ? 'v2' : splittedUrl[4] === 'mistertemp-v1' ? 'v1' : null;
        }
        if(version === null) { return ; }

        yield asyncAuthorize();

        if(splittedUrl.length >= 8 & splittedUrl[5] === 'compare')  { // compare mode
            const currentId = /^\d+/.exec(splittedUrl[7]);
            const prType = splittedUrl[6].indexOf('...') >= 0 ? splittedUrl[6].split('...')[1].toUpperCase() : splittedUrl[6].toUpperCase();

            if(!currentId) { return; }

            const cards = yield asyncTrello('get', `/boards/${idBoard}/cards`);
            const currentCard = cards.find(val => val.idShort === currentId);


        } else if(splittedUrl.length === 7 && splittedUrl[6] === 'pull') { // PR mode
            // pull request mode
        }



        const backlog = yield asyncTrello('get', '/boards/');
        const cards = yield asyncTrello('get', `/boards/${idBoard}/cards`);
        const currentCard = cards.find(val => val.idShort === currentId);
    }).then(() => console.log('youpi')).catch(console.log);
})();
