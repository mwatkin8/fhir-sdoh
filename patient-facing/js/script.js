
async function launch(){
    document.getElementById('loading').style.visibility = 'visible';
    //Get data from FHIR
    let server = 'https://api.logicahealth.org/fhirlabreportsandbox/open';
    let request = new Request(server + '/Questionnaire?title=sdoh-questionnaire-1', {
        method: 'get',
        headers: {'Authorization': 'Bearer ' + window.access_token}
    });
    let response = await fetch(request);
    let bundle = await response.json();
    if (bundle.total !== 0){
        let r = bundle.entry[0].resource;
        window.qID = r.id;
        let questions = r.item;
        window.questionDict = {};
        //Create HTML elements
        let main_div = d3.select('#main');
        for (let i = 0; i < questions.length; i++){
            window.questionDict[questions[i].linkId] = questions[i].text;
            let row = main_div.append('div').attr('class','row');
            let question = row.append('div').attr('class','col-md-8 order-md-1');
            question.append('p').text(questions[i].text);
            let answer = row.append('div').attr('class','col-md-4 order-md-1');
            let select = answer.append('select').attr('id',questions[i].linkId).attr('class','question');
            let options = questions[i].answerOption;
            select.append('option').attr('value','default').text('Select best answer');
            for (let i = 0; i < options.length; i++){
                select.append('option')
                .attr('value',options[i].valueCoding.code)
                .text(options[i].valueCoding.display);
            }
            main_div.append('br');
        }
        main_div.append('hr').attr('class','mb-4').style('border','1px dashed lightgray');
        let row = main_div.append('div').attr('class','row');
        row.append('div').attr('class','col-md-4 order-md-1');
        let button = row.append('div').attr('class','col-md-4 order-md-1');
        button.append('div').attr('class','btn btn-primary btn-lg btn-block').attr('onclick','submit()').text('Submit');
        row.append('div').attr('class','col-md-4 order-md-1');
    }
    else{
        let main_div = d3.select('#main');
        main_div.append('div').append('h1').text('Error - Questionnaire resource not found on server');
    }
    document.getElementById('loading').style.visibility = 'hidden';
}

async function submit(){
    let t = await buildResponse();
    if (t === 'not complete'){
        d3.select('#title').text('Must complete ALL questions before submitting');
    }
    else{
        let entry = await JSON.parse('{\"resource\": \"\", \"request\": {\"method\": \"POST\", \"url\": \"QuestionnaireResponse\"}}');
        entry.resource = t;
        let bundle = await JSON.parse('{\"resourceType\": \"Bundle\",\"type\": \"transaction\",\"total\": 1, \"entry\": []}')
        bundle.entry.push(entry);
        let params = {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + window.access_token
            },
            body: JSON.stringify(bundle)
        };
        let result = await fetch(window.serviceUri, params);
        localStorage['server'] = window.serviceUri;
        localStorage['access_token'] = window.access_token;
        localStorage['patient_id'] = window.patient_id;
        localStorage['qID'] = window.qID;
        window.location.href = '../result.html';
    }
}

async function displayResults(){
    let list = d3.select('#resource-list');
    list.append('li').attr('onclick','viewResource(this,\'Patient\',\'' + localStorage['patient_id'] + '\')').attr('class','top').append('p').text('Patient');
    list.append('li').attr('onclick','viewResource(this,\'Questionnaire\',\'' + localStorage['qID'] + '\')').append('p').text('Questionnaire');
    let request = new Request(localStorage['server'] + '/QuestionnaireResponse?subject=' + localStorage['patient_id'] + 'questionnaire=' + localStorage['qID'], {
        method: 'get',
        headers: {'Authorization': 'Bearer ' + localStorage['access_token']}
    });
    let response = await fetch(request);
    let bundle = await response.json();
    console.log(bundle);
    for (let i = 0; i < bundle.entry.length; i++){
        let response = bundle.entry[i].resource;
        list.append('li').attr('onclick','viewResource(this,\'QuestionnaireResponse\',\'' + response.id + '\')').append('p').text('QuestionnaireResponse');
    }
}

async function buildResponse(){
    //create QuestionnaireResponse resource here
    let response = await fetch('../templates/response.json');
    let r = await response.json();
    let time = new Date(Date.now());
    r.questionnaire += window.qID;
    r.subject.reference += window.patient_id;
    r.authored = time.toISOString();
    let questions = d3.selectAll('.question')._groups[0];
    let answered = false;
    for(let i = 0; i < questions.length; i++){
        if (questions[i].value === 'default'){
            return 'not complete'
        }
        let display = '';
        for(let j = 0; j < questions[i].length; j++){
            if(questions[i].value === questions[i][j].value){
                display = questions[i][j].innerText;
            }
        }
        let item = {
            "linkId" : questions[i].id,
            "text" : window.questionDict[questions[i].id],
            "answer" : [
                {
                    "valueCoding" : {
                        "system": "http://snomed.info/sct",
                        "code": questions[i].value,
                        "display": display
                    }
                }
            ]
        }
        r.item.push(item);
    }
    return r
}

async function viewResource(li,type,id){
    let list = document.getElementsByClassName('selected');
    for (let i = 0; i < list.length; i++) {
        list[i].classList.remove('selected')
    }
    li.className += ' selected';
    let request = new Request(localStorage['server'] + '/' + type + '/' + id, {
        method: 'get',
        headers: {'Authorization': 'Bearer ' + localStorage['access_token']}
    });
    let response = await fetch(request);
    r = await response.json();
    d3.select('#view').text(JSON.stringify(r, null, 2));
}

function loadPatient(){
    // get the URL parameters received from the authorization server
    let state = getUrlParameter("state");  // session key
    let code = getUrlParameter("code");// authorization code

    // load the app parameters stored in the session
    let params = JSON.parse(sessionStorage[state]);  // load app session
    let tokenUri = params.tokenUri;
    let clientId = params.clientId;
    let secret = params.secret;
    window.serviceUri = params.serviceUri;
    let redirectUri = params.redirectUri;

    // Prep the token exchange call parameters
    let data = {
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
    };
    let options;
    if (!secret) {
        data['client_id'] = clientId;
    }
    options = {
        url: tokenUri,
        type: 'POST',
        data: data
    };
    if (secret) {
        options['headers'] = {'Authorization': 'Basic ' + btoa(clientId + ':' + secret)};
    }

    // obtain authorization token from the authorization service using the authorization code
    $.ajax(options).done(function(res){
        // should get back the access token and the patient ID
        window.access_token = res.access_token;
        window.patient_id = res.patient;
        launch();
    });

}

// Convenience function for parsing of URL parameters
// based on http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function getUrlParameter(sParam) {
    let sPageURL = window.location.search.substring(1);
    let sURLVariables = sPageURL.split('&');
    for (let i = 0; i < sURLVariables.length; i++)
    {
        let sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            let res = sParameterName[1].replace(/\+/g, '%20');
            return decodeURIComponent(res);
        }
    }
}
