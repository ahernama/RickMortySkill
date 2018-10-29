/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const episodes = require('./episodes');
var request = require("request");

////////////////////////////////
// Helper functions //
////////////////////////////////

const rickMortyCharactersApiUrl = 'https://rickandmortyapi.com/api/character/'

const SKILL_NAME = 'Rick y Morty';
const NUM_MAX_SEASONS = 3;

const welcomeMessage = '¡Bienvenidos a Rick y Morty! Puedes preguntarme sobre el nombre de un episodio o los personajes que salen en él';
const exitSkillMessage = 'Gracias por usar Rick y Morty para informarte de tu serie favorita!  Espero que vuelvas pronto!';
const helpMessage = 'Conozco el estado de todos los personajes de la serie.  Prueba a preguntarme por un episodio y dime si quieres que te diga los personajes que están vivos, muertos o que se desconoce cómo se encuentran.  ¿Qué te episodio quieres consultar?';

const errorSeasonMessage = 'Lo siento pero no he entendido el número de temporada, ¿Para cuál temporada quieres hacer el cálculo?';
const errorMaxSeasonMessage = 'La serie tiene 3 temporadas, por favor, dinos para cuál quieres hacer el cálculo';
const errorSeasonReprontMessage = 'Para poder hacer el cálculo de número de episodios, tienes que decir el número de la temporada';

const errorMaxEpisodeMessage = ', por favor dinos para cuál quieres hacer el cálculo';
const errorEpisodeMessage = 'Lo siento pero no he entendido el número de episodio, ¿A qué número de episodio te refieres?';

const errorMessage = 'Lo siento no he podido entenderte, dime de nuevo qué es lo que quieres consultar';
const errorMessageCharacters = 'Lo siento, pero no hemos podido recuperar la información sobre personajes que has solicitado';

////////////////////////////////
// Regular handlers //
////////////////////////////////

const LaunchRequestHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
      const speechText = welcomeMessage;
return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard(SKILL_NAME, speechText)
          .getResponse();
  }
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
      const speechText = helpMessage;
return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard(SKILL_NAME, speechText)
          .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
              || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
      const speechText = exitSkillMessage;
return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard(SKILL_NAME, speechText)
          .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
      //any cleanup logic goes here
      return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log("Error handled: "+error.message);
return handlerInput.responseBuilder
      .speak(errorMessage)
      .reprompt(errorMessage)
      .getResponse();
  },
};

////////////////////////////////
// Helper functions//
////////////////////////////////

const GetNumEpisodesSeasonIntentHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'GetNumEpisodesSeasonIntent';
  },
  handle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      const responseBuilder = handlerInput.responseBuilder;
      const filledSlots = request.intent.slots;
      const slotValues = getSlotValues(filledSlots);
      if(!slotValues.numSeason.resolved || slotValues.numSeason.resolved === "?" ||  slotValues.numSeason.resolved <= 0  || slotValues.numSeason.resolved > NUM_MAX_SEASONS){
          return responseBuilder
                              .speak(errorMaxSeasonMessage)
                              .reprompt(errorSeasonReprontMessage)
                              .addElicitSlotDirective('numSeason')
                              .getResponse();
      }
      var numSeason = slotValues.numSeason.resolved;
      return responseBuilder.speak(getNumEpisodesSeason(numSeason)).getResponse();
  }
};

const GetNameEpisodesSeasonIntentHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'GetNameEpisodesSeasonIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    const filledSlots = request.intent.slots;
    const slotValues = getSlotValues(filledSlots);
    if( slotValues.numSeason.resolved === "?"  || slotValues.numSeason.resolved <= 0  || slotValues.numSeason.resolved > NUM_MAX_SEASONS) {
      return responseBuilder
                          .speak(errorSeasonMessage)
                          .reprompt(errorMaxSeasonMessage)
                          .addElicitSlotDirective('numSeason')
                          .getResponse();
    }else if ( slotValues.numEpisode.resolved === "?" || slotValues.numEpisode.resolved > getNumEpisodesSeason(slotValues.numEpisode.resolved) ){
      return responseBuilder
                          .speak("La temporada "+slotValues.numEpisode.resolved+" tiene "+getNumEpisodesSeason(slotValues.numEpisode.resolved)+errorMaxEpisodeMessage)
                          .reprompt(errorEpisodeMessage)
                          .addElicitSlotDirective('numEpisode')
                          .getResponse();
    }
    var numSeason = slotValues.numSeason.resolved;
    var numEpisode = slotValues.numEpisode.resolved;
    return responseBuilder.speak(getNameEpisodeBySeasonAndNumber(numSeason,numEpisode)).getResponse();
  }
};

////////////////////////////////
// Episodes and Seasons functions//
////////////////////////////////

function getNumEpisodesSeason(numSeason){
  var currentEpisodes = getSeasonByNumber(numSeason);
  return "La temporada "+numSeason+" tiene "+currentEpisodes.length+" episodios";
}

function getNameEpisodeBySeasonAndNumber(numSeason,numEpisode){
  var currentEpisodes = getSeasonByNumber(numSeason);
  if (currentEpisodes.length >= numEpisode){
    return "El título del episodio "+numEpisode+" de la temporada "+numSeason+" es "+ currentEpisodes[numEpisode].name;
  }else{
    return "La temporada "+numSeason+" solo tiene "+ currentEpisodes.length + " episodios";
  }
}

function getSeasonByNumber(numSeason){
  var currentEpisodes = episodes.EPISODES_SEASON_1;
  switch(numSeason) {
    case 2:
        currentEpisodes = episodes.EPISODES_SEASON_2;
    case 3:
        currentEpisodes = episodes.EPISODES_SEASON_3;
    default:
        break;
  }
  return currentEpisodes;
}


////////////////////////////////
// Helper functions//
////////////////////////////////

function getSlotValues(filledSlots) {
  const slotValues = {};

  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            isValidated: true,
            isAsked:true
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].value,
            isValidated: false,
            isAsked: true
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        resolved: filledSlots[item].value,
        isValidated: false,
        isAsked: false
      };
    }
  }, this);

  return slotValues;
}

////////////////////////////////
// Code for the handlers here //
////////////////////////////////


exports.handler = Alexa.SkillBuilders.custom()
    .addErrorHandlers(ErrorHandler)
    .addRequestHandlers(LaunchRequestHandler,
                         HelpIntentHandler,
                         GetNumEpisodesSeasonIntentHandler,
                         GetNameEpisodesSeasonIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler)
     .lambda();