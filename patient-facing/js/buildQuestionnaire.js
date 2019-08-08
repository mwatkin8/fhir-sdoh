
async function launch(){
    document.getElementById('loading').style.visibility = 'visible';
    //Get data from FHIR
    let server = 'https://api.logicahealth.org/fhirlabreportsandbox/open';
    let response = await fetch(server + '/Questionnaire?title=sdoh-questionnaire-1');
    let bundle = await response.json();
    if (bundle.total !== 0){
        let r = bundle.entry[0].resource;
        let questions = r.item;
        //Create HTML elements
        let main_div = d3.select('#main');
        for (let i = 0; i < questions.length; i++){
            let row = main_div.append('div').attr('class','row');
            let question = row.append('div').attr('class','col-md-8 order-md-1');
            question.append('p').text(questions[i].text);
            let answer = row.append('div').attr('class','col-md-4 order-md-1');
            let select = answer.append('select');
            let options = questions[i].answerOption;
            select.append('option').attr('value','default').text('Select best answer');
            for (let i = 0; i < options.length; i++){
                select.append('option')
                .attr('value',options[i].valueCoding.code)
                .text(options[i].valueCoding.display);
            }
            main_div.append('br');
        }
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
    let entry = JSON.parse('{\"resource\": \"\", \"request\": {\"method\": \"POST\", \"url\": \"QuestionnaireResponse\"}}');
    entry.resource = t;
    let bundle = await JSON.parse('{\"resourceType\": \"Bundle\",\"type\": \"transaction\",\"total\": 1, \"entry\": []}')
    bundle.entry.push(entry);
}

async function buildResponse(){
    //create QuestionnaireResponse resource here
}
