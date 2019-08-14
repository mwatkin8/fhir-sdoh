# Patient-facing view of the SDOH Questionnaire application
This code renders a Questionnaire FHIR resource and translates the response of the patient into a QuestionnaireResponse FHIR resource.

## Instructions
We will use Docker because this server has additional dependencies.  Follow [this guide](https://docs.docker.com/install/) to install Docker on your machine and check installation success with docker -v. Then follow [this guide](https://docs.docker.com/compose/install/) to install Docker Compose and check that installation with docker-compose -v.

Launch the server with the command <code>docker-compose up --build</code>

Navigate your web browser to http://localhost:5050 in order to view the example.
