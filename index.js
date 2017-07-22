// ==UserScript==
// @name         PR Github Trello
// @namespace    https://mistertemp.com/
// @version      0.2
// @updateUrl    https://raw.githubusercontent.com/lzientek/githubTrelloScript/master/index.js?token=AC4p0Hm0FWwG_KsY2PaQ5g5E2qCY20hsks5ZfIKswA%3D%3D
// @downloadUrl  https://raw.githubusercontent.com/lzientek/githubTrelloScript/master/index.js?token=AC4p0Hm0FWwG_KsY2PaQ5g5E2qCY20hsks5ZfIKswA%3D%3D
// @description  try to take over the world!
// @author       lzientek
// @match        https://github.com/*
// @connect      trello.com
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @require      http://code.jquery.com/jquery-1.7.1.min.js
// @require      https://api.trello.com/1/client.js?key=c2193277e987e0f5f33523324b3ae260
// @require      https://gist.githubusercontent.com/lzientek/c39a8adf8d71804b99aab6b7cad7b2ae/raw/63cbc8dbcd8fefb5d09a379274bf8750fb82f78e/co-browser.js
// ==/UserScript==



const asyncTrello = function* (verb, url, body) {
    return yield new Promise((resolve, reject) => GM_xmlhttpRequest({
        url: `https://api.trello.com/1${url}?key=${Trello.key()}&token=${Trello.token()}`,
        method: verb,
        fetch: fetch,
        onload: (result) =>{ resolve(JSON.parse(result.response));},
    }));
};

const asyncAuthorize = function* () {
    yield new Promise((resolve, reject) => Trello.authorize({
        type: 'popup',
        name: 'Getting Started Application',
        scope: {
            read: 'true',
            write: 'true' },
        expiration: 'never',
        success: (result) => {
            console.log('trello connected', result);
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
    text= text.replace(/\(\d+\)/, '').trim();
    let newVal = `[WIP] ${prType} ${currentId} - ${text}`;

    $('#pull_request_title').val(newVal);
    return newVal;
};

const generateAndSetGlobalText = (card, prType) => {
    const hasFrontend = card.labels.some(val => val.color === 'orange');
    const hasBackend = card.labels.some(val => val.color === 'yellow');

    let value = `## Description
${card.desc}
### Trello url
${card.url}
## Motivation and Context
\`Why is this change required? What problem does it solve?\`
## How Has This Been Tested?
${hasFrontend ? `
- [ ] Frontend component and container tests.
- [ ] Frontend e2e tests.` :''}
${hasBackend ? `- [ ] Routes tests.` :''}
${hasBackend && hasFrontend ? `- [ ] Reducer, actions and services tests.` :''}
## Types of changes
- [${prType ==='FEATURE'? 'x' : ' '}] Feature
- [${prType ==='BUGFIX'? 'x' : ' '}] Bugfix
- [${prType ==='HOTFIX'? 'x' : ' '}] Hotfix
## Checklist:
- [ ] My code follows the code style of this project.
- [ ] I have added tests to cover my changes.
- [ ] All new and existing tests passed.`;
    $('#pull_request_body').val(value);
};

(function() {
    co(function* () {
        let version = null;
        const splittedUrl = window.location.href.split('/');

        if(splittedUrl.length >= 5) {
            version = splittedUrl[4] === 'mistertemp' ? 'v2' : splittedUrl[4] === 'mistertemp-v1' ? 'v1' : null;
        }
        if(version === null) { return ; }

        yield asyncAuthorize();

        if(splittedUrl.length >= 8 & splittedUrl[5] === 'compare')  { // compare mode
            const currentId = parseInt(/^\d+/.exec(splittedUrl[7])[0]);
            const prType = splittedUrl[6].indexOf('...') >= 0 ? splittedUrl[6].split('...')[1].toUpperCase() : splittedUrl[6].toUpperCase();

            if(!currentId) { return; }

            const cards = yield asyncTrello('get', `/boards/${idBoard}/cards`);
            const currentCard = cards.find(val => val.idShort === currentId);

            generateAndSetNewTitle(currentId, prType, currentCard.name);
            generateAndSetGlobalText(currentCard, prType);
            $('.btn-link.muted-link.js-issue-assign-self').click(); // auto assign

        } else if(splittedUrl.length === 7 && splittedUrl[6] === 'pull') { // PR mode
            // pull request mode
        }
    }).then(() => console.log('success')).catch(console.log);
})();
