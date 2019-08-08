# Patient-facing view of the SDOH Questionnaire application
This code renders a Questionnaire FHIR resource and translates the response of the patient into a QuestionnaireResponse FHIR resource.

## Instructions
This example is built with NodeJS which must be installed on your computer. On MacOS, one way is through Homebrew with the command brew install node.

To create the server needed for this example, first install the http-server tool using the command npm install -g http-server, then navigate to the <i>patient-facing</i> directory and launch a new server with the command http-server -p 5000.

Navigate your web browser to http://localhost:5000 in order to view the example.
